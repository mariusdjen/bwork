import type Stripe from "stripe";
import { stripe } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/types/billing";

/**
 * Extract period dates from a Stripe Subscription.
 * In Stripe v20+, current_period_start/end are on SubscriptionItem, not Subscription.
 */
function extractPeriodDates(subscription: Stripe.Subscription): {
  periodStart: string | null;
  periodEnd: string | null;
} {
  const item = subscription.items?.data?.[0];
  if (!item) {
    return { periodStart: null, periodEnd: null };
  }
  return {
    periodStart: item.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    periodEnd: item.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const admin = createAdminClient();
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as Plan | undefined;

  if (!userId || !plan) {
    console.error(
      "[B-WORK:stripe] Missing userId or plan in checkout session metadata",
    );
    return;
  }

  const subscription = await stripe().subscriptions.retrieve(
    session.subscription as string,
  );

  const { periodStart, periodEnd } = extractPeriodDates(subscription);

  // Update profile with Stripe customer and new plan
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      stripe_customer_id: session.customer as string,
      plan,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("[B-WORK:stripe] Failed to update profile", profileError);
    throw new Error(`Failed to update profile for user ${userId}: ${profileError.message}`);
  }

  // Insert subscription record
  const { error: subError } = await admin.from("subscriptions").insert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: session.customer as string,
    plan,
    status: subscription.status as "active" | "trialing",
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (subError) {
    console.error("[B-WORK:stripe] Failed to insert subscription", subError);
    throw new Error(`Failed to insert subscription for user ${userId}: ${subError.message}`);
  }

  console.info("[B-WORK:stripe] Subscription created", { userId, plan });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  const admin = createAdminClient();

  // Look up existing subscription to find the user
  const { data: existing } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!existing) {
    console.warn(
      "[B-WORK:stripe] Subscription not found in DB for update",
      subscription.id,
    );
    return;
  }

  // Determine plan from metadata or items
  const plan =
    (subscription.metadata?.plan as Plan) ??
    getCurrentPlanFromSubscription(subscription);

  const { periodStart, periodEnd } = extractPeriodDates(subscription);

  // Update subscription record
  await admin
    .from("subscriptions")
    .update({
      status: mapStripeStatus(subscription.status),
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan,
    })
    .eq("stripe_subscription_id", subscription.id);

  // Sync plan to profile
  await admin
    .from("profiles")
    .update({ plan })
    .eq("id", existing.user_id);

  console.info("[B-WORK:stripe] Subscription updated", {
    subscriptionId: subscription.id,
    status: subscription.status,
    plan,
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!existing) {
    console.warn(
      "[B-WORK:stripe] Subscription not found for deletion",
      subscription.id,
    );
    return;
  }

  // Downgrade to free plan
  await admin
    .from("profiles")
    .update({ plan: "free" })
    .eq("id", existing.user_id);

  await admin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  console.info("[B-WORK:stripe] Subscription canceled, user downgraded", {
    userId: existing.user_id,
  });
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // In Stripe v20+, subscription ID is under parent.subscription_details
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails?.subscription) return;

  const subscriptionId =
    typeof subDetails.subscription === "string"
      ? subDetails.subscription
      : subDetails.subscription.id;

  const admin = createAdminClient();

  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);

  console.warn("[B-WORK:stripe] Payment failed for subscription", {
    subscriptionId,
  });
}

// --- Helpers ---

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "canceled" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "trialing":
      return "trialing";
    default:
      console.warn(`[B-WORK:stripe] Unknown subscription status: ${status}`);
      return "canceled"; // fail-closed: unknown status should not grant access
  }
}

function getCurrentPlanFromSubscription(
  subscription: Stripe.Subscription,
): Plan {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return "free";

  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const businessPriceId = process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID;

  if (priceId === proPriceId) return "pro";
  if (priceId === businessPriceId) return "business";

  console.warn(`[B-WORK:stripe] Unknown price ID: ${priceId}`);
  return "free"; // fail-closed: unknown price should not grant paid access
}

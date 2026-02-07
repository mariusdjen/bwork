import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentFailed,
} from "@/lib/stripe/webhooks";

export async function POST(request: Request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[B-WORK:stripe] STRIPE_WEBHOOK_SECRET not configured");
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event;
  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(
      "[B-WORK:stripe] Webhook signature verification failed",
      err,
    );
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object,
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object,
        );
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(
          event.data.object,
        );
        break;
      default:
        console.log(
          `[B-WORK:stripe] Unhandled event type: ${event.type}`,
        );
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[B-WORK:stripe] Webhook handler error", err);
    return Response.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

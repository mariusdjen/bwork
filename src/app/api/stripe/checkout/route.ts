import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { STRIPE_PLANS } from "@/lib/stripe/plans";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Plan invalide." }, { status: 400 });
    }

    const { plan } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Non authentifie." }, { status: 401 });
    }

    // Fetch current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, plan")
      .eq("id", user.id)
      .single();

    const planConfig = STRIPE_PLANS[plan];
    if (!planConfig.priceId) {
      return Response.json(
        { error: "Ce plan n'est pas disponible en ligne." },
        { status: 400 },
      );
    }

    // If already on a paid plan, update the existing subscription with proration
    if (profile?.plan && profile.plan !== "free" && profile.stripe_customer_id) {
      // Same plan — nothing to do
      if (profile.plan === plan) {
        return Response.json(
          { error: "Vous etes deja sur ce plan." },
          { status: 400 },
        );
      }

      // Find the active subscription for this customer
      const subscriptions = await stripe().subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      const currentSub = subscriptions.data[0];
      if (!currentSub) {
        return Response.json(
          { error: "Aucun abonnement actif trouve. Contactez le support." },
          { status: 400 },
        );
      }

      // Update subscription with proration
      await stripe().subscriptions.update(currentSub.id, {
        items: [
          {
            id: currentSub.items.data[0].id,
            price: planConfig.priceId,
          },
        ],
        proration_behavior: "create_prorations",
        metadata: {
          userId: user.id,
          plan,
        },
      });

      return Response.json({ url: null, upgraded: true });
    }

    // New subscription — create Stripe Checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe().checkout.sessions.create({
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: !profile?.stripe_customer_id
        ? (user.email ?? undefined)
        : undefined,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[B-WORK:stripe] Checkout error", err);
    return Response.json(
      { error: "Impossible de creer la session de paiement." },
      { status: 500 },
    );
  }
}

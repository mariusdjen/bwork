import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Returns the Stripe SDK instance.
 * Lazily initialized to avoid crashes at import time when STRIPE_SECRET_KEY
 * is not set (e.g., during build or in environments without billing).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "[B-WORK:stripe] STRIPE_SECRET_KEY manquant dans les variables d'environnement.",
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Convenience alias — named export for ergonomic usage.
 * @example
 * import { stripe } from "@/lib/stripe/client";
 * // ...later, at call-time:
 * const session = await stripe().checkout.sessions.create(...);
 *
 * Note: this is a function, not a bare instance, to support lazy init.
 */
export const stripe = getStripe;

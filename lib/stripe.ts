// // lib/stripe.ts
// import Stripe from "stripe";
// import { loadStripe } from "@stripe/stripe-js";

// // Server-side Stripe instance (only import this in API routes or server components)
// export const getServerStripe = () => {
//   const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

//   if (!stripeSecretKey) {
//     throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
//   }

//   return new Stripe(stripeSecretKey, {
//     apiVersion: "2025-06-30.basil",
//   });
// };

// // Client-side Stripe instance
// let stripePromise: Promise<any> | null = null;

// export const getStripe = () => {
//   const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

//   if (!stripePublishableKey) {
//     throw new Error(
//       "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables"
//     );
//   }

//   if (!stripePromise) {
//     stripePromise = loadStripe(stripePublishableKey);
//   }
//   return stripePromise;
// };

// lib/stripe.ts
import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

// Use a stable API version instead of beta
const STRIPE_API_VERSION = "2024-11-20.acacia" as Stripe.LatestApiVersion;

// Server-side Stripe instance (only import this in API routes or server components)
export const getServerStripe = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
};

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null> | null = null;

export const getStripe = () => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables"
    );
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// DO NOT export server stripe instance here - it should only be used in API routes
// Remove this line if you have it in your PaymentPage component:
// export const stripe = getServerStripe();

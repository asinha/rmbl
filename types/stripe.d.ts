import { Stripe } from "stripe";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      NEXT_PUBLIC_SITE_URL: string;
      STRIPE_WEBHOOK_SECRET?: string;
    }
  }
}

export type BillingPortalParams = {
  customerId: string;
  returnUrl?: string;
  locale?: Stripe.BillingPortal.SessionCreateParams.Locale;
};

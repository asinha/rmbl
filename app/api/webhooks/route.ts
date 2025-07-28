import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Validate required components
  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Process webhook events
  try {
    switch (event.type) {
      case "billing_portal.session.created":
        const portalSession = event.data.object as Stripe.BillingPortal.Session;
        console.log(
          `Portal session created for customer: ${portalSession.customer}`
        );
        // Handle portal session creation logic here
        break;

      case "customer.subscription.created":
        const newSubscription = event.data.object as Stripe.Subscription;
        console.log(`New subscription created: ${newSubscription.id}`);
        // Handle new subscription logic here
        break;

      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        // Handle subscription updates (e.g., plan changes, status changes)
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription cancelled: ${deletedSubscription.id}`);
        // Handle subscription cancellation logic here
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice: ${invoice.id}`);
        // Handle successful payment logic here
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice: ${failedInvoice.id}`);
        // Handle failed payment logic here
        break;

      case "customer.created":
        const customer = event.data.object as Stripe.Customer;
        console.log(`New customer created: ${customer.id}`);
        // Handle new customer logic here
        break;

      case "customer.updated":
        const updatedCustomer = event.data.object as Stripe.Customer;
        console.log(`Customer updated: ${updatedCustomer.id}`);
        // Handle customer updates here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
      // Log unhandled events for debugging
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    // Still return 200 to acknowledge receipt to Stripe
    // This prevents Stripe from retrying the webhook
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}

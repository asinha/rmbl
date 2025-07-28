// import { NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import { headers } from "next/headers";
// import type { Stripe } from "stripe";

// export async function POST(request: Request) {
//   const body = await request.text();
//   const signature = headers().get("stripe-signature");

//   if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
//     return NextResponse.json(
//       { error: "Missing signature or webhook secret" },
//       { status: 400 }
//     );
//   }

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err: unknown) {
//     const error = err as Error;
//     return NextResponse.json(
//       { error: `Webhook Error: ${error.message}` },
//       { status: 400 }
//     );
//   }

//   switch (event.type) {
//     case "billing_portal.session.created":
//       const portalSession = event.data.object as Stripe.BillingPortal.Session;
//       console.log(`Portal session created for ${portalSession.customer}`);
//       break;

//     case "customer.subscription.updated":
//       const subscription = event.data.object as Stripe.Subscription;
//       console.log(`Subscription updated: ${subscription.id}`);
//       break;

//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

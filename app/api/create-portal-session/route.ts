// // pages/api/create-portal-session.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { getAuth } from "@clerk/nextjs/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
// });

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

//   const { userId } = getAuth(req);

//   if (!userId) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     // You should already have this mapping stored when user subscribes
//     const userStripeId = await getStripeCustomerIdFromDB(userId);

//     if (!userStripeId) {
//       return res.status(400).json({ error: "Stripe customer ID not found." });
//     }

//     const session = await stripe.billingPortal.sessions.create({
//       customer: userStripeId,
//       return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // redirect after portal use
//     });

//     res.status(200).json({ url: session.url });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal error creating portal session." });
//   }
// }

// // Replace with your actual DB lookup logic
// async function getStripeCustomerIdFromDB(userId: string) {
//   // Simulate DB lookup for demo
//   return "cus_1234567890"; // ← replace with actual logic
// }

// app/api/create-portal-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { customer_id, customer_email, return_url } = await request.json();

    if (!customer_email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    let customerId = customer_id;

    // If no customer ID provided, find or create customer by email
    if (!customerId) {
      const customers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer if none exists
        const customer = await stripe.customers.create({
          email: customer_email,
        });
        customerId = customer.id;
      }
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || `${request.nextUrl.origin}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

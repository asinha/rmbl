// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@/lib/generated/prisma";
import { headers } from "next/headers";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get metadata from your PaymentPortalPage
    const planType = session.metadata?.plan_type || "free";
    const billingCycle = session.metadata?.billing_cycle || "monthly";
    const couponCode = session.metadata?.coupon_code || null;
    const userId = session.metadata?.user_id; // Pass this when creating checkout

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID in metadata" },
        { status: 400 }
      );
    }

    // Set subscription details
    let endDate: Date | null = null;
    if (billingCycle === "monthly") {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: planType,
        subscriptionStatus: "active",
        subscriptionBillingCycle: billingCycle,
        subscriptionEndDate: planType === "lifetime" ? null : endDate,
      },
    });

    // Update recording limit for paid users
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: planType,
        recordingLimit: planType === "free" ? 60 : 86400, // Unlimited ~ 24hrs/day
      },
      create: {
        userId,
        plan: planType,
        recordingLimit: planType === "free" ? 60 : 86400,
      },
    });
  }

  return NextResponse.json({ received: true });
}

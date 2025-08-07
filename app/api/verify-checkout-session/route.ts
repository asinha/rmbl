// app/api/verify-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";
import { PrismaClient } from "@/lib/generated/prisma";
import Stripe from "stripe";

const stripe = getServerStripe();
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: [
        "payment_intent",
        "invoice.payment_intent",
        "subscription",
        "line_items",
      ],
    });

    console.log("✅ Stripe session:", session.id);
    console.log("🧾 Session mode:", session.mode);
    console.log("🧾 Session status:", session.status);
    console.log("🧾 Payment status:", session.payment_status);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: "Payment was not successful",
          status: session.payment_status,
          session_status: session.status,
        },
        { status: 400 }
      );
    }

    let paymentIntent: Stripe.PaymentIntent | null = null;
    let transactionId: string;
    let amount: number;

    if (session.mode === "payment") {
      paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          {
            error: "Payment was not successful",
            status: paymentIntent?.status || "unknown",
          },
          { status: 400 }
        );
      }
      transactionId = paymentIntent.id;
      amount = paymentIntent.amount / 100;
    } else if (session.mode === "subscription") {
      transactionId = session.id;
      amount = (session.amount_total || 0) / 100;

      if (session.invoice) {
        const invoice = session.invoice as Stripe.Invoice & {
          payment_intent?: Stripe.PaymentIntent;
        };
        paymentIntent = invoice?.payment_intent ?? null;
      }

      console.log("✅ Subscription session amount:", amount);
    } else {
      return NextResponse.json(
        { error: "Unsupported session mode" },
        { status: 400 }
      );
    }

    const metadata = paymentIntent?.metadata || session.metadata || {};
    const customerEmail =
      metadata.customer_email ||
      session.customer_details?.email ||
      session.customer_email ||
      "";

    // 🔥 FIX: Determine plan type based on session mode first, then metadata
    let planType: string;
    let billingCycle: string;

    if (session.mode === "payment") {
      // One-time payment = always lifetime
      planType = "lifetime";
      billingCycle = "once";
      console.log(
        "🎯 Detected one-time payment - setting plan_type to 'lifetime'"
      );
    } else if (session.mode === "subscription") {
      // Subscription = use metadata
      planType = metadata.plan_type || "monthly";
      billingCycle = metadata.billing_cycle || "monthly";
      console.log(
        "🎯 Detected subscription - using metadata plan_type:",
        planType
      );
    } else {
      // Fallback
      planType = metadata.plan_type || "free";
      billingCycle = metadata.billing_cycle || "once";
    }

    const originalPrice = metadata.original_price || amount.toString();
    const finalPrice = metadata.final_price || amount.toString();
    const couponCode = metadata.coupon_code || "";

    console.log("🔍 Final plan details:", {
      planType,
      billingCycle,
      amount,
      sessionMode: session.mode,
    });

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { stripePaymentIntentId: transactionId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Payment already recorded",
        payment_id: transactionId,
        transaction_id: existing.id,
        plan_type: existing.planType,
        billing_cycle: existing.billingCycle,
        amount: existing.finalPrice,
        currency: existing.currency,
        subscription_start: existing.paymentDate
          ? existing.paymentDate.toISOString()
          : null,
        subscription_end: null,
      });
    }

    const now = new Date();
    let endDate: Date | null = null;

    // Set end date based on billing cycle
    if (billingCycle === "monthly") {
      endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      endDate = new Date(now);
      endDate.setFullYear(now.getFullYear() + 1);
    }
    // For 'once' (lifetime), endDate stays null

    const discount = parseFloat(originalPrice) - parseFloat(finalPrice);
    const discountType = discount > 0 ? "fixed" : null;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stripePaymentIntentId: transactionId,
          stripeCustomerId: session.customer as string,
          amount: parseFloat(finalPrice),
          currency: session.currency || "usd",
          status: "completed",
          planType,
          billingCycle,
          originalPrice: parseFloat(originalPrice),
          finalPrice: parseFloat(finalPrice),
          couponCode: couponCode || null,
          discountAmount: discount,
          discountType,
          metadata,
          paymentDate: now,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: planType,
          subscriptionStatus: "active",
          subscriptionBillingCycle: billingCycle,
          subscriptionAmount: parseFloat(finalPrice),
          subscriptionStartDate: now,
          subscriptionEndDate: endDate,
          stripeCustomerId: session.customer as string,
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          userId: user.id,
          transactionId: transaction.id,
          planType,
          status: "active",
          billingCycle,
          amount: parseFloat(finalPrice),
          startDate: now,
          endDate,
        },
      });

      return { transaction, updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
      payment_id: transactionId,
      transaction_id: result.transaction.id,
      plan_type: planType, // This will now be 'lifetime' for one-time payments
      billing_cycle: billingCycle, // This will be 'once' for lifetime plans
      amount: parseFloat(finalPrice),
      currency: session.currency || "usd",
      subscription_start: now.toISOString(),
      subscription_end: endDate?.toISOString() || null,
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

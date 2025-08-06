// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";
import { PrismaClient, Prisma } from "@/lib/generated/prisma";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = getServerStripe();

export async function POST(request: NextRequest) {
  try {
    const { payment_intent } = await request.json();

    if (!payment_intent) {
      return NextResponse.json(
        { error: "Payment intent is required" },
        { status: 400 }
      );
    }

    // ✅ Retrieve payment intent with charges expanded
    const paymentIntent = (await stripe.paymentIntents.retrieve(
      payment_intent,
      {
        expand: ["charges"],
      }
    )) as unknown as Stripe.PaymentIntent & {
      charges: Stripe.ApiList<Stripe.Charge>;
    };

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // ✅ Extract metadata
    const metadata = paymentIntent.metadata || {};
    const customerEmail = metadata.customer_email || "";
    const plan_type = metadata.plan_type || "free";
    const billing_cycle = metadata.billing_cycle || "once";
    const original_price = metadata.original_price || "";
    const final_price = metadata.final_price || "0";
    const coupon_code = metadata.coupon_code || "";

    // ✅ Find user by email or Stripe customer ID
    let user = null;
    if (customerEmail) {
      user = await prisma.user.findUnique({ where: { email: customerEmail } });
    } else if (paymentIntent.customer) {
      user = await prisma.user.findUnique({
        where: { stripeCustomerId: paymentIntent.customer as string },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { stripePaymentIntentId: payment_intent },
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        payment_id: payment_intent,
        amount: final_price,
        plan_type,
        billing_cycle,
        customer_email: customerEmail,
        coupon_code: coupon_code || null,
        message: "Payment already processed",
      });
    }

    // ✅ Calculate subscription dates
    const startDate = new Date();
    let endDate: Date | null = null;

    if (billing_cycle === "monthly") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billing_cycle === "yearly") {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // ✅ Calculate discount
    let discountAmount = 0;
    let discountType: string | null = null;

    if (coupon_code && original_price && final_price) {
      discountAmount = parseFloat(original_price) - parseFloat(final_price);
      discountType = discountAmount > 0 ? "fixed" : null;
    }

    // ✅ Save transaction + update user
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: user!.id,
            stripePaymentIntentId: payment_intent,
            stripeCustomerId: (paymentIntent.customer as string) || null,
            amount: parseFloat(final_price || "0"),
            currency: paymentIntent.currency,
            status: "completed",
            planType: plan_type,
            billingCycle: billing_cycle,
            originalPrice: original_price ? parseFloat(original_price) : null,
            finalPrice: parseFloat(final_price || "0"),
            couponCode: coupon_code || null,
            discountAmount,
            discountType,
            metadata,
            paymentDate: new Date(),
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: user!.id },
          data: {
            subscriptionPlan: plan_type,
            subscriptionStatus: "active",
            subscriptionBillingCycle: billing_cycle,
            subscriptionAmount: parseFloat(final_price || "0"),
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            stripeCustomerId:
              (paymentIntent.customer as string) || user!.stripeCustomerId,
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            userId: user!.id,
            transactionId: transaction.id,
            planType: plan_type,
            status: "active",
            billingCycle: billing_cycle,
            amount: parseFloat(final_price || "0"),
            startDate,
            endDate,
          },
        });

        return { transaction, updatedUser };
      }
    );

    return NextResponse.json({
      success: true,
      payment_id: payment_intent,
      amount: final_price,
      plan_type,
      billing_cycle,
      customer_email: customerEmail,
      coupon_code: coupon_code || null,
      transaction_id: result.transaction.id,
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate?.toISOString() || null,
      message: "Payment verified and subscription activated successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

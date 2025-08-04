// import { NextRequest, NextResponse } from "next/server";
// import { getServerStripe } from "@/lib/stripe";

// const stripe = getServerStripe();

// export async function POST(request: NextRequest) {
//   try {
//     const { payment_intent, redirect_status } = await request.json();

//     if (!payment_intent) {
//       return NextResponse.json(
//         { error: "Payment intent is required" },
//         { status: 400 }
//       );
//     }

//     // Retrieve the payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

//     if (paymentIntent.status !== "succeeded") {
//       return NextResponse.json(
//         { error: "Payment was not successful" },
//         { status: 400 }
//       );
//     }

//     // Extract metadata from the payment intent
//     const metadata = paymentIntent.metadata;
//     const {
//       customer_email,
//       plan_type,
//       billing_cycle,
//       final_price,
//       coupon_code,
//     } = metadata;

//     // Here you would typically:
//     // 1. Update user's subscription in your database
//     // 2. Send confirmation email
//     // 3. Log the successful payment

//     // Example database update (replace with your actual database logic):
//     /*
//     await prisma.user.update({
//       where: { email: customer_email },
//       data: {
//         subscriptionPlan: plan_type,
//         subscriptionStatus: 'active',
//         subscriptionBillingCycle: billing_cycle,
//         subscriptionAmount: parseFloat(final_price),
//         subscriptionStartDate: new Date(),
//         // Add other relevant fields
//       },
//     });

//     // Create payment record
//     await prisma.payment.create({
//       data: {
//         stripePaymentIntentId: payment_intent,
//         userEmail: customer_email,
//         amount: parseFloat(final_price),
//         currency: paymentIntent.currency,
//         status: 'completed',
//         planType: plan_type,
//         billingCycle: billing_cycle,
//         couponCode: coupon_code || null,
//       },
//     });
//     */

//     // Return success response with payment details
//     return NextResponse.json({
//       success: true,
//       payment_id: payment_intent,
//       amount: final_price,
//       plan_type: plan_type,
//       billing_cycle: billing_cycle,
//       customer_email: customer_email,
//       coupon_code: coupon_code || null,
//       message: "Payment verified and subscription activated successfully",
//     });
//   } catch (error) {
//     console.error("Payment verification error:", error);

//     return NextResponse.json(
//       {
//         error: "Failed to verify payment",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = getServerStripe();

export async function POST(request: NextRequest) {
  try {
    const { payment_intent, redirect_status } = await request.json();

    if (!payment_intent) {
      return NextResponse.json(
        { error: "Payment intent is required" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // Extract metadata from the payment intent
    const metadata = paymentIntent.metadata;
    const {
      customer_email,
      plan_type,
      billing_cycle,
      original_price,
      final_price,
      coupon_code,
    } = metadata;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer_email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { stripePaymentIntentId: payment_intent },
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        payment_id: payment_intent,
        amount: final_price,
        plan_type: plan_type,
        billing_cycle: billing_cycle,
        customer_email: customer_email,
        coupon_code: coupon_code || null,
        message: "Payment already processed",
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    let endDate: Date | null = null;

    if (billing_cycle === "monthly") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billing_cycle === "yearly") {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // lifetime has no end date

    // Calculate discount amount
    let discountAmount = 0;
    let discountType: string | null = null;

    if (coupon_code && original_price && final_price) {
      discountAmount = parseFloat(original_price) - parseFloat(final_price);
      // You could determine discount type from your coupon logic
      discountType = discountAmount > 0 ? "fixed" : null;
    }

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stripePaymentIntentId: payment_intent,
          stripeCustomerId: (paymentIntent.customer as string) || null,
          amount: parseFloat(final_price),
          currency: paymentIntent.currency,
          status: "completed",
          planType: plan_type,
          billingCycle: billing_cycle,
          originalPrice: original_price ? parseFloat(original_price) : null,
          finalPrice: parseFloat(final_price),
          couponCode: coupon_code || null,
          discountAmount: discountAmount,
          discountType: discountType,
          metadata: metadata,
          paymentDate: new Date(),
        },
      });

      // Update user subscription
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: plan_type,
          subscriptionStatus: "active",
          subscriptionBillingCycle: billing_cycle,
          subscriptionAmount: parseFloat(final_price),
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          stripeCustomerId:
            (paymentIntent.customer as string) || user.stripeCustomerId,
        },
      });

      // Create subscription history entry
      await tx.subscriptionHistory.create({
        data: {
          userId: user.id,
          transactionId: transaction.id,
          planType: plan_type,
          status: "active",
          billingCycle: billing_cycle,
          amount: parseFloat(final_price),
          startDate: startDate,
          endDate: endDate,
        },
      });

      return { transaction, updatedUser };
    });

    // TODO: Send confirmation email
    // await sendConfirmationEmail(customer_email, result.transaction);

    // TODO: Trigger webhook for third-party integrations
    // await triggerWebhook('subscription.activated', result.updatedUser);

    // Return success response with payment details
    return NextResponse.json({
      success: true,
      payment_id: payment_intent,
      amount: final_price,
      plan_type: plan_type,
      billing_cycle: billing_cycle,
      customer_email: customer_email,
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
import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";

const stripe = getServerStripe();

export async function POST(request: NextRequest) {
  try {
    const { payment_intent, redirect_status } = await request.json();

    if (!payment_intent) {
      return NextResponse.json(
        { error: "Payment intent is required" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // Extract metadata from the payment intent
    const metadata = paymentIntent.metadata;
    const {
      customer_email,
      plan_type,
      billing_cycle,
      final_price,
      coupon_code,
    } = metadata;

    // Here you would typically:
    // 1. Update user's subscription in your database
    // 2. Send confirmation email
    // 3. Log the successful payment

    // Example database update (replace with your actual database logic):
    /*
    await prisma.user.update({
      where: { email: customer_email },
      data: {
        subscriptionPlan: plan_type,
        subscriptionStatus: 'active',
        subscriptionBillingCycle: billing_cycle,
        subscriptionAmount: parseFloat(final_price),
        subscriptionStartDate: new Date(),
        // Add other relevant fields
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        stripePaymentIntentId: payment_intent,
        userEmail: customer_email,
        amount: parseFloat(final_price),
        currency: paymentIntent.currency,
        status: 'completed',
        planType: plan_type,
        billingCycle: billing_cycle,
        couponCode: coupon_code || null,
      },
    });
    */

    // Return success response with payment details
    return NextResponse.json({
      success: true,
      payment_id: payment_intent,
      amount: final_price,
      plan_type: plan_type,
      billing_cycle: billing_cycle,
      customer_email: customer_email,
      coupon_code: coupon_code || null,
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
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

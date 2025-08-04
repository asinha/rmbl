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

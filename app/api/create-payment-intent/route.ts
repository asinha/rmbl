// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      currency = "usd",
      metadata = {},
      customer_email,
    } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!customer_email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    const stripe = getServerStripe();

    // Merge default metadata with any passed from frontend
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires cents
      currency,
      metadata: {
        ...metadata,
        customer_email, // Always include customer email
        original_price: metadata.original_price || amount.toString(),
        final_price: amount.toString(),
      },
      receipt_email: customer_email,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

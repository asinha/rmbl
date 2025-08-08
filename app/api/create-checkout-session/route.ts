import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { price_id, customer_email, success_url, cancel_url, metadata } =
      body;

    console.log("Received body:", body);

    // Validate required fields
    if (!price_id || !customer_email || !success_url || !cancel_url) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: price_id, customer_email, success_url, cancel_url",
        },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customer_email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customer_email,
        metadata: {
          user_id: metadata?.user_id || "",
        },
      });
    }

    // Retrieve the price to determine if it's recurring or one-time
    const price = await stripe.prices.retrieve(price_id);
    const isRecurring = price.type === "recurring";

    // Determine the correct plan type based on price type and metadata
    let planType = metadata?.plan_type || "monthly";
    if (!isRecurring) {
      planType = "lifetime"; // Force lifetime for one-time payments
    }

    // Create session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: isRecurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: success_url.includes("{CHECKOUT_SESSION_ID}")
        ? success_url
        : `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        ...metadata,
        customer_email: customer_email,
        price_id: price_id,
        plan_type: planType,
        billing_cycle: isRecurring
          ? metadata?.billing_cycle || "monthly"
          : "once",
      },
    };

    // Add subscription_data for recurring prices
    if (isRecurring) {
      sessionConfig.subscription_data = {
        metadata: {
          ...metadata,
          price_id: price_id,
          plan_type: planType,
          billing_cycle: metadata?.billing_cycle || "monthly",
        },
      };
    }

    console.log(
      "Creating checkout session with config:",
      JSON.stringify(sessionConfig, null, 2)
    );

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

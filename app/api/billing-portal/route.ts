import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BillingPortalParams } from "@/types/stripe";

export async function POST(request: Request) {
  try {
    const { customerId, returnUrl } =
      (await request.json()) as BillingPortalParams;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    console.error("Stripe Portal Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

"use client";

// app/pricing/page.tsx
import { Check } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/pricingButton";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  period: string;
  features: string[];
  cta: string;
  mostPopular?: boolean;
}

export default async function PricingPage() {
  // Fetch prices from Stripe
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  // Define plans with Stripe price IDs
  const plans: PricingPlan[] = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$10",
      priceId:
        prices.data.find((p) => p.recurring?.interval === "month")?.id ||
        "price_monthly",
      period: "per month",
      features: [
        "All basic features",
        "24/7 customer support",
        "1GB storage",
        "Basic analytics",
      ],
      cta: "Get Started",
    },
    {
      id: "annual",
      name: "Annual",
      price: "$96",
      priceId:
        prices.data.find((p) => p.recurring?.interval === "year")?.id ||
        "price_annual",
      period: "per year (20% off)",
      features: [
        "Everything in Monthly",
        "Priority support",
        "10GB storage",
        "Advanced analytics",
      ],
      cta: "Save 20%",
      mostPopular: true,
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$299",
      priceId: "price_lifetime",
      period: "one-time payment",
      features: [
        "Everything in Annual",
        "Unlimited storage",
        "Dedicated account manager",
        "Custom reporting",
      ],
      cta: "Buy Once",
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the perfect plan for your needs. Cancel anytime.
          </p>
        </div>

        {/* Coupon Input */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-md">
            <label
              htmlFor="coupon"
              className="block text-sm font-medium text-gray-700"
            >
              Have a coupon?
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="coupon"
                id="coupon"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Enter coupon code"
              />
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                plan.mostPopular ? "bg-gray-900 text-white" : "bg-white"
              }`}
            >
              {plan.mostPopular && (
                <p className="text-sm font-semibold leading-6 text-indigo-400">
                  Most popular
                </p>
              )}
              <h3
                className={`text-2xl font-bold ${
                  plan.mostPopular ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-6 flex items-baseline gap-x-2">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    plan.mostPopular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm font-semibold leading-6 ${
                    plan.mostPopular ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <Button
                className={`mt-6 w-full ${
                  plan.mostPopular
                    ? "bg-indigo-500 hover:bg-indigo-400"
                    : "bg-gray-900 hover:bg-gray-700"
                }`}
                aria-label={`Get started with ${plan.name} plan`}
                onClick={() => handleCheckout(plan.priceId)}
              >
                {plan.cta}
              </Button>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  plan.mostPopular ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-5 w-5 flex-none ${
                        plan.mostPopular ? "text-indigo-400" : "text-indigo-600"
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Handle checkout with coupon support
async function handleCheckout(priceId: string, coupon?: string) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priceId, coupon }),
  });

  const { url } = await response.json();
  window.location.href = url;
}

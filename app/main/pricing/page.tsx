import { stripe } from "@/lib/stripe";
import type { Stripe } from "stripe";

export default async function PricingPage() {
  // Fetch prices from Stripe
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: "$10",
      priceId:
        prices.data.find((p: Stripe.Price) => p.recurring?.interval === "month")
          ?.id || "price_monthly",
      period: "per month",
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    {
      name: "Pro Plan",
      price: "$25",
      priceId:
        prices.data.find(
          (p: Stripe.Price) =>
            p.recurring?.interval === "month" && p.unit_amount === 2500
        )?.id || "price_pro_monthly",
      period: "per month",
      features: [
        "Everything in Basic",
        "Advanced Feature 1",
        "Advanced Feature 2",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: "$100",
      priceId:
        prices.data.find((p: Stripe.Price) => p.recurring?.interval === "year")
          ?.id || "price_enterprise_yearly",
      period: "per year",
      features: [
        "Everything in Pro",
        "Custom Integration",
        "Dedicated Support",
        "Advanced Analytics",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {plan.price}
              </div>
              <div className="text-gray-600">{plan.period}</div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <form action="/api/create-checkout-session" method="POST">
              <input type="hidden" name="priceId" value={plan.priceId} />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}

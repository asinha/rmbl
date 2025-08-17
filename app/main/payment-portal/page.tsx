"use client";

import PaymentPage from "@/components/PaymentPage";
import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";

// Define plan configurations
const planConfigs = {
  monthly: {
    price: 0.99,
    title: "Monthly Plan",
    description: "Unlimited recording time and premium features",
    billing_cycle: "monthly",
    features: [
      "Unlimited recordings",
      "High-quality transcriptions",
      "Basic support",
      "Daily usage analytics",
    ],
  },
  annual: {
    price: 19.99,
    title: "Annual Plan",
    description: "Unlimited recording time and premium features (Save 17%)",
    billing_cycle: "yearly",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Advanced analytics",
      "Save $20 per year",
    ],
  },
  lifetime: {
    price: 99,
    title: "Lifetime Plan",
    description: "All features plus priority support and advanced analytics",
    billing_cycle: "once",
    features: [
      "Everything in Annual",
      "Lifetime access",
      "Premium support",
      "All future updates",
      "One-time payment",
    ],
  },
};

function PaymentPortalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-green-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-green-200 rounded w-1/2 mx-auto"></div>
          <div className="h-24 bg-green-100 rounded-lg mt-6"></div>
          <div className="space-y-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-green-200 rounded w-full"></div>
            ))}
          </div>
          <div className="h-12 bg-green-200 rounded-lg mt-8"></div>
        </div>
      </div>
    </div>
  );
}

function PaymentPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get plan from URL parameters
  const planParam = searchParams.get("plan") || "monthly";
  const validPlanTypes = ["monthly", "annual", "lifetime"] as const;
  type PlanType = (typeof validPlanTypes)[number];
  const planType: PlanType = validPlanTypes.includes(planParam as PlanType)
    ? (planParam as PlanType)
    : "monthly";

  const selectedPlan = planConfigs[planType];

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/main/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return <PaymentPortalLoading />;
  }

  const customerEmail = user?.primaryEmailAddress?.emailAddress || "";

  const formatPriceDisplay = () => {
    if (selectedPlan.billing_cycle === "once") {
      return `$${selectedPlan.price}`;
    } else if (selectedPlan.billing_cycle === "yearly") {
      return `$${selectedPlan.price}/year`;
    } else {
      return `$${selectedPlan.price}/month`;
    }
  };

  const productMetadata: Record<string, string> = {
    product_id: `plan_${planType}`,
    plan_type: planType,
    billing_cycle: selectedPlan.billing_cycle,
    user_id: user.id,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-green-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 w-full"></div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedPlan.title}
            </h1>
            <p className="text-green-600 mt-2">{selectedPlan.description}</p>
          </div>

          {/* User info */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
            <p className="text-sm text-green-800 font-medium">
              <span className="font-semibold">Account:</span> {customerEmail}
            </p>
          </div>

          {/* Price display */}
          <div className="bg-green-50 rounded-xl p-6 mb-6 text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600">
              {formatPriceDisplay()}
            </div>
            <p className="text-sm text-green-700 mt-1">
              {selectedPlan.billing_cycle === "once"
                ? "One-time payment"
                : `Billed ${selectedPlan.billing_cycle}ly`}
            </p>
          </div>

          {/* Features list */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Plan includes:
            </h3>
            <ul className="space-y-3">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment component */}
          <PaymentPage
            planType={planType}
            amount={selectedPlan.price}
            currency="usd"
            metadata={productMetadata}
            customerEmail={customerEmail}
          />

          {/* Back button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              ← Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPortalPage() {
  return (
    <Suspense fallback={<PaymentPortalLoading />}>
      <PaymentPortalContent />
    </Suspense>
  );
}

"use client";

import PaymentPage from "@/components/PaymentPage";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

// Define plan configurations - these should match your server-side validation
const planConfigs = {
  monthly: {
    price: 0.99,
    title: "Monthly Plan",
    description: "Unlimited recording time and premium features",
    billing_cycle: "monthly",
    supportsCoupons: false,
  },
  annual: {
    price: 19.99,
    title: "Annual Plan",
    description: "Unlimited recording time and premium features (Save 17%)",
    billing_cycle: "yearly",
    supportsCoupons: true,
  },
  lifetime: {
    price: 99,
    title: "Lifetime Plan",
    description: "All features plus priority support and advanced analytics",
    billing_cycle: "once",
    supportsCoupons: true,
  },
};

// Loading component for Suspense fallback
function PaymentPortalLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get plan from URL parameters, default to 'monthly'
  const planParam = searchParams.get("plan") || "monthly";

  // Validate and cast to proper plan type
  const validPlanTypes = ["monthly", "annual", "lifetime"] as const;
  type PlanType = (typeof validPlanTypes)[number];

  const planType: PlanType = validPlanTypes.includes(planParam as PlanType)
    ? (planParam as PlanType)
    : "monthly";

  // Get plan configuration, fallback to monthly if invalid plan
  const selectedPlan = planConfigs[planType];

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(selectedPlan.price);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Reset coupon when plan changes
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setFinalPrice(selectedPlan.price);
  }, [planType, selectedPlan.price]);

  // Handle redirect when user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/main/sign-in");
    }
  }, [isLoaded, user, router]);

  // ✅ NOW you can have conditional returns AFTER all hooks
  if (!isLoaded) {
    return <PaymentPortalLoading />;
  }

  if (!user) {
    // Show loading while redirecting
    return <PaymentPortalLoading />;
  }

  // Use authenticated user's email
  const customerEmail = user?.primaryEmailAddress?.emailAddress || "";

  // Server-side coupon validation
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          planType: planType,
          originalPrice: selectedPlan.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || "Invalid coupon code");
        return;
      }

      if (data.success) {
        setFinalPrice(data.discountedPrice);
        setAppliedCoupon(data.couponCode);
        setCouponError("");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setFinalPrice(selectedPlan.price);
  };

  const formatPriceDisplay = () => {
    if (selectedPlan.billing_cycle === "once") {
      return `$${finalPrice}`;
    } else if (selectedPlan.billing_cycle === "yearly") {
      return `$${finalPrice}/year`;
    } else {
      return `$${finalPrice}/month`;
    }
  };

  // Sanitized metadata - no sensitive data
  const productMetadata: Record<string, string> = {
    product_id: `plan_${planType}`,
    plan_type: planType,
    billing_cycle: selectedPlan.billing_cycle,
    user_id: user.id,
    // Don't include actual prices or customer email in metadata
    // These will be validated server-side
    ...(appliedCoupon && { coupon_code: appliedCoupon }),
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {selectedPlan.title}
        </h1>

        <p className="text-gray-600 text-center mb-8">
          {selectedPlan.description}
        </p>

        {/* User info display */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Account:</strong> {customerEmail}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Plan:</span>
            <span className="text-lg">{selectedPlan.title}</span>
          </div>

          {/* Original Price (show if coupon is applied) */}
          {appliedCoupon && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-semibold">Original Price:</span>
              <span className="text-lg line-through text-gray-500">
                {selectedPlan.billing_cycle === "once"
                  ? `$${selectedPlan.price}`
                  : `$${selectedPlan.price}/${
                      selectedPlan.billing_cycle === "yearly" ? "year" : "month"
                    }`}
              </span>
            </div>
          )}

          {/* Final Price */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-semibold">
              {appliedCoupon ? "Final Price:" : "Price:"}
            </span>
            <span className="text-2xl font-bold text-green-600">
              {formatPriceDisplay()}
            </span>
          </div>

          {/* Coupon Applied Info */}
          {appliedCoupon && (
            <div className="flex justify-between items-center mt-2 p-3 bg-green-100 rounded-md">
              <span className="text-sm text-green-800">
                Coupon "{appliedCoupon}" applied successfully
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-green-800 hover:text-green-900"
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Coupon Input Section */}
        {selectedPlan.supportsCoupons && !appliedCoupon && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Have a coupon code?</h3>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  // Sanitize input - only alphanumeric characters
                  const sanitized = e.target.value
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase();
                  setCouponCode(sanitized);
                  setCouponError("");
                }}
                className="flex-1"
                maxLength={20}
                disabled={isValidatingCoupon}
              />
              <Button
                onClick={applyCoupon}
                disabled={!couponCode.trim() || isValidatingCoupon}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isValidatingCoupon ? "Validating..." : "Apply"}
              </Button>
            </div>
            {couponError && (
              <p className="text-red-500 text-sm mt-2">{couponError}</p>
            )}
          </div>
        )}

        <PaymentPage
          planType={planType}
          amount={finalPrice}
          currency="usd"
          metadata={productMetadata}
          customerEmail={customerEmail}
          originalPrice={selectedPlan.price}
        />
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

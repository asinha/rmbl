"use client";

import PaymentPage from "@/components/PaymentPage";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define plan configurations
const planConfigs = {
  monthly: {
    price: 9.99,
    title: "Monthly Plan",
    description: "Unlimited recording time and premium features",
    billing_cycle: "monthly",
    supportsCoupons: false,
  },
  annual: {
    price: 99.99,
    title: "Annual Plan",
    description: "Unlimited recording time and premium features (Save 17%)",
    billing_cycle: "yearly",
    supportsCoupons: true,
  },
  lifetime: {
    price: 299,
    title: "Lifetime Plan",
    description: "All features plus priority support and advanced analytics",
    billing_cycle: "once",
    supportsCoupons: true,
  },
};

// Define available coupons
const availableCoupons: Record<
  string,
  {
    type: "percentage" | "fixed";
    value: number;
    description: string;
    validFor: string[];
  }
> = {
  SAVE20: {
    type: "percentage",
    value: 20,
    description: "20% off",
    validFor: ["annual", "lifetime"],
  },
  EARLY50: {
    type: "percentage",
    value: 50,
    description: "50% off early bird special",
    validFor: ["lifetime"],
  },
  DISCOUNT25: {
    type: "fixed",
    value: 25,
    description: "$25 off",
    validFor: ["annual", "lifetime"],
  },
};

function PaymentPortalContent() {
  const searchParams = useSearchParams();

  // Get plan from URL parameters, default to 'monthly'
  const planParam = searchParams.get("plan") || "monthly";
  const customerEmail = searchParams.get("customer_email") || "";

  // Get plan configuration, fallback to monthly if invalid plan
  const selectedPlan =
    planConfigs[planParam as keyof typeof planConfigs] || planConfigs.monthly;

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(selectedPlan.price);

  // Reset coupon when plan changes
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setFinalPrice(selectedPlan.price);
  }, [planParam, selectedPlan.price]);

  const applyCoupon = () => {
    const couponKey = couponCode.toUpperCase();
    const coupon = availableCoupons[couponKey];

    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    if (!coupon.validFor.includes(planParam)) {
      setCouponError(`This coupon is not valid for the ${selectedPlan.title}`);
      return;
    }

    // Calculate discounted price
    let discountedPrice = selectedPlan.price;
    if (coupon.type === "percentage") {
      discountedPrice = selectedPlan.price * (1 - coupon.value / 100);
    } else if (coupon.type === "fixed") {
      discountedPrice = Math.max(0, selectedPlan.price - coupon.value);
    }

    setFinalPrice(Math.round(discountedPrice * 100) / 100);
    setAppliedCoupon(couponKey);
    setCouponError("");
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

  const productMetadata: Record<string, string> = {
    product_id: `plan_${planParam}`,
    customer_email: customerEmail,
    plan_type: planParam,
    billing_cycle: selectedPlan.billing_cycle,
    original_price: selectedPlan.price.toString(),
    final_price: finalPrice.toString(),
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
                Coupon "{appliedCoupon}" applied:{" "}
                {availableCoupons[appliedCoupon].description}
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
                  setCouponCode(e.target.value);
                  setCouponError("");
                }}
                className="flex-1"
              />
              <Button
                onClick={applyCoupon}
                disabled={!couponCode.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="text-red-500 text-sm mt-2">{couponError}</p>
            )}
          </div>
        )}

        <PaymentPage
          amount={finalPrice}
          currency="usd"
          metadata={productMetadata}
        />
      </div>
    </div>
  );
}

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

export default function PaymentPortalPage() {
  return (
    <Suspense fallback={<PaymentPortalLoading />}>
      <PaymentPortalContent />
    </Suspense>
  );
}

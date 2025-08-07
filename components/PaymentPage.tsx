// components/PaymentPage.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PaymentPageProps {
  planType: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  customerEmail: string;
  originalPrice?: number; // Add original price for coupon tracking
}

export default function PaymentPage({
  planType,
  amount,
  currency,
  metadata,
  customerEmail,
  originalPrice,
}: PaymentPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRedirect = async () => {
    setIsLoading(true);

    try {
      // Prepare the request body for checkout
      const checkoutData: any = {
        customer_email: customerEmail,
        success_url: `${window.location.origin}/main/payment-success`,
        cancel_url: `${window.location.origin}/main/payment-cancelled`,
        metadata: {
          ...metadata,
          // Include pricing information in metadata for verification
          original_price: originalPrice?.toString() || amount.toString(),
          final_price: amount.toString(),
        },
      };

      // For coupons or custom pricing, use dynamic pricing instead of price_id
      const hasCoupon =
        metadata.coupon_code && originalPrice && originalPrice !== amount;

      if (hasCoupon) {
        // Use dynamic pricing for coupon discounts
        checkoutData.amount = amount;
        checkoutData.currency = currency;
        console.log("Using dynamic pricing for coupon:", {
          originalPrice,
          finalPrice: amount,
          coupon: metadata.coupon_code,
        });
      } else {
        // Use pre-created price_id for standard pricing
        const priceIds = {
          monthly: "price_1RtN6sGpqS6YukBt9uqSXvDI", // Your monthly price ID
          annual: "price_1RtN6sGpqS6YukBt9uqSXvDI", // Your annual price ID
          lifetime: "price_1RtN6sGpqS6YukBt9uqSXvDI", // Your lifetime price ID
        };

        checkoutData.price_id = priceIds[planType as keyof typeof priceIds];
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("checkout error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleRedirect}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
        size="lg"
      >
        {isLoading
          ? "Processing..."
          : `Pay ${currency.toUpperCase()} $${amount}`}
      </Button>

      {metadata.coupon_code && originalPrice && originalPrice !== amount && (
        <p className="text-sm text-green-600 text-center">
          🎉 Coupon "{metadata.coupon_code}" applied! You save $
          {(originalPrice - amount).toFixed(2)}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}

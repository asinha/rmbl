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
}

export default function PaymentPage({
  planType,
  amount,
  currency,
  metadata,
  customerEmail,
}: PaymentPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRedirect = async () => {
    setIsLoading(true);

    try {
      // Map plan types to your Stripe price IDs
      const priceIds = {
        monthly: "price_1RtN6sGpqS6YukBt9uqSXvDI", // Your existing monthly price ID
        annual: "price_1RtN8LGpqS6YukBtFqrhbF9J", // TODO: Replace with your actual annual price ID
        lifetime: "price_1RtNBUGpqS6YukBtX9EyqgTo", // TODO: Replace with your actual lifetime price ID
      };

      const priceId = priceIds[planType as keyof typeof priceIds];

      if (!priceId) {
        throw new Error(`Invalid plan type: ${planType}`);
      }

      const checkoutData = {
        price_id: priceId,
        customer_email: customerEmail,
        success_url: `${window.location.origin}/main/payment-success`,
        cancel_url: `${window.location.origin}/main/payment-cancelled`,
        metadata: metadata,
      };

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

      <p className="text-xs text-gray-500 text-center">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}

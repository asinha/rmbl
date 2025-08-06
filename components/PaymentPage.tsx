// pages/checkout.tsx or components/PaymentPage.tsx
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "../lib/stripe";
import CheckoutForm from "./CheckoutForm";

interface PaymentPageProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
}

export default function PaymentPage({
  amount,
  currency = "usd",
  metadata = {},
}: PaymentPageProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency,
            metadata,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency, metadata]);

  const appearance = {
    theme: "stripe" as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Payment</h2>

      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <p className="text-lg font-semibold">
          Total: ${amount.toFixed(2)} {currency.toUpperCase()}
        </p>
      </div>

      {clientSecret && (
        <Elements options={options} stripe={getStripe()}>
          <CheckoutForm
            onSuccess={() => {
              console.log("Payment successful!");
              // Handle successful payment
            }}
            onError={(error) => {
              console.error("Payment failed:", error);
              // Handle payment error
            }}
          />
        </Elements>
      )}
    </div>
  );
}

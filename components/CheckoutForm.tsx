// components/CheckoutForm.tsx
import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred");
        onError?.(error.message || "An error occurred");
      } else {
        setMessage("An unexpected error occurred.");
        onError?.("An unexpected error occurred.");
      }
    } else {
      onSuccess?.();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{isLoading ? "Processing..." : "Pay now"}</span>
      </button>

      {message && <div className="text-red-600 text-sm mt-2">{message}</div>}
    </form>
  );
}

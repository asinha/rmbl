"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentPageProps {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  customerEmail: string;
}

export default function PaymentPage({
  amount,
  currency,
  metadata,
  customerEmail,
}: PaymentPageProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          metadata,
          customer_email: customerEmail, // ✅ Always send email
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create payment intent");

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error creating payment intent:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!clientSecret ? (
        <Button
          onClick={createPaymentIntent}
          disabled={loading || !customerEmail}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </Button>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
}

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/main/payment-success`,
      },
    });

    if (error) {
      console.error(error.message);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-blue-600 hover:bg-blue-700 w-full"
      >
        {submitting ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

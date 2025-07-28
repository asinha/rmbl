"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

interface BillingPortalButtonProps {
  customerId: string;
  className?: string;
  loadingText?: string;
  buttonText?: string;
}

export function BillingPortalButton({
  customerId,
  className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50",
  loadingText = "Loading...",
  buttonText = "Manage Billing",
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (error: unknown) {
      console.error("Portal redirect failed:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePortal}
        disabled={loading}
        className={className}
        aria-busy={loading}
      >
        {loading ? loadingText : buttonText}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

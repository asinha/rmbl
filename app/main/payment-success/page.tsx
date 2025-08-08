"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentDetails {
  success: boolean;
  message: string;
  payment_id: string;
  transaction_id: string;
  subscription_start: string;
  subscription_end: string | null;
  plan_type?: string;
  billing_cycle?: string;
  amount?: number;
  currency?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (!sessionId) {
          setError("No session ID found in URL.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/verify-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to verify checkout session"
          );
        }

        const data = await res.json();
        console.log("Payment verification response:", data);
        setPaymentDetails(data);

        // Trigger header refresh by setting a localStorage flag
        // This works even in the same tab
        localStorage.setItem("subscription_updated", "true");

        // Also dispatch a custom event for same-tab communication
        window.dispatchEvent(new CustomEvent("subscriptionUpdated"));
      } catch (err) {
        console.error("Verification error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify your payment. Please contact support."
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const formatPlanType = (planType?: string) =>
    planType
      ? planType
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Unknown Plan";

  const formatBillingCycle = (billingCycle?: string) => {
    switch (billingCycle) {
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      case "once":
        return "One-time";
      default:
        return billingCycle
          ? billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)
          : "Unknown";
    }
  };

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying your payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/main/pricing")}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/main")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your subscription has been activated.
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              Payment Details:
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              {paymentDetails.plan_type && (
                <div className="flex justify-between">
                  <span>Plan Type:</span>
                  <span className="font-medium">
                    {formatPlanType(paymentDetails.plan_type)}
                  </span>
                </div>
              )}
              {paymentDetails.billing_cycle && (
                <div className="flex justify-between">
                  <span>Billing Cycle:</span>
                  <span className="font-medium">
                    {formatBillingCycle(paymentDetails.billing_cycle)}
                  </span>
                </div>
              )}
              {paymentDetails.amount && (
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">
                    ${paymentDetails.amount.toFixed(2)}{" "}
                    {paymentDetails.currency?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-medium">
                  {paymentDetails.transaction_id}
                </span>
              </div>
              {paymentDetails.subscription_start && (
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-medium">
                    {formatDate(paymentDetails.subscription_start)}
                  </span>
                </div>
              )}
              {paymentDetails.subscription_end && (
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span className="font-medium">
                    {formatDate(paymentDetails.subscription_end)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/main/ideas")}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/main/settings")}
            className="w-full"
          >
            View Account Settings
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          You should receive a confirmation email shortly.
        </p>
      </div>
    </div>
  );
}

function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-48 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

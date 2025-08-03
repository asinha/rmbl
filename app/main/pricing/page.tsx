"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UpgradePageProps {
  // Optional props if you want to customize the messaging
  limitMessage?: string;
  showBackButton?: boolean;
}

export default function UpgradePage({
  showBackButton = true,
}: UpgradePageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Upgrade Your Plan
              </h1>

              {/* <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
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
              </div> */}

              <p className="text-gray-500">
                Upgrade to get unlimited recording time and more features!
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Monthly Plan */}
              <div className="border rounded-lg p-6 hover:border-gray-300 transition-colors hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Monthly Plan
                  </h3>
                  <span className="text-2xl font-bold text-gray-900">
                    $9.99/mo
                  </span>
                </div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited recordings
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    High-quality transcriptions
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() =>
                    (window.location.href = "/main/payment-portal?plan=monthly")
                  }
                >
                  Choose Monthly
                </Button>
              </div>

              {/* Annual Plan - Most Popular */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 relative hover:shadow-md transition-shadow">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    MOST POPULAR
                  </span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Annual Plan
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      $99/year
                    </span>
                    <div className="text-sm text-green-600 font-medium">
                      Save 17%
                    </div>
                  </div>
                </div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Everything in Monthly
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Save $20 per year
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Coupon support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Advanced features
                  </li>
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    (window.location.href = "/main/payment-portal?plan=annual")
                  }
                >
                  Choose Annual
                </Button>
              </div>

              {/* Lifetime Plan */}
              <div className="border rounded-lg p-6 hover:border-gray-300 transition-colors hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Lifetime Plan
                  </h3>
                  <span className="text-2xl font-bold text-gray-900">$299</span>
                </div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Everything in Annual
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    One-time payment
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Lifetime access
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Future updates included
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full hover:bg-gray-50"
                  onClick={() =>
                    (window.location.href =
                      "/main/payment-portal?plan=lifetime")
                  }
                >
                  Choose Lifetime
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-center gap-4 mb-4">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Go Back
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => router.push("/main/ideas")} // or wherever you want to redirect
                  className="text-gray-500 hover:text-gray-700"
                >
                  Maybe Later
                </Button>
              </div>
              <p className="text-sm text-center text-gray-400">
                Your free limit resets daily at midnight
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

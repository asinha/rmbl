"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
        <div className="bg-white border border-green-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 w-full"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Unlock <span className="text-green-600">Lifetime</span> Access
              </h1>
              <p className="text-gray-500">
                One payment. <span className="font-medium">Forever</span> yours.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="group border-2 border-green-100 rounded-xl p-6 bg-white shadow-sm mb-8 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-green-200">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold px-3 py-1 transform rotate-12 translate-x-2 -translate-y-2">
                BEST VALUE
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Lifetime Plan
                  </h3>
                  <p className="text-sm text-gray-500">Pay once, use forever</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">$99</span>
                  <div className="text-xs text-gray-500">one-time payment</div>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Unlimited recordings",
                  "High-quality transcriptions",
                  "Priority support",
                  "All future updates",
                  "No recurring fees",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md transition-all duration-300"
                onClick={() =>
                  router.push("/main/payment-portal?plan=lifetime")
                }
              >
                Get Lifetime Access
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>30-day money back guarantee</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/main/dashboard")}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

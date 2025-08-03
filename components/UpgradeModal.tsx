"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface LimitReachedModalProps {
  onClose: () => void;
  limitMessage?: string;
}

export const LimitReachedModal = ({ onClose }: LimitReachedModalProps) => {
  const router = useRouter();

  const handleContinueWithFree = () => {
    onClose();
    router.push("/main/ideas");
  };

  const handleViewUpgrade = () => {
    onClose();
    router.push("/main/pricing");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Daily Recording Limit Reached
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Daily Recording Limit Reached
            </h1>

            <p className="text-gray-500 mb-6">
              Don't worry! You can still use other features or upgrade for
              unlimited access.
            </p>
          </div>

          {/* Options Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Continue with Free Features */}
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Continue with Free Features
                </h3>
                <p className="text-gray-600 mb-4">
                  You can still access your existing recordings and use other
                  app features.
                </p>
              </div>

              <ul className="text-gray-600 space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  View and edit existing recordings
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Export your transcriptions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Search through your content
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Organize your recordings
                </li>
              </ul>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleContinueWithFree}
              >
                Explore more
              </Button>

              <p className="text-sm text-center text-gray-500 mt-3">
                Your recording limit resets daily at midnight
              </p>
            </div>

            {/* Upgrade Section */}
            <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                  RECOMMENDED
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upgrade Your Plan
                </h3>
                <p className="text-gray-600 mb-4">
                  Get unlimited recording time and premium features.
                </p>
              </div>

              <ul className="text-gray-600 space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-3">⚡</span>
                  Unlimited recording time
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-3">⚡</span>
                  High-quality transcriptions
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-3">⚡</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-3">⚡</span>
                  Advanced features
                </li>
              </ul>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 mb-3"
                onClick={handleViewUpgrade}
              >
                Upgrade Plan
              </Button>

              <p className="text-sm text-center text-gray-600">
                Starting from <span className="font-semibold">$9.99/month</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

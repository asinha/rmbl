"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  Crown,
  Check,
} from "lucide-react";

// Define the subscription data type
interface SubscriptionData {
  plan: "free" | "monthly" | "annual" | "lifetime";
  status: "active" | "cancelled" | "expired";
  nextRenewalDate: string;
  cancelledAt: string | null; // This should allow both string and null
  amount: number;
  currency: string;
  paymentMethod: string;
  billingEmail: string;
}

// Mock user subscription data - replace with actual API call
const mockSubscriptionData: SubscriptionData = {
  plan: "annual",
  status: "active",
  nextRenewalDate: "2025-09-03",
  cancelledAt: null,
  amount: 99.99,
  currency: "USD",
  paymentMethod: "**** **** **** 4242",
  billingEmail: "user@example.com",
};

const planDetails = {
  free: {
    name: "Free Plan",
    price: 0,
    billing: "forever",
    features: [
      "1 minute daily recording",
      "Basic transcription",
      "Limited exports",
    ],
    color: "bg-gray-100 text-gray-800",
  },
  monthly: {
    name: "Monthly Plan",
    price: 9.99,
    billing: "month",
    features: [
      "Unlimited recording",
      "High-quality transcription",
      "Unlimited exports",
      "Search functionality",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  annual: {
    name: "Annual Plan",
    price: 99.99,
    billing: "year",
    features: [
      "Unlimited recording",
      "High-quality transcription",
      "Unlimited exports",
      "Search functionality",
      "17% savings",
    ],
    color: "bg-green-100 text-green-800",
  },
  lifetime: {
    name: "Lifetime Plan",
    price: 299,
    billing: "once",
    features: [
      "Unlimited recording",
      "High-quality transcription",
      "Unlimited exports",
      "Search functionality",
      "Priority support",
      "Advanced features",
    ],
    color: "bg-purple-100 text-purple-800",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] =
    useState<SubscriptionData>(mockSubscriptionData);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = planDetails[subscription.plan];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubscription({
        ...subscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });

      setShowCancelDialog(false);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (newPaymentMethod: string) => {
    setIsLoading(true);
    try {
      // Replace with actual API call to update payment method
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubscription({
        ...subscription,
        paymentMethod: newPaymentMethod,
      });

      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Failed to update payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (newPlan: string) => {
    router.push(
      `/main/payment-portal?plan=${newPlan}&customer_email=${subscription.billingEmail}`
    );
  };

  const getStatusBadge = () => {
    const badgeClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (subscription.status) {
      case "active":
        return (
          <span className={`${badgeClasses} bg-green-100 text-green-800`}>
            Active
          </span>
        );
      case "cancelled":
        return (
          <span className={`${badgeClasses} bg-red-100 text-red-800`}>
            Cancelled
          </span>
        );
      case "expired":
        return (
          <span className={`${badgeClasses} bg-gray-100 text-gray-800`}>
            Expired
          </span>
        );
      default:
        return (
          <span className={`${badgeClasses} bg-gray-100 text-gray-800`}>
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Current Subscription Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Current Subscription
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your subscription and billing information
                </p>
              </div>
              {getStatusBadge()}
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {currentPlan.name}
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  ${currentPlan.price}
                  {currentPlan.billing !== "forever" &&
                    currentPlan.billing !== "once" &&
                    `/${currentPlan.billing}`}
                  {currentPlan.billing === "once" && " (One-time)"}
                </p>

                <div className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {subscription.status === "active" &&
                  subscription.plan !== "lifetime" && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Next renewal: {formatDate(subscription.nextRenewalDate)}
                      </span>
                    </div>
                  )}

                {subscription.status === "cancelled" && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Access until: {formatDate(subscription.nextRenewalDate)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment method: {subscription.paymentMethod}</span>
                  {subscription.status === "active" &&
                    subscription.plan !== "free" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPaymentDialog(true)}
                        className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 h-auto text-xs"
                      >
                        Update
                      </Button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                  <span>Billing email: {subscription.billingEmail}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              {subscription.plan !== "lifetime" &&
                subscription.status === "active" && (
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upgrade Plan
                  </Button>
                )}

              {subscription.status === "active" &&
                subscription.plan !== "free" && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel Subscription
                  </Button>
                )}

              {(subscription.status === "cancelled" ||
                subscription.status === "expired") && (
                <Button
                  onClick={() => setShowUpgradeDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Reactivate Subscription
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose Your Plan</DialogTitle>
              <DialogDescription>
                Select a plan that best fits your needs
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(planDetails).map(([key, plan]) => {
                if (key === "free" || key === subscription.plan) return null;

                return (
                  <div
                    key={key}
                    className="relative bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    {key === "annual" && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-2xl font-bold mb-4">
                        ${plan.price}
                        {plan.billing !== "forever" &&
                          plan.billing !== "once" &&
                          `/${plan.billing}`}
                        {plan.billing === "once" && " (One-time)"}
                      </p>

                      <div className="space-y-2 mb-4">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleUpgrade(key)}
                        className={`w-full ${
                          key === "annual"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {subscription.status === "cancelled"
                          ? "Reactivate"
                          : "Upgrade"}{" "}
                        to {plan.name}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Payment Method Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Payment Method</DialogTitle>
              <DialogDescription>
                Enter your new payment information below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="cardNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="expiry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cvc"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="billingEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Billing Email
                </label>
                <input
                  type="email"
                  id="billingEmail"
                  defaultValue={subscription.billingEmail}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Secure Payment
                    </p>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. You will
                      not be charged until your next billing cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdatePayment("**** **** **** 5678")}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Updating..." : "Update Payment Method"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You'll
                continue to have access until your next billing date.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Your access will continue until{" "}
                    {formatDate(subscription.nextRenewalDate)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    After that, you'll be moved to the free plan with limited
                    features.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// components/SubscriptionStatus.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchUser } from "@/lib/store/slices/authSlice";
import { fetchSubscriptionUsage } from "@/lib/store/slices/subscriptionSlice";
import { Button } from "@/components/ui/button";

export default function SubscriptionStatus() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { usage, limits } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchSubscriptionUsage());
  }, [dispatch]);

  if (!user) {
    return <div>Loading user information...</div>;
  }

  const currentLimits = limits[user.subscriptionPlan as keyof typeof limits];
  const isUnlimited = currentLimits.recordingMinutes === -1;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Current Plan</h3>
          <p className="text-3xl font-bold text-blue-600 capitalize">
            {user.subscriptionPlan}
          </p>
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span
              className={`font-medium ${
                user.subscriptionStatus === "active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {user.subscriptionStatus}
            </span>
          </p>
          {user.subscriptionEndDate && (
            <p className="text-sm text-gray-600">
              Expires: {new Date(user.subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Usage This Month</h3>
          {usage && (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Recording Time</p>
                <p className="text-lg font-semibold">
                  {usage.recordingMinutes}
                  {isUnlimited
                    ? " minutes"
                    : ` / ${currentLimits.recordingMinutes} minutes`}
                </p>
                {!isUnlimited && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (usage.recordingMinutes /
                            currentLimits.recordingMinutes) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">Recordings</p>
                <p className="text-lg font-semibold">
                  {usage.recordingCount}
                  {isUnlimited
                    ? " recordings"
                    : ` / ${currentLimits.recordingCount} recordings`}
                </p>
                {!isUnlimited && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (usage.recordingCount /
                            currentLimits.recordingCount) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {user.subscriptionPlan === "free" && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Upgrade to unlock unlimited recordings and premium features!
          </p>
          <Button
            className="mt-2"
            onClick={() => (window.location.href = "/main/pricing")}
          >
            Upgrade Now
          </Button>
        </div>
      )}
    </div>
  );
}

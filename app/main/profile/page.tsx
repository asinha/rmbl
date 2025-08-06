"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Settings, User, Eye, Lock, CreditCard } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <p className="text-lg mb-4">Please sign in to view your profile</p>
        <Button size="lg">Sign In</Button>
      </div>
    );
  }

  const menuItems = [
    {
      id: "profile",
      name: "Profile",
      icon: <User className="h-4 w-4" />,
      component: <ProfileSection user={user} />,
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: <Eye className="h-4 w-4" />,
      component: <AppearanceSection />,
    },
    {
      id: "account",
      name: "Account",
      icon: <Settings className="h-4 w-4" />,
      component: <AccountSection user={user} />,
    },
    {
      id: "privacy",
      name: "Privacy",
      icon: <Lock className="h-4 w-4" />,
      component: <PrivacySection />,
    },
    {
      id: "billing",
      name: "Billing",
      icon: <CreditCard className="h-4 w-4" />,
      component: <BillingSection user={user} />,
    },
  ];

  const activeComponent = menuItems.find(
    (item) => item.id === activeTab
  )?.component;

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-1">
          <h2 className="text-lg font-semibold mb-4 px-2">Settings</h2>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">{activeComponent}</div>
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile picture"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-medium">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-3 -right-3"
          >
            Edit
          </Button>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground mt-2">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">24</div>
          <div className="text-sm text-muted-foreground">Notes Taken</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">5.2h</div>
          <div className="text-sm text-muted-foreground">Audio Processed</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">87%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Templates</div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              First Name
            </label>
            <div className="border rounded-md p-3">
              {user.firstName || "Not set"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Last Name
            </label>
            <div className="border rounded-md p-3">
              {user.lastName || "Not set"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Username
            </label>
            <div className="border rounded-md p-3">
              {user.username || "Not set"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <div className="border rounded-md p-3">
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Appearance Section Component
function AppearanceSection() {
  const [theme, setTheme] = useState("light");

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Appearance</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 border rounded-lg ${
                theme === "light"
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-32 h-20 bg-white rounded"></div>
              <p className="mt-2 text-sm">Light</p>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 border rounded-lg ${
                theme === "dark"
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-32 h-20 bg-gray-900 rounded"></div>
              <p className="mt-2 text-sm">Dark</p>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-4 border rounded-lg ${
                theme === "system"
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-32 h-20 bg-gradient-to-r from-white to-gray-900 rounded"></div>
              <p className="mt-2 text-sm">System</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Account Section Component
function AccountSection({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">Login Methods</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <Button variant="outline">Change</Button>
          </div>

          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Connected Accounts</p>
              <p className="text-sm text-muted-foreground">
                {user.externalAccounts.length > 0
                  ? `${user.externalAccounts.length} connected`
                  : "No accounts connected"}
              </p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
        <div className="space-y-4 border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-red-800">Delete Account</p>
              <p className="text-sm text-red-600">
                Permanently remove your account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Privacy Section Component
function PrivacySection() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Privacy Settings</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">Data Collection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Usage Analytics</p>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Crash Reports</p>
              <p className="text-sm text-muted-foreground">
                Automatically send crash reports to help fix issues
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

// Billing Section Component
function BillingSection({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium capitalize">
                {user.publicMetadata.subscriptionPlan || "Free"} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {user.publicMetadata.subscriptionStatus === "active"
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>
            <Button variant="premium">Upgrade</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-medium">
                {user.publicMetadata.subscriptionBillingCycle || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Billing Date</p>
              <p className="font-medium">
                {user.publicMetadata.subscriptionEndDate
                  ? new Date(
                      user.publicMetadata.subscriptionEndDate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="border rounded-lg p-6">
          <p className="text-muted-foreground">No payment methods on file</p>
          <Button variant="outline" className="mt-4">
            Add Payment Method
          </Button>
        </div>
      </section>
    </div>
  );
}

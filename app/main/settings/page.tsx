// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useRouter } from "next/navigation";
// import {
//   Calendar,
//   CreditCard,
//   AlertTriangle,
//   Crown,
//   Check,
// } from "lucide-react";

// // Define the subscription data type
// interface SubscriptionData {
//   plan: "free" | "monthly" | "annual" | "lifetime";
//   status: "active" | "cancelled" | "expired";
//   nextRenewalDate: string;
//   cancelledAt: string | null; // This should allow both string and null
//   amount: number;
//   currency: string;
//   paymentMethod: string;
//   billingEmail: string;
// }

// // Mock user subscription data - replace with actual API call
// const mockSubscriptionData: SubscriptionData = {
//   plan: "annual",
//   status: "active",
//   nextRenewalDate: "2025-09-03",
//   cancelledAt: null,
//   amount: 99.99,
//   currency: "USD",
//   paymentMethod: "**** **** **** 4242",
//   billingEmail: "user@example.com",
// };

// const planDetails = {
//   free: {
//     name: "Free Plan",
//     price: 0,
//     billing: "forever",
//     features: [
//       "1 minute daily recording",
//       "Basic transcription",
//       "Limited exports",
//     ],
//     color: "bg-gray-100 text-gray-800",
//   },
//   monthly: {
//     name: "Monthly Plan",
//     price: 9.99,
//     billing: "month",
//     features: [
//       "Unlimited recording",
//       "High-quality transcription",
//       "Unlimited exports",
//       "Search functionality",
//     ],
//     color: "bg-blue-100 text-blue-800",
//   },
//   annual: {
//     name: "Annual Plan",
//     price: 99.99,
//     billing: "year",
//     features: [
//       "Unlimited recording",
//       "High-quality transcription",
//       "Unlimited exports",
//       "Search functionality",
//       "17% savings",
//     ],
//     color: "bg-green-100 text-green-800",
//   },
//   lifetime: {
//     name: "Lifetime Plan",
//     price: 299,
//     billing: "once",
//     features: [
//       "Unlimited recording",
//       "High-quality transcription",
//       "Unlimited exports",
//       "Search functionality",
//       "Priority support",
//       "Advanced features",
//     ],
//     color: "bg-purple-100 text-purple-800",
//   },
// };

// export default function SettingsPage() {
//   const router = useRouter();
//   const [subscription, setSubscription] =
//     useState<SubscriptionData>(mockSubscriptionData);
//   const [showCancelDialog, setShowCancelDialog] = useState(false);
//   const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const currentPlan = planDetails[subscription.plan];

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const handleCancelSubscription = async () => {
//     setIsLoading(true);
//     try {
//       // Replace with actual API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       setSubscription({
//         ...subscription,
//         status: "cancelled",
//         cancelledAt: new Date().toISOString(),
//       });

//       setShowCancelDialog(false);
//     } catch (error) {
//       console.error("Failed to cancel subscription:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdatePayment = async (newPaymentMethod: string) => {
//     setIsLoading(true);
//     try {
//       // Replace with actual API call to update payment method
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       setSubscription({
//         ...subscription,
//         paymentMethod: newPaymentMethod,
//       });

//       setShowPaymentDialog(false);
//     } catch (error) {
//       console.error("Failed to update payment method:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpgrade = (newPlan: string) => {
//     router.push(
//       `/main/payment-portal?plan=${newPlan}&customer_email=${subscription.billingEmail}`
//     );
//   };

//   const getStatusBadge = () => {
//     const badgeClasses =
//       "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
//     switch (subscription.status) {
//       case "active":
//         return (
//           <span className={`${badgeClasses} bg-green-100 text-green-800`}>
//             Active
//           </span>
//         );
//       case "cancelled":
//         return (
//           <span className={`${badgeClasses} bg-red-100 text-red-800`}>
//             Cancelled
//           </span>
//         );
//       case "expired":
//         return (
//           <span className={`${badgeClasses} bg-gray-100 text-gray-800`}>
//             Expired
//           </span>
//         );
//       default:
//         return (
//           <span className={`${badgeClasses} bg-gray-100 text-gray-800`}>
//             Unknown
//           </span>
//         );
//     }
//   };

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Settings</h1>

//         {/* Current Subscription Card */}
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold flex items-center gap-2">
//                   <Crown className="h-5 w-5 text-yellow-500" />
//                   Current Subscription
//                 </h2>
//                 <p className="text-gray-600 mt-1">
//                   Manage your subscription and billing information
//                 </p>
//               </div>
//               {getStatusBadge()}
//             </div>
//           </div>
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h3 className="font-semibold text-lg mb-2">
//                   {currentPlan.name}
//                 </h3>
//                 <p className="text-2xl font-bold text-green-600 mb-4">
//                   ${currentPlan.price}
//                   {currentPlan.billing !== "forever" &&
//                     currentPlan.billing !== "once" &&
//                     `/${currentPlan.billing}`}
//                   {currentPlan.billing === "once" && " (One-time)"}
//                 </p>

//                 <div className="space-y-2">
//                   {currentPlan.features.map((feature, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       <Check className="h-4 w-4 text-green-500" />
//                       <span className="text-sm text-gray-600">{feature}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {subscription.status === "active" &&
//                   subscription.plan !== "lifetime" && (
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <Calendar className="h-4 w-4" />
//                       <span>
//                         Next renewal: {formatDate(subscription.nextRenewalDate)}
//                       </span>
//                     </div>
//                   )}

//                 {subscription.status === "cancelled" && (
//                   <div className="flex items-center gap-2 text-sm text-red-600">
//                     <AlertTriangle className="h-4 w-4" />
//                     <span>
//                       Access until: {formatDate(subscription.nextRenewalDate)}
//                     </span>
//                   </div>
//                 )}

//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <CreditCard className="h-4 w-4" />
//                   <span>Payment method: {subscription.paymentMethod}</span>
//                   {subscription.status === "active" &&
//                     subscription.plan !== "free" && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setShowPaymentDialog(true)}
//                         className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 h-auto text-xs"
//                       >
//                         Update
//                       </Button>
//                     )}
//                 </div>

//                 <div className="text-sm text-gray-600">
//                   <span>Billing email: {subscription.billingEmail}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 pt-4 border-t">
//               {subscription.plan !== "lifetime" &&
//                 subscription.status === "active" && (
//                   <Button
//                     onClick={() => setShowUpgradeDialog(true)}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     Upgrade Plan
//                   </Button>
//                 )}

//               {subscription.status === "active" &&
//                 subscription.plan !== "free" && (
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowCancelDialog(true)}
//                     className="border-red-200 text-red-600 hover:bg-red-50"
//                   >
//                     Cancel Subscription
//                   </Button>
//                 )}

//               {(subscription.status === "cancelled" ||
//                 subscription.status === "expired") && (
//                 <Button
//                   onClick={() => setShowUpgradeDialog(true)}
//                   className="bg-green-600 hover:bg-green-700"
//                 >
//                   Reactivate Subscription
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Upgrade Dialog */}
//         <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Choose Your Plan</DialogTitle>
//               <DialogDescription>
//                 Select a plan that best fits your needs
//               </DialogDescription>
//             </DialogHeader>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {Object.entries(planDetails).map(([key, plan]) => {
//                 if (key === "free" || key === subscription.plan) return null;

//                 return (
//                   <div
//                     key={key}
//                     className="relative bg-white border border-gray-200 rounded-lg shadow-sm"
//                   >
//                     {key === "annual" && (
//                       <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
//                           Most Popular
//                         </span>
//                       </div>
//                     )}
//                     <div className="p-6">
//                       <h3 className="font-semibold text-lg mb-2">
//                         {plan.name}
//                       </h3>
//                       <p className="text-2xl font-bold mb-4">
//                         ${plan.price}
//                         {plan.billing !== "forever" &&
//                           plan.billing !== "once" &&
//                           `/${plan.billing}`}
//                         {plan.billing === "once" && " (One-time)"}
//                       </p>

//                       <div className="space-y-2 mb-4">
//                         {plan.features.slice(0, 3).map((feature, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <Check className="h-4 w-4 text-green-500" />
//                             <span className="text-sm">{feature}</span>
//                           </div>
//                         ))}
//                       </div>

//                       <Button
//                         onClick={() => handleUpgrade(key)}
//                         className={`w-full ${
//                           key === "annual"
//                             ? "bg-blue-600 hover:bg-blue-700 text-white"
//                             : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
//                         }`}
//                       >
//                         {subscription.status === "cancelled"
//                           ? "Reactivate"
//                           : "Upgrade"}{" "}
//                         to {plan.name}
//                       </Button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Update Payment Method Dialog */}
//         <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Update Payment Method</DialogTitle>
//               <DialogDescription>
//                 Enter your new payment information below
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               <div>
//                 <label
//                   htmlFor="cardNumber"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Card Number
//                 </label>
//                 <input
//                   type="text"
//                   id="cardNumber"
//                   placeholder="1234 5678 9012 3456"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label
//                     htmlFor="expiry"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Expiry Date
//                   </label>
//                   <input
//                     type="text"
//                     id="expiry"
//                     placeholder="MM/YY"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label
//                     htmlFor="cvc"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     CVC
//                   </label>
//                   <input
//                     type="text"
//                     id="cvc"
//                     placeholder="123"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label
//                   htmlFor="billingEmail"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Billing Email
//                 </label>
//                 <input
//                   type="email"
//                   id="billingEmail"
//                   defaultValue={subscription.billingEmail}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                 <div className="flex items-start gap-2">
//                   <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
//                   <div>
//                     <p className="text-sm font-medium text-blue-800">
//                       Secure Payment
//                     </p>
//                     <p className="text-sm text-blue-700">
//                       Your payment information is encrypted and secure. You will
//                       not be charged until your next billing cycle.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowPaymentDialog(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => handleUpdatePayment("**** **** **** 5678")}
//                 disabled={isLoading}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 {isLoading ? "Updating..." : "Update Payment Method"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Cancel Subscription Dialog */}
//         <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Cancel Subscription</DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to cancel your subscription? You'll
//                 continue to have access until your next billing date.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
//               <div className="flex items-start gap-2">
//                 <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-medium text-yellow-800">
//                     Your access will continue until{" "}
//                     {formatDate(subscription.nextRenewalDate)}
//                   </p>
//                   <p className="text-sm text-yellow-700 mt-1">
//                     After that, you'll be moved to the free plan with limited
//                     features.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowCancelDialog(false)}
//               >
//                 Keep Subscription
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={handleCancelSubscription}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Cancelling..." : "Cancel Subscription"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Settings, User, Eye, Lock, CreditCard } from "lucide-react";

export default function SettingsPage() {
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

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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
      </div> */}

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
            <Button variant="outline">Upgrade</Button>
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

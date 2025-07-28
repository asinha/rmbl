import { BillingPortalButton } from "@/components/BillingPortalButton";

interface AccountPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function AccountPage({
  params,
  searchParams,
}: AccountPageProps) {
  // In a real app, you'd get this from your auth/session system
  const customerId = "cus_123";

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
        <BillingPortalButton
          customerId={customerId}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          buttonText="Manage Subscription"
        />
      </div>
    </div>
  );
}

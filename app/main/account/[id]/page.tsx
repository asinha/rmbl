import { BillingPortalButton } from "@/components/BillingPortalButton";

interface AccountPageParams {
  id: string;
}

interface AccountPageProps {
  params: Promise<AccountPageParams>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  // Await the params in Next.js 15
  const { id } = await params;

  const customerId = "cus_123"; // Replace with actual customer ID from your auth system

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
        <p className="text-sm text-gray-600 mb-4">Account ID: {id}</p>
        <BillingPortalButton
          customerId={customerId}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          buttonText="Manage Subscription"
        />
      </div>
    </div>
  );
}

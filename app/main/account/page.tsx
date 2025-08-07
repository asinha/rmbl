import { Button } from "@/components/ui/button";

async function redirectToStripePortal() {
  const res = await fetch("/api/create-portal-session", {
    method: "POST",
  });

  const data = await res.json();

  if (res.ok) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Something went wrong.");
  }
}

export default function BillingSettings() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Billing</h1>
      <Button onClick={redirectToStripePortal}>
        Go to Stripe Customer Portal
      </Button>
    </div>
  );
}

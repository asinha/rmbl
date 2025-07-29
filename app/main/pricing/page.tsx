"use client";
// pages/product.tsx or wherever you want to trigger payment
import PaymentPage from "@/components/PaymentPage";
import React from "react";

export default function ProductPage() {
  const productPrice = 29.99;
  const productMetadata = {
    product_id: "prod_123",
    customer_email: "customer@example.com",
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Purchase Product
        </h1>

        <PaymentPage
          amount={productPrice}
          currency="usd"
          metadata={productMetadata}
        />
      </div>
    </div>
  );
}

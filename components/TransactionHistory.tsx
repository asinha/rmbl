// components/TransactionHistory.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTransactions } from "@/lib/store/slices/transactionSlice";
import { Button } from "@/components/ui/button";

export default function TransactionHistory() {
  const dispatch = useAppDispatch();
  const { transactions, loading, error, pagination } = useAppSelector(
    (state) => state.transactions
  );

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    dispatch(
      fetchTransactions({
        page: pagination.page + 1,
        limit: pagination.limit,
      })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">Loading transactions...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transaction History</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{transaction.planType} Plan</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        transaction.status === "completed"
                          ? "text-green-600"
                          : transaction.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${transaction.finalPrice.toFixed(2)}
                  </p>
                  {transaction.couponCode && (
                    <p className="text-sm text-green-600">
                      Coupon: {transaction.couponCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.page < pagination.totalPages && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

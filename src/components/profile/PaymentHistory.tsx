"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentTransaction {
  id: string;
  date: string;
  amount: string;
  status: "succeeded" | "failed" | "pending";
  description: string;
  receiptUrl?: string;
}

interface PaymentHistoryProps {
  userId: string;
}

export default function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for demonstration purposes
    // In a real app, this would fetch from an API endpoint
    const mockTransactions: PaymentTransaction[] = [
      {
        id: "tx_" + Math.random().toString(36).slice(2, 10),
        date: new Date().toISOString(),
        amount: "$9.99",
        status: "succeeded",
        description: "Pro Plan Subscription",
        receiptUrl: "#",
      },
      {
        id: "tx_" + Math.random().toString(36).slice(2, 10),
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: "$9.99",
        status: "succeeded",
        description: "Pro Plan Subscription",
        receiptUrl: "#",
      },
      {
        id: "tx_" + Math.random().toString(36).slice(2, 10),
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: "$9.99",
        status: "succeeded",
        description: "Pro Plan Subscription",
        receiptUrl: "#",
      },
    ];

    // Simulate API call
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // In a real app: const response = await fetch(`/api/payments?userId=${userId}`);
        // const data = await response.json();

        // Using mock data for now
        setTimeout(() => {
          setTransactions(mockTransactions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        setError("Failed to load payment history. Please try again.");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Payment History
      </h2>

      {transactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No payment transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.status === "succeeded" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Successful
                      </span>
                    ) : transaction.status === "failed" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg
                          className="h-3 w-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.receiptUrl &&
                    transaction.status === "succeeded" ? (
                      <a
                        href={transaction.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400">Not available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@/types";
import { Check, Star, Zap } from "lucide-react";

interface SubscriptionDetailsProps {
  plan: SubscriptionPlan;
  generationsRemaining: number;
}

export default function SubscriptionDetails({
  plan,
  generationsRemaining,
}: SubscriptionDetailsProps) {
  const router = useRouter();
  const isPro = plan.id === "pro";

  const handleUpgrade = () => {
    router.push("/subscription");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Subscription Plan
        </h2>
        {!isPro && (
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${
                isPro
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isPro ? (
                <Zap className="h-6 w-6" />
              ) : (
                <Star className="h-6 w-6" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {plan.name} Plan
              </h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-2xl font-bold text-gray-900">
                $
                {typeof plan.price === "string"
                  ? plan.price
                  : plan.price.toFixed(2)}
              </span>
              <p className="text-sm text-gray-500">/month</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Plan Features
          </h4>
          <ul className="space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <div
                  className={`flex-shrink-0 p-1 rounded-full ${
                    isPro
                      ? "text-indigo-600 bg-indigo-100"
                      : "text-gray-600 bg-gray-100"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </div>
                <span className="ml-3 text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                README Generations Remaining
              </p>
              <p className="text-lg font-medium text-gray-900">
                {generationsRemaining === Infinity
                  ? "Unlimited"
                  : `${generationsRemaining} generations`}
              </p>
            </div>
            {isPro ? (
              <button
                onClick={() => router.push("/subscription")}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Manage Plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 p-2 rounded-lg ${
            isPro
              ? "bg-indigo-900/50 text-indigo-300"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          {isPro ? <Zap className="h-6 w-6" /> : <Star className="h-6 w-6" />}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-100">
            {plan.name} Plan
          </h3>
          <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-2xl font-bold text-gray-100">
            $
            {typeof plan.price === "string"
              ? plan.price
              : plan.price.toFixed(2)}
          </span>
          <p className="text-sm text-gray-400">/month</p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-800 pt-6">
        <h4 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-4">
          Plan Features
        </h4>
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div
                className={`flex-shrink-0 p-1 rounded-full ${
                  isPro
                    ? "text-indigo-300 bg-indigo-900/50"
                    : "text-gray-400 bg-gray-800"
                }`}
              >
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-3 text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-gray-800 pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              README Generations Remaining
            </p>
            <p className="mt-1 text-lg font-medium text-gray-100">
              {generationsRemaining === Infinity
                ? "Unlimited"
                : `${generationsRemaining} generations`}
            </p>
          </div>
          {isPro ? (
            <button
              onClick={() => router.push("/subscription")}
              className="px-4 py-2 text-sm font-medium text-indigo-300 bg-indigo-900/30 border border-indigo-700 rounded-md hover:bg-indigo-900/50 transition-colors"
            >
              Manage Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-200 font-medium"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

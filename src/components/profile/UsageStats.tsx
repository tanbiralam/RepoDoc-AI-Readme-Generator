"use client";

import { SubscriptionPlan } from "@/types";

interface UsageStatsProps {
  generationsUsed: number;
  generationsRemaining: number;
  plan: SubscriptionPlan;
}

export default function UsageStats({
  generationsUsed,
  generationsRemaining,
  plan,
}: UsageStatsProps) {
  const isPro = plan.id === "pro";
  const limit = plan.readme_generations_limit;
  const isUnlimited = limit === Infinity;
  const usagePercentage = isUnlimited
    ? 0
    : Math.min(100, Math.round((generationsUsed / limit) * 100));

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Usage Card */}
        <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-5">
          <h3 className="text-base font-medium text-indigo-400 mb-4">
            Current Period Usage
          </h3>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">
                {generationsUsed} used
              </span>
              <span className="text-sm font-medium text-gray-300">
                {isUnlimited ? "Unlimited" : limit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  isPro ? "bg-indigo-500" : "bg-green-500"
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">Used</p>
              <p className="text-xl font-bold text-gray-100">
                {generationsUsed}
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">Remaining</p>
              <p className="text-xl font-bold text-gray-100">
                {isUnlimited ? "∞" : generationsRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Details Card */}
        <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-5">
          <h3 className="text-base font-medium text-indigo-400 mb-4">
            Plan Details
          </h3>

          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-400">Plan</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-100">
                {plan.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">
                Billing Cycle
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-100">
                Monthly
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">
                Next Billing Date
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-100">
                {/* This would come from the subscription data */}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

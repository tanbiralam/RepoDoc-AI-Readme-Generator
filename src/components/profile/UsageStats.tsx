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

  // Generate data for recent months (this would come from actual usage data)
  const currentMonth = new Date().getMonth();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return {
      month: months[monthIndex],
      count: i === 0 ? generationsUsed : Math.floor(Math.random() * 5),
    };
  }).reverse();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Usage Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Usage Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Current Period Usage
          </h3>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {generationsUsed} used
              </span>
              <span className="text-sm font-medium text-gray-700">
                {isUnlimited ? "Unlimited" : limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  isPro ? "bg-indigo-600" : "bg-green-500"
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Used</p>
              <p className="text-xl font-bold text-gray-900">
                {generationsUsed}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-xl font-bold text-gray-900">
                {isUnlimited ? "∞" : generationsRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Plan Details
          </h3>

          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {plan.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Billing Cycle
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                Monthly
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Next Billing Date
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {/* This would come from the subscription data */}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Usage History
        </h3>

        <div className="space-y-6">
          <div className="h-64">
            <div className="flex items-end justify-between h-48 gap-1">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full ${
                      isPro ? "bg-indigo-500" : "bg-green-500"
                    } rounded-t-md`}
                    style={{
                      height: `${Math.max(4, (data.count / 10) * 100)}%`,
                      opacity: data.count ? 1 : 0.3,
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {monthlyData.map((data, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-500 flex-1 text-center"
                >
                  {data.month}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {monthlyData.map((data, index) => (
                <div
                  key={index}
                  className="text-xs font-medium text-gray-700 flex-1 text-center"
                >
                  {data.count}
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>
              The chart shows your README generation usage over the past 6
              months.
            </p>
            {!isPro && (
              <p className="mt-2 text-indigo-600">
                Upgrade to Pro for unlimited generations!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

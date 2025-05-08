"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Loader2, AlertCircle } from "lucide-react";
import { SubscriptionPlan, ANIMATION_VARIANTS } from "@/utils/constants";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onUpgrade: (planId: string) => Promise<void>;
}

export default function PlanCard({
  plan,
  isCurrentPlan,
  onUpgrade,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const isPro = plan.id === "pro";
  const icon =
    plan.iconType === "star" ? (
      <Star className="w-5 h-5" />
    ) : (
      <Zap className="w-5 h-5" />
    );

  const handleSelectPlan = async () => {
    if (isCurrentPlan) return;

    setLoading(true);
    try {
      await onUpgrade(plan.id);
    } catch (error) {
      console.error("Error upgrading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPlan = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelPlan = async () => {
    setLoading(true);
    try {
      // Call the cancel-subscription API
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Reset state and redirect to dashboard
      setShowCancelConfirm(false);
      window.location.href = "/dashboard?subscription=cancelled";
    } catch (error) {
      console.error("Error cancelling plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      whileHover={{
        y: -8,
        boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.15)",
      }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300 group
        ${
          isCurrentPlan
            ? "border-blue-500 bg-blue-950/20"
            : isPro
            ? "border-blue-500/50 bg-blue-950/10"
            : "border-gray-800/50 bg-gray-900/80"
        }
      `}
    >
      {isPro && (
        <div className="absolute top-4 inset-x-0 z-30">
          <div className="flex justify-center">
            <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-1 text-xs font-medium text-white shadow-md translate-y-[-50%]">
              Most Popular
            </span>
          </div>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-4 right-4 z-30">
          <span className="inline-flex rounded-full bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 text-xs font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className={`p-6 flex flex-col h-full ${isPro ? "pt-8" : ""}`}>
        <div className="mb-auto">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
              isPro || isCurrentPlan
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-800/80 text-gray-400"
            }`}
          >
            {icon}
          </div>

          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
            {plan.name}
          </h3>

          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-bold text-white">${plan.price}</span>
            <span className="ml-1 text-lg text-gray-400">/month</span>
          </div>

          <p className="text-gray-400 mb-6">{plan.description}</p>

          <div className="mb-8">
            <ul className="space-y-3">
              {plan.features.map((feature, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div
                    className={`flex-shrink-0 rounded-full p-1 ${
                      isPro || isCurrentPlan
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-gray-400 bg-gray-800"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="ml-3 text-gray-300 text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-auto">
          {isCurrentPlan ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelPlan}
              disabled={loading || plan.id === "free"}
              className={`w-full py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                plan.id === "free"
                  ? "bg-gray-800/50 text-gray-400 cursor-not-allowed border border-gray-700"
                  : "bg-gray-800 hover:bg-red-500/20 text-white hover:text-red-400 border border-gray-700 hover:border-red-500/30"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{plan.id === "free" ? "Free Plan" : "Cancel Plan"}</span>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSelectPlan}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                isPro
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20"
                  : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {plan.price === "0" ? "Stay on Free Plan" : "Select"}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-500/20 p-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Cancel Subscription
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel your {plan.name} subscription?
              You&apos;ll be downgraded to the Free plan at the end of your
              current billing period.
            </p>

            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              >
                Keep Subscription
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmCancelPlan}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

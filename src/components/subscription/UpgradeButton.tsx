"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/utils/constants";

interface UpgradeButtonProps {
  selectedPlan: string | null;
  loading: boolean;
  onUpgrade: () => void;
}

export default function UpgradeButton({
  selectedPlan,
  loading,
  onUpgrade,
}: UpgradeButtonProps) {
  if (!selectedPlan || selectedPlan === "free") return null;

  const planName = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 flex justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onUpgrade}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-700/20 transition-all duration-200"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            <span>Upgrade to {planName}</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

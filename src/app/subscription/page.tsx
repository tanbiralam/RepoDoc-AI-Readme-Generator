"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { SUBSCRIPTION_PLANS, ANIMATION_VARIANTS } from "@/utils/constants";
import {
  createStripeCheckoutSession,
  redirectToStripeCheckout,
} from "@/utils/stripe";
import PlanCard from "@/components/subscription/PlanCard";

// ==============================
// Main Component
// ==============================
export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  // Check for subscription cancellation success message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subscription = params.get("subscription");

    if (subscription === "cancelled") {
      setSuccessMessage(
        "Your subscription has been cancelled. You will have access to Pro features until the end of your billing period."
      );

      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // Don't render content if not authenticated
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    try {
      setError(null);

      // Create checkout session
      const { sessionId, error: checkoutError } =
        await createStripeCheckoutSession(planId, user.id);

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout if we have a session ID
      if (sessionId) {
        const { error: redirectError } = await redirectToStripeCheckout(
          sessionId
        );
        if (redirectError) throw redirectError;
      } else {
        // Handle free plan upgrades (no payment required)
        router.push("/dashboard?subscription=updated");
      }
    } catch (err) {
      setError("Failed to start checkout process. Please try again.");
      console.error("Error creating checkout session:", err);
      throw err; // Propagate error to component to update its loading state
    }
  };

  const isCurrentPlan = (planId: string) => currentPlan?.id === planId;

  return (
    <div className="relative bg-gray-950 min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-6 py-12 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white">Your Subscription</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Title Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-white">
              <span className="text-blue-400">Subscription Plans</span>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose the Right Plan for You
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Generate professional README files for your GitHub repositories
          </motion.p>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          variants={ANIMATION_VARIANTS.container}
          initial="hidden"
          animate="visible"
        >
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan(plan.id)}
              onUpgrade={handleUpgrade}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

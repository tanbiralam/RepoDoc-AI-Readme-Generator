"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SubscriptionPlan } from "@/types";
import { getUserSubscriptionPlan, subscriptionPlans } from "@/services/stripe";
import { useAuth } from "@/context/AuthContext";

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  isLoading: boolean;
  readmeGenerationsUsed: number;
  readmeGenerationsRemaining: number;
  error: Error | null;
  refreshSubscription: () => Promise<void>;
  canGenerateReadme: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: subscriptionPlans[0], // Default to free plan
  isLoading: true,
  readmeGenerationsUsed: 0,
  readmeGenerationsRemaining: 5,
  error: null,
  refreshSubscription: async () => {},
  canGenerateReadme: () => true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>(subscriptionPlans[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [readmeGenerationsUsed, setReadmeGenerationsUsed] = useState<number>(0);
  const [readmeGenerationsRemaining, setReadmeGenerationsRemaining] =
    useState<number>(5);
  const [error, setError] = useState<Error | null>(null);

  const refreshSubscription = async () => {
    if (!user) {
      setPlan(subscriptionPlans[0]);
      setReadmeGenerationsUsed(0);
      setReadmeGenerationsRemaining(5);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get user's subscription plan
      const { plan: userPlan, error: planError } =
        await getUserSubscriptionPlan(user.id);
      if (planError) throw planError;
      if (userPlan) setPlan(userPlan);

      // Get user's README generation count
      const generationsUsed = user.readme_generations_count || 0;
      setReadmeGenerationsUsed(generationsUsed);

      const remaining = userPlan
        ? userPlan.readme_generations_limit - generationsUsed
        : 0;
      setReadmeGenerationsRemaining(Math.max(0, remaining));
    } catch (err) {
      setError(err as Error);
      console.error("Error refreshing subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerateReadme = () => {
    return readmeGenerationsRemaining > 0;
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value = {
    plan,
    isLoading,
    readmeGenerationsUsed,
    readmeGenerationsRemaining,
    error,
    refreshSubscription,
    canGenerateReadme,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

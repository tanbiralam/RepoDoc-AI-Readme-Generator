"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
    useState<number>(subscriptionPlans[0].readme_generations_limit);
  const [error, setError] = useState<Error | null>(null);

  const refreshSubscription = useCallback(async () => {
    const currentUserId = user?.id;
    const currentGenerationsCount = user?.readme_generations_count;

    if (!currentUserId) {
      setPlan(subscriptionPlans[0]);
      setReadmeGenerationsUsed(0);
      setReadmeGenerationsRemaining(
        subscriptionPlans[0].readme_generations_limit
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { plan: userPlan, error: planError } =
        await getUserSubscriptionPlan(currentUserId);

      if (planError) throw planError;

      const resolvedPlan = userPlan || subscriptionPlans[0];
      setPlan(resolvedPlan);

      const generationsUsed = currentGenerationsCount || 0;
      setReadmeGenerationsUsed(generationsUsed);

      const remaining = resolvedPlan.readme_generations_limit - generationsUsed;
      setReadmeGenerationsRemaining(Math.max(0, remaining));
    } catch (err) {
      setError(err as Error);
      console.error("Error refreshing subscription:", err);
      setPlan(subscriptionPlans[0]);
      setReadmeGenerationsUsed(currentGenerationsCount || 0);
      setReadmeGenerationsRemaining(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.readme_generations_count]);

  const canGenerateReadme = () => {
    return readmeGenerationsRemaining > 0;
  };

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

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

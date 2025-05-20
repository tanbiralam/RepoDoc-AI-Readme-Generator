import { SubscriptionPlan } from "@/types";
import { README_GENERATION_LIMITS } from "@/utils/constants";

// Define available subscription plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0",
    description: "Perfect for trying out the service",
    features: [
      `Generate up to ${README_GENERATION_LIMITS.FREE} READMEs`,
      "Basic templates",
      "Export as Markdown file",
    ],
    readme_generations_limit: README_GENERATION_LIMITS.FREE,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "6.99",
    description: "For regular GitHub users",
    features: [
      "Unlimited README generations",
      "Advanced templates",
      "Export as Markdown file",
      "Commit to GitHub repository",
      "Priority support",
    ],
    readme_generations_limit: README_GENERATION_LIMITS.PRO,
    popular: true,
  },
];

/**
 * Initialize Stripe checkout session
 */
export const createCheckoutSession = async (
  planId: string,
  userId: string
): Promise<{ sessionId: string | null; error: Error | null }> => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();

    // Handle free plan
    if (data.success) {
      return { sessionId: null, error: null };
    }

    return { sessionId: data.sessionId, error: null };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { sessionId: null, error: error as Error };
  }
};

/**
 * Get the current subscription plan for a user
 */
export const getUserSubscriptionPlan = async (
  userId: string
): Promise<{ plan: SubscriptionPlan | null; error: Error | null }> => {
  try {
    // Try to get the subscription plan from the API
    const response = await fetch(`/api/subscription?userId=${userId}`);

    // If API call failed, log the error but default to free plan
    if (!response.ok) {
      console.warn(
        `Subscription API returned status ${response.status}. Defaulting to free plan.`
      );
      return { plan: subscriptionPlans[0], error: null };
    }

    const data = await response.json();
    const planId = data.planId || "free";

    const plan =
      subscriptionPlans.find((p) => p.id === planId) || subscriptionPlans[0];
    return { plan, error: null };
  } catch (error) {
    // Log the error but don't propagate it - just return the free plan
    console.error("Error getting subscription plan:", error);
    // Default to free plan on error instead of throwing an error
    return { plan: subscriptionPlans[0], error: null };
  }
};

/**
 * Check if a user has enough README generations left
 */
export const canGenerateReadme = async (
  userId: string
): Promise<{
  canGenerate: boolean;
  remaining: number;
  error: Error | null;
}> => {
  try {
    const response = await fetch(`/api/readme-generations?userId=${userId}`);

    // Handle API errors gracefully
    if (!response.ok) {
      console.warn(
        `README generations API returned status ${response.status}. Using fallback values.`
      );
      // Default to allowing 1 generation in case of API failure
      return { canGenerate: true, remaining: 1, error: null };
    }

    const data = await response.json();
    const generationsUsed = data.generationsUsed || 0;
    const { plan } = await getUserSubscriptionPlan(userId);

    // Always ensure plan is defined, even if API call fails
    const effectivePlan = plan || subscriptionPlans[0];
    const remaining = effectivePlan.readme_generations_limit - generationsUsed;
    const canGenerate = remaining > 0;

    return { canGenerate, remaining, error: null };
  } catch (error) {
    console.error("Error checking README generation limit:", error);
    // Allow one generation by default in case of error
    return { canGenerate: true, remaining: 1, error: null };
  }
};

/**
 * Increment the README generation count for a user
 */
export const incrementReadmeGeneration = async (
  userId: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const response = await fetch("/api/increment-readme-generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    if (!response.ok) {
      // Log the error but don't throw
      console.error(
        `Failed to increment README generation count: ${response.status}`
      );
      return { success: false, error: null };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error incrementing README generation count:", error);
    return { success: false, error: null };
  }
};

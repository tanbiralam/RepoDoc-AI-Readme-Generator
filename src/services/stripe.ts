import { SubscriptionPlan } from '@/types';

// Define available subscription plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Generate up to 5 READMEs',
      'Basic templates',
      'Export as Markdown file',
    ],
    readme_generations_limit: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    features: [
      'Generate up to 15 READMEs',
      'Advanced templates',
      'Export as Markdown file',
      'Commit to GitHub repository',
    ],
    readme_generations_limit: 15,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19.99,
    features: [
      'Unlimited README generations',
      'Premium templates',
      'Export as Markdown file',
      'Commit to GitHub repository',
      'Priority support',
    ],
    readme_generations_limit: Infinity,
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
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { sessionId: data.sessionId, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
    const response = await fetch(`/api/subscription?userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to get subscription plan');
    }

    const data = await response.json();
    const planId = data.planId || 'free';

    const plan = subscriptionPlans.find(p => p.id === planId) || subscriptionPlans[0];
    return { plan, error: null };
  } catch (error) {
    console.error('Error getting subscription plan:', error);
    // Default to free plan on error
    return { plan: subscriptionPlans[0], error: error as Error };
  }
};

/**
 * Check if a user has enough README generations left
 */
export const canGenerateReadme = async (
  userId: string
): Promise<{ canGenerate: boolean; remaining: number; error: Error | null }> => {
  try {
    const response = await fetch(`/api/readme-generations?userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to check README generation limit');
    }

    const data = await response.json();
    const generationsUsed = data.generationsUsed || 0;
    const { plan } = await getUserSubscriptionPlan(userId);

    if (!plan) {
      throw new Error('Failed to get subscription plan');
    }

    const remaining = plan.readme_generations_limit - generationsUsed;
    const canGenerate = remaining > 0;

    return { canGenerate, remaining, error: null };
  } catch (error) {
    console.error('Error checking README generation limit:', error);
    return { canGenerate: false, remaining: 0, error: error as Error };
  }
};

/**
 * Increment the README generation count for a user
 */
export const incrementReadmeGeneration = async (
  userId: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const response = await fetch('/api/increment-readme-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to increment README generation count');
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error incrementing README generation count:', error);
    return { success: false, error: error as Error };
  }
};

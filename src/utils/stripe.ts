/**
 * Stripe utility functions for the subscription system
 */

// Define types for Stripe interactions
export interface StripeInstance {
  redirectToCheckout: (options: {
    sessionId: string;
  }) => Promise<{ error?: Error }>;
}

declare global {
  interface Window {
    Stripe: (key: string) => StripeInstance;
  }
}

/**
 * Initialize Stripe checkout session
 */
export const createStripeCheckoutSession = async (
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
 * Redirect to Stripe checkout
 */
export const redirectToStripeCheckout = async (
  sessionId: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublishableKey) {
      throw new Error("Missing Stripe publishable key");
    }

    const stripe = window.Stripe(stripePublishableKey);

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error redirecting to Stripe checkout:", error);
    return { success: false, error: error as Error };
  }
};

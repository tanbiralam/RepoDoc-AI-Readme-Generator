"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { createCheckoutSession, subscriptionPlans } from '@/services/stripe';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { plan: currentPlan, isLoading: subscriptionLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to auth page if not logged in
  if (!authLoading && !user) {
    router.push('/auth');
    return null;
  }

  const handleUpgrade = async () => {
    if (!selectedPlan || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { sessionId, error } = await createCheckoutSession(selectedPlan, user.id);
      
      if (error) throw error;
      
      if (sessionId) {
        // Redirect to Stripe checkout
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (err) {
      setError('Failed to start checkout process. Please try again.');
      console.error('Error creating checkout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) => currentPlan?.id === planId;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600">
            {error}
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Choose the Right Plan for You</h2>
          <p className="mt-4 text-lg text-gray-600">
            Generate professional README files for your GitHub repositories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${isCurrentPlan(plan.id) ? 'border-blue-500' : 'border-transparent'}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="ml-1 text-xl text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-600">
                  {plan.readme_generations_limit === Infinity
                    ? 'Unlimited README generations'
                    : `${plan.readme_generations_limit} README generations per month`}
                </p>
              </div>
              <div className="px-6 pt-4 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isCurrentPlan(plan.id) ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full px-4 py-2 border border-blue-600 rounded-md ${selectedPlan === plan.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                    >
                      {plan.price === 0 ? 'Stay on Free Plan' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && selectedPlan !== 'free' && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upgrade to {subscriptionPlans.find(p => p.id === selectedPlan)?.name}</span>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

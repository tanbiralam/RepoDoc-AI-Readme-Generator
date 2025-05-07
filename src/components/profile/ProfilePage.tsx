"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import ProfileInfo from "@/components/profile/ProfileInfo";
import SubscriptionDetails from "@/components/profile/SubscriptionDetails";
import UsageStats from "@/components/profile/UsageStats";
import PaymentHistory from "@/components/profile/PaymentHistory";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const { user, loading: authLoading } = useAuth();
  const { plan, readmeGenerationsUsed, readmeGenerationsRemaining } =
    useSubscription();
  const [loading, setLoading] = useState(true);

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    } else if (!authLoading && user && user.id !== userId) {
      // If the user is trying to access another user's profile, redirect to their own
      router.push(`/profile/${user.id}`);
    }

    // Add artificial loading for UX when coming from dashboard
    if (!authLoading && user) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, userId, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              {user.full_name ? `${user.full_name}'s Profile` : "Profile"}
            </h1>
            <p className="mt-1 text-gray-400 text-sm">
              View your account information
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-indigo-400">
                Profile Information
              </h2>
            </div>
            <ProfileInfo user={user} />
          </div>

          {/* Subscription Details */}
          <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-indigo-400">
                Subscription Details
              </h2>
            </div>
            <SubscriptionDetails
              plan={plan}
              generationsRemaining={readmeGenerationsRemaining}
            />
          </div>

          {/* Usage Stats */}
          <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-indigo-400">
                Usage Statistics
              </h2>
            </div>
            <UsageStats
              generationsUsed={readmeGenerationsUsed}
              generationsRemaining={readmeGenerationsRemaining}
              plan={plan}
            />
          </div>

          {/* Payment History */}
          <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-indigo-400">
                Payment History
              </h2>
            </div>
            <PaymentHistory userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

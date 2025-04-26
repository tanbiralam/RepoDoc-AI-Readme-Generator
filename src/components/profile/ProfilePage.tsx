"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import ProfileInfo from "@/components/profile/ProfileInfo";
import SubscriptionDetails from "@/components/profile/SubscriptionDetails";
import UsageStats from "@/components/profile/UsageStats";
import PaymentHistory from "@/components/profile/PaymentHistory";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { plan, readmeGenerationsUsed, readmeGenerationsRemaining } =
    useSubscription();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "subscription", label: "Subscription" },
    { id: "usage", label: "Usage" },
    { id: "payment", label: "Payment History" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === "profile" && <ProfileInfo user={user} />}

          {activeTab === "subscription" && (
            <SubscriptionDetails
              plan={plan}
              generationsRemaining={readmeGenerationsRemaining}
            />
          )}

          {activeTab === "usage" && (
            <UsageStats
              generationsUsed={readmeGenerationsUsed}
              generationsRemaining={readmeGenerationsRemaining}
              plan={plan}
            />
          )}

          {activeTab === "payment" && <PaymentHistory userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { plan, readmeGenerationsRemaining } = useSubscription();

  // Handle authentication redirect in useEffect, not during render
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-gray-950 text-gray-200 min-h-screen">
      {/* Modern top navigation bar */}
      <header className="bg-gray-950 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-white text-transparent bg-clip-text">
                RepoDoc
              </h1>
            </div>

            {user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push("/subscription")}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all duration-200 font-medium"
                >
                  {plan.name === "Free"
                    ? "Upgrade Plan"
                    : "Manage Subscription"}
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-700">
                  <div className="text-right text-sm">
                    <button
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="block text-gray-300 font-medium hover:text-indigo-400 transition-colors"
                    >
                      {user.full_name}
                    </button>
                    <div className="flex items-center mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                        {plan.name} Plan
                      </span>
                      <span className="ml-2 text-gray-400 text-xs">
                        {plan.id === "pro"
                          ? "Unlimited"
                          : `${readmeGenerationsRemaining} generations left`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/profile/${user.id}`)}
                    className="bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-medium shadow-md shadow-blue-500/20"
                  >
                    {user.full_name?.charAt(0).toUpperCase()}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="ml-4 p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types/auth";
import { getCurrentUser, signOut } from "@/services/auth";
import supabase from "@/lib/supabaseClient";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  githubToken: string | null;
  hasGithubConnection: boolean;
  hasPrivateRepoAccess: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  githubToken: null,
  hasGithubConnection: false,
  hasPrivateRepoAccess: false,
  error: null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [hasPrivateRepoAccess, setHasPrivateRepoAccess] =
    useState<boolean>(false);
  const [hasGithubConnection, setHasGithubConnection] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const { user: currentUser, error: userError } = await getCurrentUser();

      if (userError) {
        throw userError;
      }

      setUser(currentUser);

      // Only proceed with GitHub token checks if user is signed in
      if (currentUser) {
        // Check if user has GitHub token and connection status
        const { data: sessionData } = await supabase.auth.getSession();
        const provider = sessionData?.session?.user?.app_metadata?.provider;

        setHasGithubConnection(
          currentUser.github_connected || provider === "github"
        );

        if (provider === "github" || currentUser.github_connected) {
          // Extract GitHub token
          const token = sessionData?.session?.provider_token;

          if (token) {
            console.log("Found GitHub provider token, setting token");
            setGithubToken(token);

            // Check if token has private repo access
            try {
              console.log("Testing GitHub token validity");
              const response = await fetch("https://api.github.com/user", {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              });

              if (response.ok) {
                const userData = await response.json();
                const hasPrivateAccess = userData.plan?.private_repos > 0;
                console.log(
                  "GitHub token is valid, has private access:",
                  hasPrivateAccess
                );
                setHasPrivateRepoAccess(hasPrivateAccess);
              } else {
                console.warn(
                  "GitHub token invalid or expired:",
                  await response.text()
                );
                // Don't throw here, just set token to null
                setGithubToken(null);
              }
            } catch (tokenError) {
              console.error("Error checking private repo access:", tokenError);
              // Don't throw here either, just set token to null
              setGithubToken(null);
            }
          } else {
            console.log("No GitHub token found in session");
            setGithubToken(null);
            setHasPrivateRepoAccess(false);
          }
        } else {
          // User is logged in but not with GitHub and doesn't have a connection
          console.log("User not logged in with GitHub and no connection");
          setGithubToken(null);
          setHasPrivateRepoAccess(false);
        }
      } else {
        // Reset state if no user
        console.log("No user found, resetting GitHub state");
        setGithubToken(null);
        setHasGithubConnection(false);
        setHasPrivateRepoAccess(false);
      }
    } catch (refreshError) {
      console.error("Error refreshing user:", refreshError);
      setError(refreshError as Error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setGithubToken(null);
      setHasGithubConnection(false);
      setHasPrivateRepoAccess(false);
      window.location.href = "/";
    } catch (logoutError) {
      console.error("Error during logout:", logoutError);
      setError(logoutError as Error);
    }
  };

  useEffect(() => {
    // Set mounted to true once the component mounts
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initial user check when component mounts
    const loadUserData = async () => {
      try {
        console.log("AuthProvider: Initial loading of user data");
        await refreshUser();
      } catch (err) {
        console.error("AuthProvider: Error during initial user load:", err);
        // Don't set loading to false here yet, to avoid flashing content
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Set up listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthProvider: Auth state changed:", {
        event,
        hasSession: !!session,
      });

      if (session) {
        // Attempt to refresh user data when we get a session
        refreshUser().catch((err) => {
          console.error(
            "AuthProvider: Error refreshing after auth change:",
            err
          );
          // Even if refresh fails, we still have a session
          setLoading(false);
        });
      } else {
        // No session, update state accordingly
        setUser(null);
        setGithubToken(null);
        setHasGithubConnection(false);
        setHasPrivateRepoAccess(false);
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [mounted]);

  const value = {
    user,
    loading,
    githubToken,
    hasGithubConnection,
    hasPrivateRepoAccess,
    error,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

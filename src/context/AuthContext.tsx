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
      console.log("AuthContext: Beginning full user refresh");

      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.log("AuthContext: No session found during refresh");
        setUser(null);
        setGithubToken(null);
        setHasGithubConnection(false);
        setHasPrivateRepoAccess(false);
        return;
      }

      const userId = sessionData.session.user.id;

      // Get current profile data first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("AuthContext: Current profile data:", {
        profileData,
        profileError,
      });

      // Get GitHub identity data if it exists
      const { data: githubIdentity, error: githubError } = await supabase
        .from("github_identities")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("AuthContext: GitHub identity data:", {
        githubIdentity,
        githubError,
      });

      // Get full user profile with preserved data
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      // Get or create the user profile
      if (userData.user) {
        // Ensure we preserve the original email and auth provider if this is a GitHub connection
        if (profileData) {
          const preservedUser = {
            ...profileData,
            email: profileData.email || userData.user.email,
            auth_provider:
              profileData.auth_provider ||
              userData.user.app_metadata?.provider ||
              "email",
          };
          setUser(preservedUser);
        } else {
          // Create/update profile without GitHub data - let the callback handle GitHub data
          const { user: currentUser, error: profileError } =
            await getCurrentUser();
          if (profileError) throw profileError;
          setUser(currentUser);
        }

        // Use the most accurate information for GitHub connection
        const githubConnected = !!(
          githubIdentity?.access_token ||
          (profileData?.github_connected &&
            userData.user.app_metadata?.provider === "github")
        );
        setHasGithubConnection(githubConnected);

        console.log("User GitHub connection status:", {
          userId: userData.user.id,
          provider: userData.user.app_metadata?.provider,
          hasGithubIdentity: !!githubIdentity,
          githubConnected,
        });

        // Handle GitHub token
        if (
          githubConnected &&
          (githubIdentity?.access_token || sessionData.session?.provider_token)
        ) {
          const token =
            githubIdentity?.access_token || sessionData.session.provider_token;
          console.log("Found GitHub token");

          try {
            console.log("Testing GitHub token validity");
            const response = await fetch("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            if (response.ok) {
              console.log("GitHub token is valid");
              setGithubToken(token);
              const userData = await response.json();
              setHasPrivateRepoAccess(userData.plan?.private_repos > 0);

              // Only update user metadata if the values have actually changed
              const currentMetadata =
                sessionData.session.user.user_metadata || {};
              const needsUpdate =
                currentMetadata.github_token !== token ||
                !currentMetadata.github_connected ||
                currentMetadata.github_username !==
                  githubIdentity?.github_username;

              if (needsUpdate) {
                await supabase.auth.updateUser({
                  data: {
                    github_token: token,
                    github_connected: true,
                    github_username: githubIdentity?.github_username,
                  },
                });
              }
            } else {
              console.warn(
                "GitHub token invalid or expired:",
                await response.text()
              );
              setGithubToken(null);
              setHasPrivateRepoAccess(false);
              setHasGithubConnection(false);

              // Only clear metadata if it's not already cleared
              const currentMetadata =
                sessionData.session.user.user_metadata || {};
              if (
                currentMetadata.github_token ||
                currentMetadata.github_connected
              ) {
                await supabase.auth.updateUser({
                  data: {
                    github_token: null,
                    github_connected: false,
                  },
                });
              }
            }
          } catch (tokenError) {
            console.error("Error checking GitHub token:", tokenError);
            setGithubToken(null);
            setHasPrivateRepoAccess(false);
            setHasGithubConnection(false);
          }
        } else {
          console.log("No GitHub connection found");
          setGithubToken(null);
          setHasPrivateRepoAccess(false);
        }
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

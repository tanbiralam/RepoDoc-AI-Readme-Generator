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

      // Directly query the profiles table to get the most up-to-date connection status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("github_connected, auth_provider")
        .eq("id", userId)
        .single();

      console.log("AuthContext: Direct profile query result:", {
        profileData,
        profileError,
      });

      // Get full user profile
      const { user: currentUser, error: userError } = await getCurrentUser();

      if (userError) {
        throw userError;
      }

      setUser(currentUser);

      // Use the most accurate information for GitHub connection
      const githubConnected =
        profileData?.github_connected || currentUser?.github_connected || false;
      const provider = sessionData?.session?.user?.app_metadata?.provider;
      const hasConnection = githubConnected || provider === "github";

      console.log("User GitHub connection status:", {
        userId: currentUser?.id,
        provider,
        directQueryGithubConnected: profileData?.github_connected,
        profileGithubConnected: currentUser?.github_connected,
        finalConnectionStatus: hasConnection,
      });

      // Set GitHub connection status using most accurate information
      setHasGithubConnection(hasConnection);

      // Only proceed with GitHub token checks if user is signed in
      if (currentUser) {
        if (provider === "github" || hasConnection) {
          // Extract GitHub token - first check provider_token, then metadata
          const providerToken = sessionData?.session?.provider_token;
          const metadataToken =
            sessionData?.session?.user?.user_metadata?.github_token;
          const token = providerToken || metadataToken;

          console.log("GitHub token sources:", {
            hasProviderToken: !!providerToken,
            hasMetadataToken: !!metadataToken,
            finalTokenAvailable: !!token,
          });

          if (token) {
            console.log("Found GitHub token, setting token");
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

                // If token is invalid but profile says GitHub is connected,
                // we should still consider GitHub as connected but try to refresh
                if (currentUser.github_connected) {
                  console.log(
                    "GitHub token invalid but profile has GitHub connection - may need to reconnect"
                  );

                  // If the token in metadata is invalid, clear it to avoid future issues
                  if (metadataToken) {
                    try {
                      console.log(
                        "Clearing invalid GitHub token from metadata"
                      );
                      await supabase.auth.updateUser({
                        data: {
                          github_token: null,
                        },
                      });
                    } catch (clearError) {
                      console.error(
                        "Error clearing invalid token:",
                        clearError
                      );
                    }
                  }
                }
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

            // If database says GitHub is connected but no token is found,
            // log this inconsistency but respect the database state
            if (hasConnection) {
              console.log(
                "GitHub connected in database but no token found - user may need to reconnect"
              );
            }
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

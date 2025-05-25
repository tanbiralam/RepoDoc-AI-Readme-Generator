"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserProfile, AuthProvider as AuthProviderType } from "@/types/auth";
import { signOut } from "@/services/auth";
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshUser = useCallback(
    async (
      sessionFromEvent?: import("@supabase/supabase-js").Session | null
    ) => {
      if (isRefreshing) {
        console.log("AuthContext: refreshUser already in progress, skipping.");
        return;
      }
      setIsRefreshing(true);

      try {
        console.log("AuthContext: Beginning full user refresh", {
          sessionSource: sessionFromEvent ? "event" : "fetch",
        });
        setLoading(true); // Ensure loading is true at the start of a refresh

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!sessionData.session) {
          console.log("AuthContext: No session found during refresh");
          setUser(null);
          setGithubToken(null);
          setHasGithubConnection(false);
          setHasPrivateRepoAccess(false);
          setLoading(false);
          return;
        }

        const authUser = sessionData.session.user;
        const userId = authUser.id;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        // If profileError and it's not 'PGRST116' (0 rows), throw it.
        // If it is PGRST116, profileData will be null, which is handled below.
        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        console.log("AuthContext: Fetched profile data:", { profileData });

        const { data: githubIdentity, error: githubError } = await supabase
          .from("github_identities")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (githubError) {
          console.warn(
            "AuthContext: Error fetching github_identity:",
            githubError
          );
          // Don't throw, proceed without it if it fails for some reason (e.g. RLS)
        }
        console.log("AuthContext: Fetched GitHub identity data:", {
          githubIdentity,
        });

        // Construct UserProfile directly here
        // This part needs to replicate the logic from getCurrentUser or simplify it.
        // For now, let's assume profileData is the primary source, augmented by authUser.
        if (profileData) {
          const combinedUser: UserProfile = {
            ...profileData, // Spread all fields from profiles table
            id: authUser.id, // Ensure authUser.id is authoritative
            email: profileData.email || authUser.email!, // Prefer profile email, fallback to authUser
            // Other fields like avatar_url, full_name will come from profileData if they exist
            // Ensure all UserProfile fields are covered
          };
          setUser(combinedUser);
          console.log(
            "AuthContext: User state set from profileData:",
            combinedUser
          );
        } else {
          // Profile doesn't exist. This is a critical state.
          // Ideally, a profile should be created upon sign-up.
          // For a refresh, if it's missing, it indicates an issue or a new user post-signup pre-profile-creation.
          // We might need to call a minimal profile creation here, or log an error.
          // For now, set user based on authUser, but this might be incomplete.
          console.warn(
            `AuthContext: Profile data not found for user ${userId}. User may need profile creation.`
          );
          const minimalUser: UserProfile = {
            id: authUser.id,
            email: authUser.email!,
            avatar_url: authUser.user_metadata?.avatar_url || undefined,
            full_name: authUser.user_metadata?.full_name || undefined,
            github_username:
              githubIdentity?.github_username ||
              authUser.user_metadata?.github_username ||
              undefined,
            subscription_tier: "free",
            readme_generations_count: 0,
            auth_provider: (authUser.app_metadata?.provider === "github"
              ? "github"
              : "email") as AuthProviderType,
            github_connected: !!(
              githubIdentity?.access_token ||
              (profileData?.github_connected &&
                authUser.app_metadata?.provider === "github")
            ),
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(minimalUser);
          // TODO: Consider triggering profile creation if profileData is null and session exists
          // This might involve calling a simplified version of upsertUserProfile from auth.ts
          // For now, logging a warning.
        }

        const githubConnected = !!(
          githubIdentity?.access_token ||
          (profileData?.github_connected &&
            authUser.app_metadata?.provider === "github")
        );
        setHasGithubConnection(githubConnected);
        console.log("AuthContext: GitHub connection status:", {
          githubConnected,
        });

        if (
          githubConnected &&
          (githubIdentity?.access_token || sessionData.session?.provider_token)
        ) {
          const token =
            githubIdentity?.access_token || sessionData.session.provider_token;
          console.log(
            "AuthContext: Found GitHub token, proceeding to validate."
          );

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
              // setHasGithubConnection(false); // Re-evaluate if this should be set based on token failure
            }
          } catch (tokenError) {
            console.error("Error checking GitHub token:", tokenError);
            setGithubToken(null);
            setHasPrivateRepoAccess(false);
            // If no token, but was previously connected via profileData, retain hasGithubConnection true from above.
          }
        } else {
          console.log(
            "AuthContext: No GitHub token or connection details found for token validation."
          );
          setGithubToken(null);
          setHasPrivateRepoAccess(false);
          // If no token, but was previously connected via profileData, retain hasGithubConnection true from above.
        }
        // Removed the direct call to getCurrentUser() and its subsequent setUser() call
        // The user state is now set directly from profileData or a minimal user object.
      } catch (refreshError: unknown) {
        console.error("AuthContext: Error refreshing user:", refreshError);
        setError(refreshError as Error);
        setUser(null);
        setGithubToken(null);
        setHasGithubConnection(false);
        setHasPrivateRepoAccess(false);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [isRefreshing]
  );

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthProvider: Auth state changed:", {
        event,
        sessionToken: session?.access_token?.slice(-5),
      });

      // Skip refresh for visibility change events
      if (document.visibilityState === "hidden") {
        console.log("AuthProvider: Skipping refresh for hidden tab");
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        if (session) {
          // Only refresh if we don't have a user or if the session user ID is different
          const currentUser = user as UserProfile | null;
          if (!currentUser || currentUser.id !== session.user.id) {
            console.log(
              "AuthProvider: Refreshing user data due to auth state change"
            );
            refreshUser(session);
          } else {
            console.log(
              "AuthProvider: Skipping refresh - user data already present"
            );
          }
        } else if (event === "INITIAL_SESSION" && !session) {
          // Initial check, no session found.
          setUser(null);
          setGithubToken(null);
          setHasGithubConnection(false);
          setHasPrivateRepoAccess(false);
          setLoading(false); // Explicitly set loading false as refreshUser won't run
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setGithubToken(null);
        setHasGithubConnection(false);
        setHasPrivateRepoAccess(false);
        setError(null); // Clear any previous errors on logout
        setLoading(false); // Explicitly set loading false
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [user, refreshUser]); // Add user and refreshUser to dependencies

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

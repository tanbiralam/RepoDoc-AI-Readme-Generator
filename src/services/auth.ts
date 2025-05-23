import supabase from "@/lib/supabaseClient";
import {
  AuthResponse,
  AuthUser,
  UserProfile,
  SignInCredentials,
  GitHubOAuthOptions,
  GitHubIdentity,
} from "@/types/auth";
import { toast } from "react-hot-toast";

/**
 * Create or update a GitHub identity for a user
 */
const upsertGitHubIdentity = async (
  userId: string,
  githubId: string,
  githubUsername: string,
  githubEmail: string | null,
  accessToken: string
): Promise<GitHubIdentity | null> => {
  try {
    console.log("Creating/updating GitHub identity:", {
      userId,
      githubId,
      githubUsername,
    });

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1); // Token expires in 1 hour

    const githubData = {
      user_id: userId,
      github_id: githubId,
      github_username: githubUsername,
      github_email: githubEmail,
      access_token: accessToken,
      token_expires_at: tokenExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to update existing identity first
    const { data: existingIdentity } = await supabase
      .from("github_identities")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingIdentity) {
      // Update existing identity
      const { data: updatedIdentity, error: updateError } = await supabase
        .from("github_identities")
        .update(githubData)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedIdentity;
    } else {
      // Create new identity
      const { data: newIdentity, error: insertError } = await supabase
        .from("github_identities")
        .insert(githubData)
        .select()
        .single();

      if (insertError) throw insertError;
      return newIdentity;
    }
  } catch (error) {
    console.error("Error upserting GitHub identity:", error);
    throw error;
  }
};

/**
 * Get GitHub identity for a user
 */
export const getGitHubIdentity = async (
  userId: string
): Promise<GitHubIdentity | null> => {
  try {
    const { data, error } = await supabase
      .from("github_identities")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No identity found
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting GitHub identity:", error);
    return null;
  }
};

/**
 * Create or update a user profile in the database
 */
const upsertUserProfile = async (
  user: AuthUser,
  authProvider: "email" | "github",
  githubData?: {
    githubId: string;
    githubUsername: string;
    githubEmail: string | null;
    accessToken: string;
  }
): Promise<UserProfile | null> => {
  try {
    console.log("Creating/updating user profile:", {
      userId: user.id,
      provider: authProvider,
      hasGithubData: !!githubData,
    });

    // First check if profile exists to get current data
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Get user metadata with fallbacks for all fields
    const avatar_url =
      user.user_metadata?.avatar_url || existingProfile?.avatar_url || "";
    const full_name =
      existingProfile?.full_name || // Preserve existing name
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    // Preserve existing email unless this is a new profile
    const email = existingProfile
      ? existingProfile.email // Keep existing email for existing profiles
      : user.email || user.user_metadata?.email || "";

    // Create or update profile data
    const profileData = {
      id: user.id,
      email: email || `user-${user.id}@example.com`, // Fallback email
      avatar_url,
      full_name,
      subscription_tier: existingProfile?.subscription_tier || "free",
      readme_generations_count: existingProfile?.readme_generations_count || 0,
      auth_provider: existingProfile?.auth_provider || authProvider,
      // Only set github_connected to true if we have valid GitHub data or it was previously connected
      github_connected: !!(
        existingProfile?.github_connected ||
        (githubData && githubData.githubId && githubData.githubUsername)
      ),
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update or insert profile
    const { data: upsertedProfile, error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileData)
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting profile:", upsertError);
      throw upsertError;
    }

    // If we have valid GitHub data, create/update the GitHub identity
    if (
      githubData &&
      githubData.githubId &&
      githubData.githubUsername &&
      githubData.accessToken
    ) {
      try {
        // First check if a GitHub identity already exists for this GitHub ID
        const { data: existingIdentity } = await supabase
          .from("github_identities")
          .select("user_id")
          .eq("github_id", githubData.githubId)
          .maybeSingle();

        if (existingIdentity && existingIdentity.user_id !== user.id) {
          console.error("GitHub account already connected to a different user");
          throw new Error(
            "This GitHub account is already connected to a different user"
          );
        }

        const githubIdentity = await upsertGitHubIdentity(
          user.id,
          githubData.githubId,
          githubData.githubUsername,
          githubData.githubEmail,
          githubData.accessToken
        );

        if (githubIdentity) {
          // Update profile to mark GitHub as connected
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              github_connected: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) {
            console.error(
              "Error updating profile GitHub connection:",
              updateError
            );
          }
        }
      } catch (error) {
        console.error("Error handling GitHub identity:", error);
        // Don't throw here - we still want to return the profile
      }
    }

    return upsertedProfile;
  } catch (error) {
    console.error("Error in upsertUserProfile:", error);
    throw error;
  }
};

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async ({
  email,
  password,
  fullName,
}: SignInCredentials): Promise<AuthResponse> => {
  try {
    console.log("Signing up with email:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split("@")[0], // Use provided name or default to email username
        },
      },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      toast.error(`Sign up failed: ${error.message}`);
      throw error;
    }

    console.log("Signup successful, user data:", {
      userId: data.user?.id,
      email: data.user?.email,
      hasUser: !!data.user,
    });

    // Create/update user profile
    if (data.user) {
      try {
        const profile = await upsertUserProfile(data.user, "email");
        if (!profile) {
          console.error("Failed to create user profile after signup");
          throw new Error("Failed to create user profile");
        }

        return {
          user: profile,
          error: null,
          requiresGithubConnection: true,
        };
      } catch (profileError) {
        console.error("Error creating profile after signup:", profileError);
        throw profileError;
      }
    }

    throw new Error("User sign up failed - no user returned from Supabase");
  } catch (error) {
    console.error("Error signing up:", error);
    return { user: null, error: error as Error };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async ({
  email,
  password,
}: SignInCredentials): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
      throw error;
    }

    if (data.user) {
      try {
        // First get the profile to ensure we have access
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // If profile doesn't exist, create it
          if (profileError.code === "PGRST116") {
            const profile = await upsertUserProfile(data.user, "email");
            if (!profile) {
              throw new Error("Failed to create user profile");
            }
            toast.success(`Welcome back, ${profile.full_name || "User"}!`);
            return {
              user: profile,
              error: null,
              requiresGithubConnection: true,
            };
          }
          throw profileError;
        }

        // Check if user has GitHub connected
        const { data: githubIdentity, error: githubError } = await supabase
          .from("github_identities")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (githubError && githubError.code !== "PGRST116") {
          console.error("Error checking GitHub identity:", githubError);
        }

        // Use existing profile data if available
        const profile =
          profileData || (await upsertUserProfile(data.user, "email"));
        if (!profile) {
          throw new Error("Failed to get user profile");
        }

        toast.success(`Welcome back, ${profile.full_name || "User"}!`);

        return {
          user: profile,
          error: null,
          requiresGithubConnection: !githubIdentity,
        };
      } catch (profileError) {
        console.error("Error handling profile:", profileError);
        throw profileError;
      }
    }

    throw new Error("User sign in failed");
  } catch (error) {
    console.error("Error signing in:", error);
    return { user: null, error: error as Error };
  }
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async (
  options: GitHubOAuthOptions = {}
): Promise<{ error: Error | null }> => {
  try {
    console.log("Starting GitHub sign-in process");

    // Ensure we include query parameters properly with consistent format
    let baseRedirectUrl =
      options.redirectTo || `${window.location.origin}/auth/callback`;

    // Add redirect_to parameter if not already included
    if (!baseRedirectUrl.includes("redirect_to=")) {
      baseRedirectUrl +=
        (baseRedirectUrl.includes("?") ? "&" : "?") + "redirect_to=/dashboard";
    }

    const scopes = options.scopes || ["read:user", "user:email", "repo"];
    console.log("GitHub auth redirect URL:", baseRedirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: baseRedirectUrl,
        scopes: scopes.join(" "),
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error("Supabase GitHub auth error:", error);
      throw error;
    }

    if (data?.url) {
      console.log("Redirecting to GitHub auth URL");
      window.location.href = data.url;
      return { error: null };
    } else {
      console.error("No redirect URL provided by Supabase for GitHub auth");
      throw new Error("No redirect URL provided by Supabase");
    }
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    return { error: error as Error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Sign out failed: ${error.message}`);
      throw error;
    }

    toast.success("You have been signed out successfully");
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: error as Error };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<{
  user: UserProfile | null;
  error: Error | null;
}> => {
  try {
    // First check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();

    // If no session, return null without an error
    if (!sessionData.session) {
      return { user: null, error: null };
    }

    // If we have a session, get the user
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    // Get or create the user profile
    if (data.user) {
      const userId = data.user.id;

      // First check current database state for GitHub connection
      const { data: profileData } = await supabase
        .from("profiles")
        .select("github_connected, auth_provider")
        .eq("id", userId)
        .single();

      const authProvider =
        (data.user.app_metadata?.provider as "email" | "github") || "email";

      // Use database value for GitHub connection if available, otherwise derive from provider
      const isGithubConnected =
        profileData?.github_connected === true || authProvider === "github";

      console.log("getCurrentUser - derived connection status:", {
        userId,
        dbGithubConnected: profileData?.github_connected,
        provider: authProvider,
        finalStatus: isGithubConnected,
      });

      // Create/update profile without GitHub data - let the callback handle GitHub data
      const profile = await upsertUserProfile(data.user, authProvider);

      return { user: profile, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error: error as Error };
  }
};

/**
 * Connect the current user account with GitHub
 */
export const connectGitHub = async (
  options: GitHubOAuthOptions = {}
): Promise<{ error: Error | null }> => {
  try {
    // Ensure the user has a current session before trying to connect
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No active session when trying to connect GitHub");
      return { error: new Error("You need to be logged in to connect GitHub") };
    }

    const userId = sessionData.session.user.id;
    console.log(`Connecting GitHub for user: ${userId}`);

    // Configure the OAuth connection with parameters to ensure token capture
    const redirectTo =
      options.redirectTo ||
      `${window.location.origin}/auth/callback?connect=github&redirect_to=/dashboard&github_connection=success&user=${userId}&capture_token=true`;
    const scopes = options.scopes || ["read:user", "user:email", "repo"];

    console.log("Connecting GitHub with details:", {
      userId,
      redirectTo,
      scopes,
    });

    // Use signInWithOAuth with token capture parameters
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: scopes.join(" "),
        skipBrowserRedirect: false,
        queryParams: {
          connect: "github",
          capture_token: "true",
        },
      },
    });

    if (error) {
      console.error("Supabase GitHub connection error:", error);
      throw error;
    }

    if (data?.url) {
      console.log("Redirecting to GitHub auth URL:", data.url);
      window.location.href = data.url;
      return { error: null };
    } else {
      console.error("No redirect URL provided by Supabase");
      throw new Error("No redirect URL provided by Supabase");
    }
  } catch (error) {
    console.error("Error connecting GitHub:", error);
    return { error: error as Error };
  }
};

/**
 * Reset user password by sending a password reset email
 */
export const resetPassword = async (
  email: string
): Promise<{ error: Error | null }> => {
  try {
    console.log("Sending password reset email to:", email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      throw error;
    }

    console.log("Password reset email sent successfully");
    return { error: null };
  } catch (error) {
    console.error("Error in password reset:", error);
    return { error: error as Error };
  }
};

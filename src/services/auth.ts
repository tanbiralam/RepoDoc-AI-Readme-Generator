import supabase from "@/lib/supabaseClient";
import {
  AuthResponse,
  AuthUser,
  UserProfile,
  SignInCredentials,
  GitHubOAuthOptions,
  GoogleOAuthOptions,
} from "@/types/auth";
import { toast } from "react-hot-toast";

/**
 * Create or update a user profile in the database
 */
const upsertUserProfile = async (
  user: AuthUser,
  authProvider: "email" | "github" | "google",
  githubConnected: boolean = false
): Promise<UserProfile | null> => {
  try {
    console.log("Creating/updating user profile:", {
      userId: user.id,
      provider: authProvider,
      githubConnected,
    });

    // Get user metadata with fallbacks for all fields
    const avatar_url = user.user_metadata?.avatar_url || "";
    const full_name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    const email = user.email || user.user_metadata?.email || "";

    // First try to update the profile directly - if it exists this will work
    // If it doesn't exist, we'll get an error and then create it
    try {
      console.log("Attempting to update profile for user:", user.id);
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          email,
          avatar_url,
          full_name,
          auth_provider: authProvider,
          github_connected: githubConnected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (!error) {
        console.log("Successfully updated existing profile");
        return updatedProfile as UserProfile;
      }

      // If error code is not PGRST116 (not found), it's a real error
      if (error.code !== "PGRST116") {
        console.error("Error updating profile:", error);
        throw error;
      }

      // If we get here, profile doesn't exist and needs to be created
    } catch (updateError) {
      console.log("Profile doesn't exist yet or update error:", updateError);
      // Continue to create profile
    }

    // Determine GitHub username if available
    let github_username = "";
    if (authProvider === "github") {
      // For GitHub auth provider, we'll leave this empty for now
      // The username could be extracted from the session data if needed
      github_username = ""; // Left empty intentionally - can be updated by the user later
    }

    // Try to create the profile
    console.log("Creating new profile for user:", user.id);

    // First check if profile already exists to avoid duplicate key error
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      console.log("Profile already exists, trying update again");
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          email,
          avatar_url,
          full_name,
          auth_provider: authProvider,
          github_connected: githubConnected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating existing profile:", error);
        throw error;
      }

      return updatedProfile as UserProfile;
    }

    // Create new profile with fallbacks for all fields
    const profileData = {
      id: user.id,
      email: email || `user-${user.id}@example.com`, // Fallback email
      avatar_url,
      full_name,
      github_username,
      subscription_tier: "free",
      readme_generations_count: 0,
      auth_provider: authProvider,
      github_connected: githubConnected,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("New profile data:", profileData);

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
    return newProfile as UserProfile;
  } catch (error) {
    console.error("Error upserting user profile:", error);
    return null;
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

    toast.success(
      "Account created successfully! Please check your email for verification."
    );

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
      const profile = await upsertUserProfile(data.user, "email");
      if (!profile) {
        toast.error("Failed to get user profile");
        throw new Error("Failed to get user profile");
      }

      toast.success(`Welcome back, ${profile.full_name || "User"}!`);

      return {
        user: profile,
        error: null,
        requiresGithubConnection: !profile.github_connected,
      };
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
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (
  options: GoogleOAuthOptions = {}
): Promise<{ error: Error | null }> => {
  try {
    console.log("Starting Google sign-in process");

    // Ensure we include query parameters properly with consistent format
    let baseRedirectUrl =
      options.redirectTo || `${window.location.origin}/auth/callback`;

    // Add redirect_to parameter if not already included
    if (!baseRedirectUrl.includes("redirect_to=")) {
      baseRedirectUrl +=
        (baseRedirectUrl.includes("?") ? "&" : "?") + "redirect_to=/dashboard";
    }

    console.log("Google auth redirect URL:", baseRedirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: baseRedirectUrl,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error("Supabase Google auth error:", error);
      throw error;
    }

    if (data?.url) {
      console.log("Redirecting to Google auth URL");
      window.location.href = data.url;
      return { error: null };
    } else {
      console.error("No redirect URL provided by Supabase for Google auth");
      throw new Error("No redirect URL provided by Supabase");
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
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
        (data.user.app_metadata?.provider as "email" | "github" | "google") ||
        "email";

      // Use database value for GitHub connection if available, otherwise derive from provider
      const isGithubConnected =
        profileData?.github_connected === true || authProvider === "github";

      console.log("getCurrentUser - derived connection status:", {
        userId,
        dbGithubConnected: profileData?.github_connected,
        provider: authProvider,
        finalStatus: isGithubConnected,
      });

      const profile = await upsertUserProfile(
        data.user,
        authProvider,
        isGithubConnected
      );

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

    // First update the profile to indicate GitHub connection is in progress
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          github_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "Error updating profile before GitHub connection:",
          updateError
        );
      } else {
        console.log(
          "Updated profile to indicate GitHub connection in progress"
        );
      }
    } catch (profileError) {
      console.error(
        "Exception updating profile before GitHub connection:",
        profileError
      );
    }

    // Force GitHub connection to true in database immediately to handle edge cases
    // This ensures the profile shows as connected even if the OAuth token is missing
    try {
      const { error: forceUpdateError } = await supabase
        .from("profiles")
        .update({
          github_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (forceUpdateError) {
        console.error("Error forcing GitHub connection:", forceUpdateError);
      } else {
        console.log("Forced GitHub connection to true in database");
      }
    } catch (forceError) {
      console.error("Exception forcing GitHub connection:", forceError);
    }

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

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to") || "/dashboard";
  const isConnection = requestUrl.searchParams.get("connect") === "github";
  const isDirectGitHubLogin =
    requestUrl.searchParams.get("direct_github_login") === "true";
  const userId = requestUrl.searchParams.get("user"); // Capture userId from the query string
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Create a detailed log of all query parameters for debugging
  const allParams: Record<string, string> = {};
  requestUrl.searchParams.forEach((value, key) => {
    allParams[key] = value;
  });

  // Log all parameters for debugging
  console.log("AUTH CALLBACK: Full request details", {
    url: request.url,
    allParams,
    code: code ? "exists" : "missing",
    redirectTo,
    isConnection,
    isDirectGitHubLogin,
    userId,
    error,
    errorCode,
    errorDescription,
  });

  // Process the redirectTo URL to ensure all query parameters are preserved
  let processedRedirectTo = redirectTo;
  // If redirect has query parameters to preserve, ensure they're handled properly
  if (redirectTo.includes("github_connection=success")) {
    console.log(
      "AUTH CALLBACK: Found github_connection parameter in redirect URL"
    );
  }

  // For direct GitHub login, redirect with direct_github_login=true
  if (isDirectGitHubLogin) {
    processedRedirectTo =
      redirectTo +
      (redirectTo.includes("?") ? "&" : "?") +
      "direct_github_login=true";
    console.log(
      "AUTH CALLBACK: Added direct_github_login parameter to redirect URL",
      processedRedirectTo
    );
  }
  // For GitHub connection, redirect with github_connection=success
  else if (isConnection) {
    processedRedirectTo =
      redirectTo +
      (redirectTo.includes("?") ? "&" : "?") +
      "github_connection=success";
    console.log(
      "AUTH CALLBACK: Added github_connection parameter to redirect URL",
      processedRedirectTo
    );
  }

  // If we already have an error from Supabase, redirect with that error
  if (error) {
    console.error("AUTH CALLBACK: Supabase error in callback:", {
      error,
      errorCode,
      errorDescription,
    });

    // Special handling for state validation errors
    if (error === "invalid_request" && errorCode === "bad_oauth_state") {
      console.log(
        "AUTH CALLBACK: Detected OAuth state validation error, redirecting to recovery page"
      );
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=invalid_request&error_code=bad_oauth_state&description=${encodeURIComponent(
            "Please try connecting again"
          )}`,
          requestUrl.origin
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${error}&description=${encodeURIComponent(
          errorDescription || ""
        )}`,
        requestUrl.origin
      )
    );
  }

  try {
    if (code) {
      console.log("AUTH CALLBACK: Exchanging code for session with Supabase");
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // First check if user already has a session
      const { data: existingSessionData } = await supabase.auth.getSession();
      console.log("AUTH CALLBACK: Existing session before code exchange:", {
        hasSession: !!existingSessionData.session,
        provider: existingSessionData.session?.user?.app_metadata?.provider,
        userId: existingSessionData.session?.user?.id,
        matchesExpectedUser: existingSessionData.session?.user?.id === userId,
      });

      // Exchange the code for a session
      console.log("AUTH CALLBACK: Attempting to exchange code");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(
          "AUTH CALLBACK: Error exchanging code for session:",
          error
        );
        return NextResponse.redirect(
          new URL(
            `/sign-in?error=exchange_failed&description=${encodeURIComponent(
              error.message
            )}`,
            requestUrl.origin
          )
        );
      }

      console.log("AUTH CALLBACK: Successfully exchanged code for session", {
        userId: data?.session?.user?.id,
        hasSession: !!data?.session,
        provider: data?.session?.user?.app_metadata?.provider,
        providerToken: data?.session?.provider_token ? "exists" : "missing",
        isConnection,
        isDirectGitHubLogin,
      });

      // If this is a direct GitHub login, update the profile to mark GitHub as connected
      if (
        isDirectGitHubLogin &&
        data?.session?.user &&
        data.session.user.app_metadata?.provider === "github"
      ) {
        try {
          const userId = data.session.user.id;
          console.log(
            "AUTH CALLBACK: Processing direct GitHub login for user:",
            userId
          );

          // Update the profile with GitHub connection flag
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({
              github_connected: true,
              auth_provider: "github",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select("*")
            .single();

          if (updateError) {
            console.error(
              "AUTH CALLBACK: Error updating profile after direct GitHub login:",
              updateError
            );
          } else {
            console.log(
              "AUTH CALLBACK: Successfully updated user profile for direct GitHub login",
              updatedProfile
            );

            // Store the GitHub token in the user's metadata to ensure it persists
            if (data.session?.provider_token) {
              console.log(
                "AUTH CALLBACK: Saving GitHub provider token after direct login"
              );
              const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                  github_token: data.session.provider_token,
                  github_connected: true,
                },
              });

              if (metadataError) {
                console.error(
                  "AUTH CALLBACK: Error saving GitHub token after direct login:",
                  metadataError
                );
              }
            }
          }
        } catch (profileError) {
          console.error(
            "AUTH CALLBACK: Exception updating profile after direct GitHub login:",
            profileError
          );
        }
      }
      // If this is a GitHub connection for an existing user (not a login)
      else if (isConnection && data?.session?.user) {
        try {
          // Special handling for GitHub connection
          const effectiveUserId = userId || data.session.user.id;

          console.log(
            "AUTH CALLBACK: Processing GitHub connection for user:",
            effectiveUserId
          );

          // First check if we need to update the user profile
          const { data: profileData, error: selectError } = await supabase
            .from("profiles")
            .select("github_connected, auth_provider")
            .eq("id", effectiveUserId)
            .single();

          console.log("AUTH CALLBACK: Existing profile data:", {
            profileData,
            selectError,
          });

          // If this session is from GitHub but we're connecting to a different account
          if (userId && userId !== data.session.user.id) {
            console.log(
              "AUTH CALLBACK: Session user ID does not match expected user ID. This might be a new GitHub login instead of a connection."
            );
          }

          // Always update the profile to ensure GitHub connection is saved
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({
              github_connected: true,
              auth_provider: profileData?.auth_provider || "email", // Keep original auth provider
              updated_at: new Date().toISOString(),
            })
            .eq("id", effectiveUserId)
            .select("*")
            .single();

          if (updateError) {
            console.error(
              "AUTH CALLBACK: Error updating profile after GitHub connection:",
              updateError
            );
            // Continue anyway, since this is just updating an existing profile
          } else {
            console.log(
              "AUTH CALLBACK: Successfully updated user profile with GitHub connection",
              updatedProfile
            );

            // Store the GitHub token in the user's metadata to ensure it persists
            try {
              if (data.session?.provider_token) {
                console.log("AUTH CALLBACK: Saving GitHub provider token");
                const { error: metadataError } = await supabase.auth.updateUser(
                  {
                    data: {
                      github_token: data.session.provider_token,
                      github_connected: true,
                    },
                  }
                );

                if (metadataError) {
                  console.error(
                    "AUTH CALLBACK: Error saving GitHub token:",
                    metadataError
                  );
                }
              } else {
                console.log(
                  "AUTH CALLBACK: No provider token available to save"
                );
              }
            } catch (tokenError) {
              console.error("AUTH CALLBACK: Error saving token:", tokenError);
            }

            // Force a refresh of the session after GitHub connection
            try {
              console.log(
                "AUTH CALLBACK: Refreshing session after GitHub connection"
              );
              const { data: refreshData, error: refreshError } =
                await supabase.auth.refreshSession();
              console.log("AUTH CALLBACK: Session refresh result:", {
                success: !refreshError,
                hasSession: !!refreshData.session,
                provider: refreshData.session?.user?.app_metadata?.provider,
                providerToken: refreshData.session?.provider_token
                  ? "exists"
                  : "missing",
                userMetadataToken: refreshData.session?.user?.user_metadata
                  ?.github_token
                  ? "exists"
                  : "missing",
              });

              // If the user was signed out or session lost, try to recover
              if (!refreshData.session && existingSessionData.session) {
                console.log(
                  "AUTH CALLBACK: Session lost, will redirect to sign-in"
                );
                return NextResponse.redirect(
                  new URL(
                    "/sign-in?github_connection=completed",
                    requestUrl.origin
                  )
                );
              }
            } catch (refreshError) {
              console.error(
                "AUTH CALLBACK: Error refreshing session:",
                refreshError
              );
            }
          }
        } catch (profileError) {
          console.error(
            "AUTH CALLBACK: Exception updating profile:",
            profileError
          );
          // Continue anyway, as this is not critical
        }
      } else if (data?.session?.user) {
        // For new users via GitHub login, ensure profile exists
        try {
          const userId = data.session.user.id;
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, github_connected")
            .eq("id", userId)
            .maybeSingle();

          console.log(
            "AUTH CALLBACK: Checking existing profile:",
            existingProfile
          );

          if (!existingProfile) {
            // Create minimal profile for the user if it doesn't exist
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                email: data.session.user.email || "",
                full_name:
                  data.session.user.user_metadata?.full_name ||
                  data.session.user.user_metadata?.name ||
                  "",
                avatar_url: data.session.user.user_metadata?.avatar_url || "",
                auth_provider:
                  data.session.user.app_metadata?.provider || "github",
                github_connected: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select("*")
              .single();

            if (insertError) {
              console.error(
                "AUTH CALLBACK: Failed to create user profile:",
                insertError
              );
              return NextResponse.redirect(
                new URL(
                  `/sign-in?error=profile_creation_failed&description=${encodeURIComponent(
                    "Failed to create user profile: " + insertError.message
                  )}`,
                  requestUrl.origin
                )
              );
            }

            console.log(
              "AUTH CALLBACK: Created new profile for GitHub user",
              newProfile
            );
          } else if (!existingProfile.github_connected) {
            // If profile exists but GitHub connection is not set, update it
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({
                github_connected: true,
                auth_provider:
                  data.session.user.app_metadata?.provider || "github",
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)
              .select("*")
              .single();

            if (updateError) {
              console.error(
                "AUTH CALLBACK: Failed to update GitHub connection on profile:",
                updateError
              );
            } else {
              console.log(
                "AUTH CALLBACK: Updated existing profile with GitHub connection",
                updatedProfile
              );
            }
          }
        } catch (profileCreationError) {
          console.error(
            "AUTH CALLBACK: Profile creation error:",
            profileCreationError
          );
          return NextResponse.redirect(
            new URL(
              `/sign-in?error=profile_creation_error&description=${encodeURIComponent(
                "Error creating user profile: " + String(profileCreationError)
              )}`,
              requestUrl.origin
            )
          );
        }
      }

      // Check if session was lost and we need to redirect to sign-in
      const { data: finalSessionCheck } = await supabase.auth.getSession();
      if (!finalSessionCheck.session && existingSessionData.session) {
        console.log(
          "AUTH CALLBACK: Final check shows session was lost, redirecting to sign-in"
        );
        return NextResponse.redirect(
          new URL("/sign-in?redirectAfterAuth=true", requestUrl.origin)
        );
      }

      console.log("AUTH CALLBACK: Redirecting to:", processedRedirectTo);
      // Always redirect to the dashboard after successful authentication
      return NextResponse.redirect(
        new URL(processedRedirectTo, requestUrl.origin)
      );
    } else {
      console.error("AUTH CALLBACK: No code found in callback URL");
      return NextResponse.redirect(
        new URL("/sign-in?error=no_code", requestUrl.origin)
      );
    }
  } catch (error) {
    console.error("AUTH CALLBACK: Exception in auth callback:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=unexpected&description=${encodeURIComponent(
          errorMessage
        )}`,
        requestUrl.origin
      )
    );
  }
}

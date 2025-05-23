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
  if (requestUrl.searchParams.get("github_connection") === "success") {
    console.log(
      "AUTH CALLBACK: Adding github_connection parameter to redirect URL"
    );
    processedRedirectTo += processedRedirectTo.includes("?")
      ? "&github_connection=success"
      : "?github_connection=success";
  }

  try {
    // Initialize Supabase client with properly awaited cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => Promise.resolve(cookieStore),
    });

    if (code) {
      console.log("AUTH CALLBACK: Exchanging code for session with Supabase");

      // Get existing session before code exchange
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
          error.message
        );
        return NextResponse.redirect(
          `${requestUrl.origin}/error?message=${encodeURIComponent(
            error.message
          )}`
        );
      }

      console.log("AUTH CALLBACK: Successfully exchanged code for session", {
        userId: data.session?.user?.id,
        hasSession: !!data.session,
        provider: data.session?.user?.app_metadata?.provider,
        providerToken: data.session?.provider_token ? "exists" : "missing",
        isConnection,
        isDirectGitHubLogin,
      });

      // Only proceed with GitHub API calls if this is a GitHub login or connection
      if (
        (data.session?.user?.app_metadata?.provider === "github" ||
          isConnection) &&
        data?.session?.provider_token
      ) {
        try {
          const response = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${data.session.provider_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (response.ok) {
            const githubUser = await response.json();
            console.log("AUTH CALLBACK: Got GitHub user data:", {
              id: githubUser.id,
              login: githubUser.login,
              email: githubUser.email,
            });

            // Common GitHub identity data
            const githubIdentityData = {
              github_id: githubUser.id.toString(),
              github_username: githubUser.login,
              github_email: githubUser.email,
              access_token: data.session.provider_token,
              token_expires_at: new Date(
                Date.now() + 60 * 60 * 1000
              ).toISOString(), // 1 hour from now
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // If this is a GitHub connection for an existing user
            if (isConnection && userId) {
              try {
                // First check if a GitHub identity already exists for this GitHub ID
                const { data: existingIdentity } = await supabase
                  .from("github_identities")
                  .select("user_id")
                  .eq("github_id", githubUser.id.toString())
                  .single();

                if (existingIdentity && existingIdentity.user_id !== userId) {
                  console.error(
                    "AUTH CALLBACK: GitHub account already connected to a different user"
                  );
                  return NextResponse.redirect(
                    `${requestUrl.origin}/error?message=${encodeURIComponent(
                      "This GitHub account is already connected to a different user"
                    )}`
                  );
                }

                // Create GitHub identity for the existing user
                const { error: identityError } = await supabase
                  .from("github_identities")
                  .upsert(
                    {
                      user_id: userId,
                      ...githubIdentityData,
                    },
                    {
                      onConflict: "user_id",
                      ignoreDuplicates: false,
                    }
                  );

                if (identityError) {
                  console.error(
                    "AUTH CALLBACK: Error creating/updating GitHub identity:",
                    identityError
                  );
                  return NextResponse.redirect(
                    `${requestUrl.origin}/error?message=${encodeURIComponent(
                      "Failed to connect GitHub account"
                    )}`
                  );
                }

                console.log(
                  "AUTH CALLBACK: Successfully created GitHub identity"
                );

                // Only update the profile after successfully creating the GitHub identity
                const { error: profileError } = await supabase
                  .from("profiles")
                  .update({
                    github_connected: true,
                    github_username: githubUser.login,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", userId);

                if (profileError) {
                  console.error(
                    "AUTH CALLBACK: Error updating profile:",
                    profileError
                  );
                }

                // Store the GitHub token in user metadata for both sessions
                const updateMetadata = async (sessionUserId: string) => {
                  const { error: metadataError } =
                    await supabase.auth.updateUser({
                      data: {
                        github_token: data.session.provider_token,
                        github_connected: true,
                        github_username: githubUser.login,
                      },
                    });

                  if (metadataError) {
                    console.error(
                      `AUTH CALLBACK: Error updating user metadata for ${sessionUserId}:`,
                      metadataError
                    );
                  }
                };

                // Update metadata for both the original user and the GitHub session user
                await updateMetadata(userId);
                if (data.session?.user?.id !== userId) {
                  await updateMetadata(data.session.user.id);
                }
              } catch (error) {
                console.error(
                  "AUTH CALLBACK: Error handling GitHub connection:",
                  error
                );
                return NextResponse.redirect(
                  `${requestUrl.origin}/error?message=${encodeURIComponent(
                    "An error occurred while connecting GitHub"
                  )}`
                );
              }
            }
            // For direct GitHub login or new users
            else {
              try {
                // Create or update the profile
                const { error: profileError } = await supabase
                  .from("profiles")
                  .upsert({
                    id: data.session.user.id,
                    email: data.session.user.email,
                    full_name: githubUser.name || githubUser.login,
                    avatar_url: githubUser.avatar_url,
                    auth_provider: "github",
                    github_connected: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (profileError) {
                  console.error(
                    "AUTH CALLBACK: Error creating profile:",
                    profileError
                  );
                  return NextResponse.redirect(
                    `${requestUrl.origin}/error?message=${encodeURIComponent(
                      "Failed to create user profile"
                    )}`
                  );
                }

                // Create GitHub identity
                const { error: identityError } = await supabase
                  .from("github_identities")
                  .upsert(
                    {
                      user_id: data.session.user.id,
                      ...githubIdentityData,
                    },
                    {
                      onConflict: "user_id",
                      ignoreDuplicates: false,
                    }
                  );

                if (identityError) {
                  console.error(
                    "AUTH CALLBACK: Error creating/updating GitHub identity:",
                    identityError
                  );
                  return NextResponse.redirect(
                    `${requestUrl.origin}/error?message=${encodeURIComponent(
                      "Failed to create GitHub identity"
                    )}`
                  );
                }
              } catch (error) {
                console.error(
                  "AUTH CALLBACK: Error creating user profile:",
                  error
                );
                return NextResponse.redirect(
                  `${requestUrl.origin}/error?message=${encodeURIComponent(
                    "An error occurred while creating your profile"
                  )}`
                );
              }
            }
          } else {
            console.error(
              "AUTH CALLBACK: Error fetching GitHub user data:",
              await response.text()
            );
            return NextResponse.redirect(
              `${requestUrl.origin}/error?message=${encodeURIComponent(
                "Failed to fetch GitHub user data"
              )}`
            );
          }
        } catch (error) {
          console.error(
            "AUTH CALLBACK: Error processing GitHub user data:",
            error
          );
          return NextResponse.redirect(
            `${requestUrl.origin}/error?message=${encodeURIComponent(
              "An error occurred while processing GitHub data"
            )}`
          );
        }
      } else if (data.session?.user) {
        // Handle email login
        try {
          // Create or update the profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.session.user.id,
              email: data.session.user.email,
              full_name: data.session.user.user_metadata?.full_name,
              avatar_url: data.session.user.user_metadata?.avatar_url,
              auth_provider: "email",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error(
              "AUTH CALLBACK: Error creating/updating profile:",
              profileError
            );
            return NextResponse.redirect(
              `${requestUrl.origin}/error?message=${encodeURIComponent(
                "Failed to create user profile"
              )}`
            );
          }
        } catch (error) {
          console.error("AUTH CALLBACK: Error creating user profile:", error);
          return NextResponse.redirect(
            `${requestUrl.origin}/error?message=${encodeURIComponent(
              "An error occurred while creating your profile"
            )}`
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
          `${requestUrl.origin}/sign-in?error=session_lost`
        );
      }
    }

    console.log("AUTH CALLBACK: Redirecting to:", processedRedirectTo);
    return NextResponse.redirect(
      new URL(processedRedirectTo, requestUrl.origin)
    );
  } catch (error) {
    console.error("AUTH CALLBACK: Unexpected error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/error?message=${encodeURIComponent(
        "An unexpected error occurred"
      )}`
    );
  }
}

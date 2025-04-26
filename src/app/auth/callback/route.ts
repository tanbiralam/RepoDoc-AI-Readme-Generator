import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to") || "/dashboard";
  const isConnection = requestUrl.searchParams.get("connect") === "github";
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
    error,
    errorCode,
    errorDescription,
  });

  // If we already have an error from Supabase, redirect with that error
  if (error) {
    console.error("AUTH CALLBACK: Supabase error in callback:", {
      error,
      errorCode,
      errorDescription,
    });
    return NextResponse.redirect(
      new URL(
        `/auth?error=${error}&description=${encodeURIComponent(
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

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(
          "AUTH CALLBACK: Error exchanging code for session:",
          error
        );
        return NextResponse.redirect(
          new URL(
            `/auth?error=exchange_failed&description=${encodeURIComponent(
              error.message
            )}`,
            requestUrl.origin
          )
        );
      }

      console.log("AUTH CALLBACK: Successfully exchanged code for session", {
        userId: data?.session?.user?.id,
        hasSession: !!data?.session,
      });

      // If this is a GitHub connection for an existing user (not a login)
      if (isConnection && data?.session?.user) {
        try {
          // Update the user's profile to set github_connected = true
          const userId = data.session.user.id;
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              github_connected: true,
              auth_provider:
                data.session.user.app_metadata?.provider || "github",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (updateError) {
            console.error(
              "AUTH CALLBACK: Error updating profile after GitHub connection:",
              updateError
            );
          } else {
            console.log(
              "AUTH CALLBACK: Successfully updated user profile with GitHub connection"
            );
          }
        } catch (profileError) {
          console.error(
            "AUTH CALLBACK: Exception updating profile:",
            profileError
          );
        }
      }

      // Always redirect to the dashboard after successful authentication
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    } else {
      console.error("AUTH CALLBACK: No code found in callback URL");
      return NextResponse.redirect(
        new URL("/auth?error=no_code", requestUrl.origin)
      );
    }
  } catch (error) {
    console.error("AUTH CALLBACK: Exception in auth callback:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(
      new URL(
        `/auth?error=unexpected&description=${encodeURIComponent(
          errorMessage
        )}`,
        requestUrl.origin
      )
    );
  }
}

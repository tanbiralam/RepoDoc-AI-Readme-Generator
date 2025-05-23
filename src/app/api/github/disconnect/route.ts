import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get current session to check provider
    const { data: sessionData } = await supabase.auth.getSession();
    const isGitHubProvider =
      sessionData?.session?.user?.app_metadata?.provider === "github";

    // If user is signed in with GitHub, we need to handle this differently
    if (isGitHubProvider) {
      return NextResponse.json(
        {
          error:
            "Cannot disconnect GitHub while signed in with GitHub. Please sign in with email first.",
        },
        { status: 400 }
      );
    }

    // Update the profile to remove GitHub connection
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        github_connected: false,
        github_username: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Delete the GitHub identity
    const { error: identityError } = await supabase
      .from("github_identities")
      .delete()
      .eq("user_id", userId);

    if (identityError) {
      console.error("Error deleting GitHub identity:", identityError);
      return NextResponse.json(
        { error: "Failed to delete GitHub identity" },
        { status: 500 }
      );
    }

    // Clear GitHub token and related data from user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        github_token: null,
        github_connected: false,
        github_username: null,
        github_id: null,
        github_email: null,
      },
    });

    if (metadataError) {
      console.error("Error updating user metadata:", metadataError);
      return NextResponse.json(
        { error: "Failed to update user metadata" },
        { status: 500 }
      );
    }

    // Revoke the GitHub OAuth token if we have it
    const { data: githubIdentity } = await supabase
      .from("github_identities")
      .select("access_token")
      .eq("user_id", userId)
      .single();

    if (githubIdentity?.access_token) {
      try {
        await fetch("https://api.github.com/applications/{client_id}/token", {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Bearer ${githubIdentity.access_token}`,
          },
        });
      } catch (error) {
        console.error("Error revoking GitHub token:", error);
        // Don't fail the whole operation if token revocation fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

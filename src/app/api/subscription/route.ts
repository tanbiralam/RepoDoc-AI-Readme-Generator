import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const userId = requestUrl.searchParams.get("userId");

    // Verify the userId matches the authenticated user
    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription information from the profiles table
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch subscription information" },
        { status: 500 }
      );
    }

    // Default to free plan if no profile found (should not happen due to automatic profile creation)
    const planId = profile?.subscription_tier || "free";

    return NextResponse.json({ planId });
  } catch (error) {
    console.error("Error getting subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to get subscription plan" },
      { status: 500 }
    );
  }
}

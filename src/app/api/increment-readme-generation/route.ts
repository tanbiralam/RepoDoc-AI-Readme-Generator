import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    // Verify the userId matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current count
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("readme_generations_count")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    const currentCount = profile?.readme_generations_count || 0;

    // Update the count
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ readme_generations_count: currentCount + 1 })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating count:", updateError);
      return NextResponse.json(
        { error: "Failed to update generation count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: currentCount + 1 });
  } catch (error) {
    console.error("Error incrementing readme generation count:", error);
    return NextResponse.json(
      { error: "Failed to increment readme generation count" },
      { status: 500 }
    );
  }
}

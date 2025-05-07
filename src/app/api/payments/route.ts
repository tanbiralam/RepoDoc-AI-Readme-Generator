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

    // Get userId from the query string
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // Validate userId (ensure it matches the authenticated user or user has admin rights)
    if (userId !== session.user.id) {
      // Check if user has admin access (implement your admin check logic here)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized access to user data" },
          { status: 403 }
        );
      }
    }

    // Fetch payment history from database
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payment history:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error in payments API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

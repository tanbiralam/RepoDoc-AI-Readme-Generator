import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Use await with cookies() to fix the warning
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => Promise.resolve(cookieStore),
    });

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

    // Validate userId exists and is a valid UUID
    if (
      !userId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Validate userId (ensure it matches the authenticated user or user has admin rights)
    if (userId !== session.user.id) {
      // Check if user has admin access
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return NextResponse.json(
          { error: "Error verifying permissions" },
          { status: 500 }
        );
      }

      if (!profile || profile.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized access to user data" },
          { status: 403 }
        );
      }
    }

    // Fetch payment history from database with pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(
      parseInt(url.searchParams.get("pageSize") || "10"),
      50
    ); // Limit max page size
    const startIndex = (page - 1) * pageSize;

    // Fix the SQL error by not using count with * selection
    const {
      data: payments,
      error,
      count,
    } = await supabase
      .from("payments")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(startIndex, startIndex + pageSize - 1);

    if (error) {
      console.error("Error fetching payment history:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment history" },
        { status: 500 }
      );
    }

    // Return paginated results with metadata
    return NextResponse.json({
      payments,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error("Error in payments API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Use await with cookies() to fix the warning
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body with error handling
    let userId: string;
    try {
      const body = await request.json();
      userId = body.userId;

      // Validate userId exists
      if (!userId) {
        return NextResponse.json(
          { error: "Missing required field: userId" },
          { status: 400 }
        );
      }

      // Validate userId format (UUID)
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          userId
        )
      ) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Verify the userId matches the authenticated user
    if (userId !== session.user.id) {
      console.warn(
        `User ${session.user.id} attempted to increment count for ${userId}`
      );
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    // Get current count with transaction safety
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("readme_generations_count, subscription_tier")
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
    const subscriptionTier = profile?.subscription_tier || "FREE";

    // Check if user has reached their limit based on subscription tier
    // This is a secondary check in addition to the client-side check
    const tierLimits = {
      FREE: 3,
      PRO: Infinity,
    };

    const limit =
      tierLimits[subscriptionTier as keyof typeof tierLimits] ||
      tierLimits.FREE;

    if (currentCount >= limit && subscriptionTier === "FREE") {
      return NextResponse.json(
        {
          error: "Generation limit reached",
          limit,
          count: currentCount,
          tier: subscriptionTier,
        },
        { status: 403 }
      );
    }

    // Update the count with retry logic for concurrency issues
    let retries = 3;
    let updateSuccess = false;
    let newCount = currentCount + 1;

    while (retries > 0 && !updateSuccess) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ readme_generations_count: newCount })
        .eq("id", userId)
        .eq("readme_generations_count", currentCount); // Optimistic concurrency control

      if (!updateError) {
        updateSuccess = true;
      } else {
        console.warn(
          `Retry needed for count update (${retries} left):`,
          updateError
        );
        retries--;

        // If we failed due to concurrency, get the latest count
        if (retries > 0) {
          const { data: refreshedProfile } = await supabase
            .from("profiles")
            .select("readme_generations_count")
            .eq("id", userId)
            .single();

          if (refreshedProfile) {
            newCount = (refreshedProfile.readme_generations_count || 0) + 1;
          }
        }
      }
    }

    if (!updateSuccess) {
      console.error("Failed to update count after multiple retries");
      return NextResponse.json(
        { error: "Failed to update generation count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: newCount,
      limit,
      tier: subscriptionTier,
    });
  } catch (error) {
    console.error("Error incrementing readme generation count:", error);
    return NextResponse.json(
      { error: "Failed to increment readme generation count" },
      { status: 500 }
    );
  }
}

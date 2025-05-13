import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Rate limit configuration by subscription tier and endpoint
export const RATE_LIMITS = {
  // AI generation endpoints
  AI_GENERATION: {
    FREE: { limit: 5, windowInSeconds: 3600 }, // 5 requests per hour for free tier
    PRO: { limit: 50, windowInSeconds: 3600 }, // 50 requests per hour for pro tier
  },
  // General API endpoints
  API: {
    DEFAULT: { limit: 100, windowInSeconds: 60 }, // 100 requests per minute
  },
};

export type RateLimitType = "AI_GENERATION" | "API";

/**
 * Rate limiting middleware for API routes using Supabase for persistent storage
 * @param request The incoming request
 * @param type The type of rate limit to apply
 * @returns NextResponse or null if the request should proceed
 */
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = "API"
): Promise<NextResponse | null> {
  try {
    // Get client IP address from headers
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Try to get user ID from session for authenticated requests
    // Create Supabase client with the pattern used in other routes
    const supabase = createRouteHandlerClient({ cookies });

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get subscription tier for the user
    let tier = "FREE";
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single();

      tier = profile?.subscription_tier?.toUpperCase() || "FREE";
    }

    // Create a unique key for the rate limit
    // Use user ID if available, otherwise use IP address
    const key = `${type}:${userId || ip}`;

    // Get rate limit configuration based on type and tier
    const config =
      type === "AI_GENERATION"
        ? RATE_LIMITS.AI_GENERATION[
            tier as keyof typeof RATE_LIMITS.AI_GENERATION
          ] || RATE_LIMITS.AI_GENERATION.FREE
        : RATE_LIMITS.API.DEFAULT;

    const now = Date.now();
    const resetTimeDate = new Date(now + config.windowInSeconds * 1000);

    // Try to get existing rate limit record from database
    const { data: rateLimitRecord, error: fetchError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .single();

    // Handle fetch error - reject the request to be safe
    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Rate limiting fetch error:", fetchError);
      return createRateLimitErrorResponse(
        "Rate limiting error",
        config.limit,
        config.windowInSeconds,
        resetTimeDate,
        0
      );
    }

    // If no record exists or reset time has passed, create/reset the record
    if (
      !rateLimitRecord ||
      new Date(rateLimitRecord.reset_time) < new Date(now)
    ) {
      // Create new rate limit record or reset existing one
      const { error: upsertError } = await supabase.from("rate_limits").upsert(
        {
          key,
          count: 1, // Start with count of 1 for this request
          reset_time: resetTimeDate.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      // Handle upsert error - reject the request to be safe
      if (upsertError) {
        console.error("Rate limiting upsert error:", upsertError);
        return createRateLimitErrorResponse(
          "Rate limiting error",
          config.limit,
          config.windowInSeconds,
          resetTimeDate,
          0
        );
      }

      // First request within window, allow it to proceed
      return null;
    }

    // Record exists and is still within time window
    // Increment the count with optimistic concurrency control
    const currentCount = rateLimitRecord.count;
    const newCount = currentCount + 1;

    // Check if rate limit would be exceeded
    if (currentCount >= config.limit) {
      // Rate limit already exceeded
      return createRateLimitErrorResponse(
        "Rate limit exceeded",
        config.limit,
        config.windowInSeconds,
        new Date(rateLimitRecord.reset_time),
        0
      );
    }

    // Update the count
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({
        count: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq("key", key)
      .eq("count", currentCount); // Optimistic concurrency control

    // Handle update error - this could be a concurrency issue
    if (updateError) {
      console.error("Rate limiting update error:", updateError);

      // Try to get the latest count to make a better decision
      const { data: refreshedRecord, error: refreshError } = await supabase
        .from("rate_limits")
        .select("*")
        .eq("key", key)
        .single();

      if (refreshError || !refreshedRecord) {
        // If we can't get the latest record, reject to be safe
        return createRateLimitErrorResponse(
          "Rate limiting error",
          config.limit,
          config.windowInSeconds,
          resetTimeDate,
          0
        );
      }

      // Check if the refreshed count exceeds the limit
      if (refreshedRecord.count >= config.limit) {
        return createRateLimitErrorResponse(
          "Rate limit exceeded",
          config.limit,
          config.windowInSeconds,
          new Date(refreshedRecord.reset_time),
          0
        );
      }

      // Even with the concurrency issue, we're still under the limit
      // Try one more update with the refreshed count
      const { error: retryError } = await supabase
        .from("rate_limits")
        .update({
          count: refreshedRecord.count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key);

      if (retryError) {
        // If retry fails, reject to be safe
        console.error("Rate limiting retry error:", retryError);
        return createRateLimitErrorResponse(
          "Rate limiting error",
          config.limit,
          config.windowInSeconds,
          resetTimeDate,
          0
        );
      }
    }

    // Calculate remaining requests
    const remaining = Math.max(0, config.limit - newCount);

    // If we've just hit the limit exactly, return rate limit response
    if (remaining === 0) {
      return createRateLimitErrorResponse(
        "Rate limit exceeded",
        config.limit,
        config.windowInSeconds,
        new Date(rateLimitRecord.reset_time),
        remaining
      );
    }

    // Request is allowed to proceed
    return null;
  } catch (error) {
    console.error("Rate limiting critical error:", error);
    // For security, reject the request in case of unexpected errors
    return NextResponse.json(
      {
        error: "Rate limiting system error",
        message: "Unable to process request due to rate limiting system error",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to create a rate limit error response
 */
function createRateLimitErrorResponse(
  errorMessage: string,
  limit: number,
  windowInSeconds: number,
  resetTime: Date,
  remaining: number
): NextResponse {
  const now = Date.now();
  const resetTimeSeconds = Math.ceil(resetTime.getTime() / 1000);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((resetTime.getTime() - now) / 1000)
  );

  return NextResponse.json(
    {
      error: errorMessage,
      limit,
      windowInSeconds,
      resetTime: resetTime.toISOString(),
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTimeSeconds.toString(),
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}

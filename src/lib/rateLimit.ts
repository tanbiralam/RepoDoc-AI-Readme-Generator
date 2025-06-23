import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Rate limit configuration by subscription tier and endpoint
export const RATE_LIMITS = {
  // AI generation endpoints
  AI_GENERATION: {
    FREE: { limit: 2, windowInSeconds: 3600 }, // 5 requests per hour for free tier
    PRO: { limit: 50, windowInSeconds: 3600 }, // 50 requests per hour for pro tier
  },
  // General API endpoints
  API: {
    DEFAULT: { limit: 100, windowInSeconds: 60 }, // 100 requests per minute
  },
};

// TEMPORARY: Global limit of 3 generations total per IP
const GLOBAL_GENERATION_LIMIT = 20;

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

    // Create Supabase admin client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // TEMPORARY: Check total generations for this IP if this is an AI generation request
    if (type === "AI_GENERATION") {
      const { data: totalGens, error: totalGensError } = await supabase
        .from("total_readme_generations")
        .select("total_count")
        .eq("ip_address", ip)
        .single();

      if (totalGensError && totalGensError.code !== "PGRST116") {
        console.error("Error checking total generations:", totalGensError);
        return createRateLimitErrorResponse(
          "Rate limiting error",
          GLOBAL_GENERATION_LIMIT,
          0,
          new Date(),
          0
        );
      }

      const totalCount = totalGens?.total_count || 0;

      // If already at or over limit, reject
      if (totalCount >= GLOBAL_GENERATION_LIMIT) {
        return createRateLimitErrorResponse(
          "Global generation limit reached",
          GLOBAL_GENERATION_LIMIT,
          0,
          new Date(),
          0
        );
      }

      // If this is a new IP, create the record
      if (!totalGens) {
        const { error: insertError } = await supabase
          .from("total_readme_generations")
          .insert([
            {
              ip_address: ip,
              total_count: 1,
            },
          ]);

        if (insertError) {
          console.error(
            "Error creating total generations record:",
            insertError
          );
          return createRateLimitErrorResponse(
            "Rate limiting error",
            GLOBAL_GENERATION_LIMIT,
            0,
            new Date(),
            0
          );
        }

        // First generation allowed
        return null;
      }

      // Increment the count
      const { error: updateError } = await supabase
        .from("total_readme_generations")
        .update({
          total_count: totalCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("ip_address", ip);

      if (updateError) {
        console.error("Error updating total generations:", updateError);
        return createRateLimitErrorResponse(
          "Rate limiting error",
          GLOBAL_GENERATION_LIMIT,
          0,
          new Date(),
          0
        );
      }

      return null;
    }

    // For non-AI requests, get the session using cookies
    const cookieStore = await cookies();
    const supabaseAuthToken = cookieStore.get("sb-access-token")?.value;

    // Get the session
    let userId = null;
    if (supabaseAuthToken) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(supabaseAuthToken);
      if (!authError && user) {
        userId = user.id;
      }
    }

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
      type === ("AI_GENERATION" as RateLimitType)
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

      // First request in new window is allowed
      return null;
    }

    // Check if limit has been exceeded
    if (rateLimitRecord.count >= config.limit) {
      return createRateLimitErrorResponse(
        "Rate limit exceeded",
        config.limit,
        config.windowInSeconds,
        new Date(rateLimitRecord.reset_time),
        0
      );
    }

    // Increment the count
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({
        count: rateLimitRecord.count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("key", key);

    if (updateError) {
      console.error("Rate limiting update error:", updateError);
      return createRateLimitErrorResponse(
        "Rate limiting error",
        config.limit,
        config.windowInSeconds,
        resetTimeDate,
        0
      );
    }

    // Request is allowed
    return null;
  } catch (error) {
    console.error("Rate limiting error:", error);
    return createRateLimitErrorResponse(
      "Rate limiting error",
      0,
      0,
      new Date(),
      0
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

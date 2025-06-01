import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware to handle authentication sessions and security headers
 */
export async function middleware(req: NextRequest) {
  // Create the response
  const res = NextResponse.next();

  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components when using auth
  await supabase.auth.getSession();

  // Add security headers to all responses

  // For development, we'll disable CSP to avoid issues
  // In production, you would want to enable a proper CSP

  // Comment out the CSP for now to fix authentication issues

  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://js.stripe.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://api.anthropic.com https://api.stripe.com http://localhost:* ws://localhost:*; frame-src https://js.stripe.com; font-src 'self' data:;"
  );

  // Prevent clickjacking attacks
  res.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");

  // Enable strict XSS protection
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent information leakage
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enable HSTS (HTTP Strict Transport Security)
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Prevent browser features that might be security risks
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return res;
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes that need different headers, and _next
    // For development, we'll be more selective to avoid issues with Next.js hot reloading
    "/((?!_next|api|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware to handle authentication sessions and security headers
 */
export async function middleware(req: NextRequest) {
  // Create the response with CORS headers for auth endpoints
  const res = NextResponse.next();

  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired - required for Server Components when using auth
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error("Middleware session refresh error:", error);
    }

    // Add security headers to all responses
    // Content Security Policy
    res.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' https://js.stripe.com 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://api.anthropic.com https://api.stripe.com http://localhost:* ws://localhost:*",
        "frame-src https://js.stripe.com",
        "font-src 'self' data:",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
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

    // For auth callback endpoints, ensure proper handling
    if (req.nextUrl.pathname.startsWith("/auth/callback")) {
      const searchParams = req.nextUrl.searchParams;
      const code = searchParams.get("code");

      // Validate the presence of required parameters
      if (!code) {
        return NextResponse.redirect(
          new URL("/error?message=Invalid+auth+callback", req.url)
        );
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // Return the response even if there's an error to avoid breaking the application
    return res;
  }
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * But include:
     * - /auth/* (auth endpoints)
     * - /api/* (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/auth/:path*",
  ],
};

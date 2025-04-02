import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Middleware to handle authentication sessions
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired - required for Server Components when using auth
  await supabase.auth.getSession();
  
  return res;
}

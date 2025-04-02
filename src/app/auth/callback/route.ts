import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Log all parameters for debugging
  console.log('Auth callback params:', { 
    code: !!code, 
    redirectTo,
    error,
    errorCode,
    errorDescription 
  });

  // If we already have an error from Supabase, redirect with that error
  if (error) {
    console.error('Supabase error in callback:', { error, errorCode, errorDescription });
    return NextResponse.redirect(new URL(`/?error=${error}&description=${encodeURIComponent(errorDescription || '')}`, request.url));
  }

  try {
    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL(`/?error=auth_callback_failed&description=${encodeURIComponent(error.message)}`, request.url));
      }

      console.log('Successfully exchanged code for session, redirecting to:', redirectTo);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } else {
      console.error('No code found in callback URL');
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }
  } catch (error) {
    console.error('Exception in auth callback:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/?error=unexpected&description=${encodeURIComponent(errorMessage)}`, request.url));
  }
}

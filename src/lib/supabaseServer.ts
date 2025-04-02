import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CookieOptions } from '@supabase/auth-helpers-shared';

/**
 * Create a Supabase client for server components
 */
export const createServerSupabaseClient = () => {
  return createServerComponentClient({
    cookies,
  });
};

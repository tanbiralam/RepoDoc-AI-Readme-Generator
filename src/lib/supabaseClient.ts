"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Initialize Supabase client with proper setup for Next.js App Router
const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Add improved debug logging for auth state
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log("[Supabase Auth Debug]", {
//     event,
//     hasSession: !!session,
//     provider: session?.user?.app_metadata?.provider,
//     userId: session?.user?.id,
//     providerToken: session?.provider_token ? "exists" : "missing",
//   });
// });

export default supabase;

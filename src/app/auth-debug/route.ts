import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Log all session data for debugging
  const { data: sessionData } = await supabase.auth.getSession();

  // Get profile data
  let profileData = null;
  let error = null;
  if (sessionData.session?.user) {
    const userId = sessionData.session.user.id;
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    profileData = data;
    error = profileError;
  }

  // Debug data to return
  const debugData = {
    url: request.url,
    session: {
      userId: sessionData.session?.user?.id,
      provider: sessionData.session?.user?.app_metadata?.provider,
      hasSession: !!sessionData.session,
      providerToken: sessionData.session?.provider_token ? "exists" : "missing",
      userMetadata: sessionData.session?.user?.user_metadata || {},
      appMetadata: sessionData.session?.user?.app_metadata || {},
    },
    profile: profileData,
    profileError: error,
    cookieNames: cookieStore.getAll().map((c) => c.name),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debugData);
}

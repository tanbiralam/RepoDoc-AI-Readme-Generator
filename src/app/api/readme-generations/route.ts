import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const requestUrl = new URL(request.url);
    const userId = requestUrl.searchParams.get('userId');
    
    // Verify the userId matches the authenticated user
    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get current count
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('readme_generations_count')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
    
    const generationsUsed = profile?.readme_generations_count || 0;
    
    return NextResponse.json({ generationsUsed });
  } catch (error) {
    console.error('Error getting readme generation count:', error);
    return NextResponse.json(
      { error: 'Failed to get readme generation count' },
      { status: 500 }
    );
  }
}

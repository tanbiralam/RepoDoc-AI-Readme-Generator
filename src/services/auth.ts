import supabase from '@/lib/supabaseClient';
import { User } from '@/types';

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create a user profile in the profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          subscription_tier: 'free',
          readme_generations_count: 0,
        }]);

      if (profileError) throw profileError;
    }

    return { user: data.user as User, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error: error as Error };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user as User, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error: error as Error };
  }
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async (scopes: string[] = []): Promise<{ error: Error | null }> => {
  // Create a persistent log in localStorage to track the full OAuth flow
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: 'GitHub OAuth Initiated',
    scopes
  };
  
  // Store logs in localStorage so they persist through redirects
  const existingLogs = JSON.parse(localStorage.getItem('authLogs') || '[]');
  existingLogs.push(logEntry);
  localStorage.setItem('authLogs', JSON.stringify(existingLogs));
  
  console.log('signInWithGitHub called with scopes:', scopes);
  try {
    // IMPORTANT: Use EXACTLY the string that's registered in GitHub OAuth app
    // No trailing slashes, no custom parameters
    const exactRedirectUrl = 'http://localhost:3000/auth/callback';
    console.log('Using EXACT registered redirect URL:', exactRedirectUrl);
    
    // Log this step
    const stepLog = {
      timestamp: new Date().toISOString(),
      event: 'Preparing OAuth Request',
      redirectUrl: exactRedirectUrl
    };
    const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    logs.push(stepLog);
    localStorage.setItem('authLogs', JSON.stringify(logs));
    
    // Call the Supabase signInWithOAuth method with minimal options
    // This ensures we're not sending any unexpected parameters
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: exactRedirectUrl,
        // Only use the repo scope to keep it simple
        scopes: 'repo',
      },
    });

    // Log the result
    const resultLog = {
      timestamp: new Date().toISOString(),
      event: 'Supabase OAuth Response',
      error: error ? error.message : null,
      hasUrl: !!data?.url
    };
    const updatedLogs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    updatedLogs.push(resultLog);
    localStorage.setItem('authLogs', JSON.stringify(updatedLogs));
    
    console.log('GitHub OAuth result:', { error: error || 'No error', url: data?.url });
    if (error) throw error;

    // Show the exact URL being redirected to
    if (data?.url) {
      // Store the URL in localStorage for debugging
      localStorage.setItem('lastAuthUrl', data.url);
      
      console.log('IMPORTANT - GitHub redirect URL:', data.url);
      // Redirect to GitHub's authorization URL
      window.location.href = data.url;
      return { error: null };
    } else {
      throw new Error('No redirect URL provided by Supabase');
    }
  } catch (error) {
    // Log the error
    const errorLog = {
      timestamp: new Date().toISOString(),
      event: 'OAuth Error',
      error: error instanceof Error ? error.message : String(error)
    };
    const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('authLogs', JSON.stringify(logs));
    
    console.error('Error signing in with GitHub:', error);
    return { error: error as Error };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { error: error as Error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  console.log('signOut called');
  try {
    const { error } = await supabase.auth.signOut();
    console.log('Sign out result:', { error: error || 'No error' });
    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error as Error };
  }
};

/**
 * Get the current authenticated user
 * Will return null for user when no session exists, without an error
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  console.log('getCurrentUser called');
  try {
    // First check if we have a session
    console.log('Checking for session...');
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session check result:', { hasSession: !!sessionData.session });
    
    // If no session, return null without an error
    if (!sessionData.session) {
      console.log('No session found, returning null user');
      return { user: null, error: null };
    }
    
    // If we have a session, get the user
    console.log('Session found, getting user data...');
    const { data, error } = await supabase.auth.getUser();
    console.log('getUser result:', { user: !!data.user, error: error || 'No error' });
    if (error) throw error;

    // Get additional user profile data from the profiles table
    if (data.user) {
      console.log('User found, fetching profile data...');
      try {
        // Fix the profile query to use the correct syntax
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log('Error fetching profile:', profileError);
          
          // If profile doesn't exist, try to create it
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile...');
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  subscription_tier: 'free',
                  readme_generations_count: 0
                })
                .select('*')
                .single();

              if (insertError) {
                console.error('Error creating profile, details:', insertError);
                // Return just the user data if we can't create a profile
                // Don't throw here, we still want to return the user
                return { user: data.user as User, error: null };
              }

              console.log('Profile created successfully:', newProfile);
              return { 
                user: { 
                  ...data.user,
                  ...newProfile
                } as User, 
                error: null 
              };
            } catch (createError) {
              console.error('Exception during profile creation:', createError);
              // Don't throw, return user but with a note
              return { user: data.user as User, error: null };
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            // Return just the user data if we can't fetch a profile
            return { user: data.user as User, error: null };
          }
        }

        console.log('Profile data found:', !!profileData);
        return { 
          user: { 
            ...data.user,
            ...profileData,
          } as User, 
          error: null 
        };
      } catch (profileError) {
        console.log('Error handling profile data:', profileError);
        // If profile doesn't exist yet but user is authenticated, return just the user data
        return { user: data.user as User, error: null };
      }
    }

    console.log('No user data found despite session existing');
    return { user: null, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error: error as Error };
  }
};

/**
 * Request GitHub access with specific scopes
 * Used when a user needs to access private repositories or perform write operations
 */
export const requestGitHubAdditionalAccess = async (scopes: string[]): Promise<{ error: Error | null }> => {
  return signInWithGitHub(scopes);
};

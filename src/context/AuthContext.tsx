"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getCurrentUser, signOut } from '@/services/auth';
import supabase from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  githubToken: string | null;
  hasPrivateRepoAccess: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  githubToken: null,
  hasPrivateRepoAccess: false,
  error: null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('AuthProvider initialized');
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [hasPrivateRepoAccess, setHasPrivateRepoAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const refreshUser = async () => {
    console.log('refreshUser called');
    try {
      console.log('Getting current user...');
      const { user: currentUser, error: userError } = await getCurrentUser();
      console.log('getCurrentUser result:', { currentUser, userError });
      
      if (userError) {
        console.error('User error detected:', userError);
        throw userError;
      }
      
      console.log('Setting user state:', currentUser);
      setUser(currentUser);

      // Only proceed with GitHub token checks if user is signed in
      if (currentUser) {
        console.log('User is logged in, checking for GitHub token');
        // Check if user has GitHub token and what permissions it has
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Session data:', sessionData);
        const provider = sessionData?.session?.user?.app_metadata?.provider;
        console.log('Auth provider:', provider);
        
        if (provider === 'github') {
          console.log('GitHub provider detected');
          // Extract GitHub token
          const token = sessionData?.session?.provider_token;
          console.log('GitHub token exists:', !!token);
          
          if (token) {
            console.log('Setting GitHub token');
            setGithubToken(token);
            
            // Check if token has private repo access
            try {
              console.log('Checking GitHub token permissions...');
              const response = await fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              console.log('GitHub API response status:', response.status);
              if (response.ok) {
                const userData = await response.json();
                console.log('GitHub user data:', userData);
                const hasPrivateAccess = userData.plan?.private_repos > 0;
                console.log('Has private repo access:', hasPrivateAccess);
                setHasPrivateRepoAccess(hasPrivateAccess);
              }
            } catch (tokenError) {
              console.error('Error checking private repo access:', tokenError);
            }
          }
        }
      } else {
        console.log('No user logged in, resetting GitHub state');
        // Reset state if no user
        setGithubToken(null);
        setHasPrivateRepoAccess(false);
      }
    } catch (refreshError) {
      console.error('Error refreshing user:', refreshError);
      setError(refreshError as Error);
    }
  };

  const logout = async () => {
    console.log('logout called');
    try {
      console.log('Signing out...');
      await signOut();
      console.log('Sign out successful, resetting state');
      setUser(null);
      setGithubToken(null);
      setHasPrivateRepoAccess(false);
      console.log('Redirecting to home page');
      window.location.href = '/';
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
      setError(logoutError as Error);
    }
  };

  useEffect(() => {
    console.log('Initial mount effect running');
    // Set mounted to true once the component mounts
    setMounted(true);
    return () => {
      console.log('Component unmounting');
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    console.log('Auth state effect running, mounted:', mounted);
    if (!mounted) return;

    // Initial user check when component mounts
    console.log('Performing initial user check...');
    refreshUser().finally(() => {
      console.log('Initial user check complete, setting loading to false');
      setLoading(false);
    });

    // Set up listener for auth changes
    console.log('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session: !!session });
      if (session) {
        console.log('Session detected, refreshing user');
        refreshUser();
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setGithubToken(null);
        setHasPrivateRepoAccess(false);
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [mounted]);

  const value = {
    user,
    loading,
    githubToken,
    hasPrivateRepoAccess,
    error,
    logout,
    refreshUser,
  };

  console.log('AuthProvider rendering, user state:', { user: !!user, loading });
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

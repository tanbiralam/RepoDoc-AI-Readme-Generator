// Authentication related types

export type AuthProvider = "email" | "github" | "google";

export interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  github_username?: string;
  subscription_tier: "free" | "pro";
  readme_generations_count: number;
  auth_provider: AuthProvider;
  github_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email?: string; // Email can be undefined in some auth providers
  app_metadata?: {
    provider?: string;
  };
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    email?: string;
  };
}

export interface AuthResponse {
  user: UserProfile | null;
  error: Error | null;
  requiresGithubConnection?: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface GitHubOAuthOptions {
  scopes?: string[];
  redirectTo?: string;
}

export interface GoogleOAuthOptions {
  redirectTo?: string;
}

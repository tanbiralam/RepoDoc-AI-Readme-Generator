// Authentication related types

export type AuthProvider = "email" | "github";

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

export interface GitHubIdentity {
  id: string;
  user_id: string;
  github_id: string;
  github_username: string;
  github_email?: string;
  access_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email?: string; // Email can be undefined in some auth providers
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    email?: string;
    github_id?: string;
    github_username?: string;
  };
  app_metadata: {
    provider?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
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
  fullName?: string;
}

export interface GitHubOAuthOptions {
  scopes?: string[];
  redirectTo?: string;
}

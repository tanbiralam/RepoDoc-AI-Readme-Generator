// User related types
export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  github_username?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  readme_generations_count?: number;
}

// GitHub related types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

// Subscription related types
export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Pro' | 'Enterprise';
  price: number;
  features: string[];
  readme_generations_limit: number;
}

// AI README generation related types
export interface ReadmeGenerationRequest {
  repoName: string;
  repoDescription?: string;
  repoLanguage?: string;
  packageJson?: string;
  mainFiles?: string[];
  currentReadme?: string;
  topics?: string[];
  isPrivate?: boolean;
}

export interface ReadmeGenerationResult {
  content: string;
  sections: ReadmeSection[];
}

export interface ReadmeSection {
  title: string;
  level: number;
  content: string;
}

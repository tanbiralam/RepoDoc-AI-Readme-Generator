// User related types
export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  github_username?: string;
  subscription_tier?: "free" | "pro";
  readme_generations_count?: number;
}

// GitHub related types
export interface GitHubRepo {
  id: number;
  name: string; // Just the repo name, e.g., "InsightIQ"
  full_name: string; // e.g., "tanbiralam/InsightIQ"
  description: string | null;
  language: string | null;
  html_url: string; // Full URL to the repo, e.g., "https://github.com/tanbiralam/InsightIQ"
  topics?: string[];
  private?: boolean;
  owner?: { login?: string }; // Owner information
  stargazers_count?: number; // Optional as not all contexts might have it
  forks_count?: number; // Optional
  updated_at?: string; // Optional
}

// Subscription related types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string | number;
  description?: string;
  features: string[];
  readme_generations_limit: number;
  popular?: boolean;
}

// AI README generation related types
export interface ReadmeGenerationRequest {
  repoName: string; // Just the repo name, e.g., "InsightIQ"
  repoOwner: string; // Owner of the repository, e.g., "tanbiralam"
  repoUrl: string; // Full HTML URL of the repository, e.g., "https://github.com/tanbiralam/InsightIQ"
  repoDescription?: string;
  repoLanguage?: string;
  packageJson?: string;
  currentReadme?: string;
  topics?: string[];
  isPrivate?: boolean;
  demoUrl?: string; // from EnhancedReadmeRequest in promptBuilder
  screenshots?: string[]; // from EnhancedReadmeRequest in promptBuilder
}

export interface ReadmeGenerationResult {
  content: string;
  sections: ReadmeSection[];
}

export interface ReadmeSection {
  title: string;
  content: string;
  level: number;
}

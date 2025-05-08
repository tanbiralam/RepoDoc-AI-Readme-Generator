// Types only in this file (no JSX)
export interface Feature {
  id: number;
  title: string;
  description: string;
  size: "large" | "small";
}

export interface Template {
  id: number;
  name: string;
  description: string;
  tags: string[];
  image: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  iconType: "star" | "zap";
}

// README generation limits for different subscription tiers
export const README_GENERATION_LIMITS = {
  FREE: 3,
  PRO: Infinity,
};

export const features: Feature[] = [
  {
    id: 1,
    title: "AI-Powered Generation",
    description:
      "Advanced AI algorithms analyze your repository to create tailored README content.",
    size: "large",
  },
  {
    id: 2,
    title: "Live Editor",
    description:
      "Edit and preview your README in real-time with our intuitive markdown editor.",
    size: "small",
  },
  {
    id: 3,
    title: "One-Click Commit",
    description: "Push your new README directly to GitHub with a single click.",
    size: "small",
  },
  {
    id: 4,
    title: "Multiple Templates",
    description:
      "Choose from a variety of professional templates to match your project style.",
    size: "small",
  },
  {
    id: 5,
    title: "Smart Analysis",
    description:
      "Our tool automatically detects languages, frameworks, and features in your repository.",
    size: "small",
  },
];

export const templates: Template[] = [
  {
    id: 1,
    name: "Modern Project",
    description:
      "Clean, minimal design with sections for features, installation, and usage.",
    tags: ["Popular", "General"],
    image: "/images/template-modern.png",
  },
  {
    id: 2,
    name: "Developer Portfolio",
    description: "Showcase your skills and projects with an elegant layout.",
    tags: ["Portfolio"],
    image: "/images/template-portfolio.png",
  },
  {
    id: 3,
    name: "API Documentation",
    description:
      "Detailed structure for documenting APIs with endpoints and examples.",
    tags: ["Technical"],
    image: "/images/template-api.png",
  },
  {
    id: 4,
    name: "Open Source",
    description:
      "Perfect for community projects with contribution guidelines and roadmap.",
    tags: ["Collaboration"],
    image: "/images/template-opensource.png",
  },
];

// ==============================
// Subscription Plans
// ==============================
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0",
    description: "Perfect for trying out the service",
    features: [
      `Generate up to ${README_GENERATION_LIMITS.FREE} READMEs`,
      "Basic templates",
      "Export as Markdown file",
    ],
    popular: false,
    iconType: "star",
  },
  {
    id: "pro",
    name: "Pro",
    price: "6.99",
    description: "For regular GitHub users",
    features: [
      "Unlimited README generations",
      "Advanced templates",
      "Export as Markdown file",
      "Commit to GitHub repository",
      "Priority support",
    ],
    popular: true,
    iconType: "zap",
  },
];

// ==============================
// Animation Variants
// ==============================
export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },
};

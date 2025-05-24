import { ReadmeGenerationRequest } from "@/types";

// Enhanced interface to include repository URL
interface EnhancedReadmeRequest extends ReadmeGenerationRequest {
  repoUrl?: string;
  repoOwner?: string;
  demoUrl?: string;
  screenshots?: string[];
}

/**
 * Constructs an optimized prompt for README generation with dynamic URL handling
 */
export const buildReadmeGenerationPrompt = (
  request: EnhancedReadmeRequest
): string => {
  // Extract repository information with proper URL handling
  const repoInfo = [
    `Repository: ${request.repoName}`,
    `Repository URL: ${
      request.repoUrl ||
      `https://github.com/${request.repoOwner || "USERNAME"}/${
        request.repoName
      }`
    }`,
    request.repoDescription && `Description: ${request.repoDescription}`,
    request.repoLanguage && `Primary Language: ${request.repoLanguage}`,
    request.topics?.length && `Topics: ${request.topics.join(", ")}`,
    request.isPrivate !== undefined &&
      `Visibility: ${request.isPrivate ? "Private" : "Public"}`,
    request.demoUrl && `Demo URL: ${request.demoUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Get current API best practices
  const getCurrentAPIPatterns = () => {
    const currentYear = new Date().getFullYear();
    return `
## CURRENT API BEST PRACTICES (${currentYear}):
- OpenAI: Use 'chat.completions.create()' with gpt-3.5-turbo or gpt-4
- Include proper error handling with try-catch blocks
- Show rate limiting and retry logic
- Use environment variable validation
- Include TypeScript types where applicable
`;
  };

  const systemInstructions = `
You are a senior developer creating production-quality documentation. Generate a README.md that follows these EXACT requirements:

## CRITICAL RULES:
- Use ACTUAL repository URL: ${
    request.repoUrl ||
    `https://github.com/${request.repoOwner || "USERNAME"}/${
      request.repoName
    }.git`
  }
- NO placeholder text like "your_repository_url" or "your_api_key"
- Badge URLs must match the actual repository name: ${request.repoName}
- All code examples must use current API versions and best practices
- Include realistic, working examples that developers can copy-paste

## REQUIRED SECTIONS (in order):
1. # ${request.repoName} [with appropriate emoji]
2. Badges (npm, license, build status, etc.)
3. Brief description (2-3 sentences explaining what it actually does)
4. ## ✨ Features (specific, not generic)
5. ## 📋 Prerequisites  
6. ## 🚀 Installation
7. ## 💻 Usage (with multiple examples)
8. ## ⚙️ Configuration
9. ## 🤝 Contributing
10. ## 📄 License

## INSTALLATION SECTION REQUIREMENTS:
- Use exact repository URL provided: ${
    request.repoUrl ||
    `https://github.com/${request.repoOwner || "USERNAME"}/${
      request.repoName
    }.git`
  }
- Show complete .env.example with all required variables
- Include database setup steps if applicable
- Add verification steps to confirm installation worked

## CODE EXAMPLE REQUIREMENTS:
${getCurrentAPIPatterns()}
- Every example must be syntactically correct and runnable
- Include imports/requires at the top
- Show error handling patterns
- Add comments explaining key concepts
- Use TypeScript examples where applicable

## BADGE REQUIREMENTS:
- npm version: Use actual package name from package.json
- License: Extract from package.json or default to MIT
- Build status: Use GitHub Actions format
- Language badges: Match primary language

## FORBIDDEN CONTENT:
- Generic placeholder URLs or tokens
- Outdated API examples
- Vague feature descriptions like "powerful AI integration"
- Instructions that say "configure as needed"
- Broken or incomplete code snippets

## STYLE REQUIREMENTS:
- Use emojis in section headers for visual appeal
- Professional but approachable tone
- Step-by-step numbered instructions
- Code blocks with proper language specification
- Consistent formatting throughout
`;

  // Enhanced package.json analysis
  const packageJsonInstructions = request.packageJson
    ? `
## PACKAGE.JSON ANALYSIS REQUIREMENTS:
Extract and use these details:
- Actual package name for badge URLs
- Scripts section for usage examples  
- Dependencies for prerequisite listing
- Repository URL if not provided separately
- License for badge generation
- Version for npm badge
- Description for project overview

Parse this data and use it throughout the README:
\`\`\`json
${request.packageJson}
\`\`\`
`
    : "";

  // Environment variable template generation
  const envVariableInstructions = `
## ENVIRONMENT VARIABLES:
Create a comprehensive .env.example file showing:
- All required API keys with descriptive comments
- Database connection strings with examples
- Default values where applicable
- Security notes for sensitive variables
- Links to where users can obtain API keys

Format as a proper .env file, not just a list.
`;

  // Existing README enhancement
  const existingReadmeInstructions = request.currentReadme
    ? `
## EXISTING README ENHANCEMENT:
Current README provided. Your task:
- Fix any placeholder content or broken links
- Update outdated API examples to current standards
- Expand thin sections with detailed information
- Preserve any unique project-specific content
- Improve code examples with better error handling
- Add missing sections from the required structure

CURRENT README:
\`\`\`markdown
${request.currentReadme}
\`\`\`
`
    : "";

  // Quality validation checklist
  const validationChecklist = `
## VALIDATION CHECKLIST:
Your README must pass these checks:
✅ All URLs are real and functional (no placeholders)
✅ Code examples run without modification
✅ Environment variables are properly documented
✅ Installation steps are testable
✅ Badge URLs match the actual repository
✅ Features are specific and actionable
✅ At least 3 complete code examples included
✅ Error handling demonstrated
✅ TypeScript types included where relevant
✅ Current API patterns used (not deprecated methods)

## OUTPUT REQUIREMENTS:
- 2000-4000 characters for comprehensive coverage
- Professional formatting with consistent style
- Immediately usable by developers
- No sections marked as "TODO" or "Coming Soon"
- All links must be functional or clearly marked as examples
`;

  // Combine all sections
  return `${repoInfo}

${systemInstructions}

${packageJsonInstructions}

${envVariableInstructions}

${existingReadmeInstructions}

${validationChecklist}

---

Generate the complete README.md content now. Start with "# ${
    request.repoName
  }" and create production-ready documentation that passes all validation checks above.

Remember: Use the actual repository URL ${
    request.repoUrl ||
    `https://github.com/${request.repoOwner || "USERNAME"}/${
      request.repoName
    }.git`
  } in the git clone command.`;
};

// Helper to extract repository details from URL
export const parseRepoUrl = (
  url: string
): { owner: string; name: string } | null => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
  return match ? { owner: match[1], name: match[2] } : null;
};

// Quality scorer for generated READMEs
export const scoreReadmeQuality = (
  readme: string,
  repoUrl?: string
): {
  score: number;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 10;

  // Check for placeholder content
  if (readme.includes("<your_") || readme.includes("your_repository_url")) {
    issues.push("Contains placeholder URLs or tokens");
    score -= 3;
  }

  // Check for proper repository URL
  if (repoUrl && !readme.includes(repoUrl)) {
    issues.push("Repository URL not properly used in git clone command");
    score -= 2;
  }

  // Check for code examples
  const codeBlocks = (readme.match(/```/g) || []).length / 2;
  if (codeBlocks < 3) {
    issues.push("Insufficient code examples (minimum 3 required)");
    score -= 2;
  }

  // Check for outdated API patterns
  if (
    readme.includes("completions.create") &&
    !readme.includes("chat.completions.create")
  ) {
    issues.push("Uses outdated OpenAI API patterns");
    score -= 2;
  }

  // Check length
  if (readme.length < 2000) {
    suggestions.push("README could be more comprehensive");
    score -= 1;
  }

  // Check for badges
  if (!readme.includes("![") && !readme.includes("badge")) {
    suggestions.push(
      "Consider adding relevant badges for professional appearance"
    );
  }

  return { score: Math.max(0, score), issues, suggestions };
};

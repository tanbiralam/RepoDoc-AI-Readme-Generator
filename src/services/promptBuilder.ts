import { ReadmeGenerationRequest } from "@/types";

// Enhanced interface to include repository URL
type EnhancedReadmeRequest = ReadmeGenerationRequest;

/**
 * Constructs an optimized prompt for README generation with improved formatting
 */
export const buildReadmeGenerationPrompt = (
  request: EnhancedReadmeRequest
): string => {
  // Helper functions for cleaner code organization
  const getRepoUrl = () => {
    return (
      request.repoUrl ||
      `https://github.com/${request.repoOwner || "USERNAME"}/${
        request.repoName
      }`
    );
  };

  const getCloneUrl = () => {
    const baseUrl = getRepoUrl();
    return baseUrl.endsWith(".git") ? baseUrl : `${baseUrl}.git`;
  };

  // Build repository information section
  const buildRepoInfo = (): string => {
    const info = [
      `Repository: ${request.repoName}`,
      `Repository URL: ${getRepoUrl()}`,
      request.repoDescription && `Description: ${request.repoDescription}`,
      request.repoLanguage && `Primary Language: ${request.repoLanguage}`,
      request.topics?.length && `Topics: ${request.topics.join(", ")}`,
      request.isPrivate !== undefined &&
        `Visibility: ${request.isPrivate ? "Private" : "Public"}`,
      request.demoUrl && `Demo URL: ${request.demoUrl}`,
    ].filter(Boolean);

    return info.join("\n");
  };

  // Core system instructions with proper formatting
  const getSystemInstructions = (): string => {
    return `You are an expert technical writer creating a README.md. Your goal is to produce a document that is clear, concise, and easy for anyone to understand.

## CRITICAL RULES:
- Use the ACTUAL repository URL: ${getRepoUrl()}
- NO placeholder text like "your_repository_url" or "your_api_key".
- All installation and usage instructions should be simple and clear.

## REQUIRED SECTIONS (in order):
1.  **# \${request.repoName}** [with an appropriate emoji]
2.  **Badges** (if applicable, e.g., license, build status)
3.  **Brief description** (2-3 sentences explaining the project's purpose)
4.  **## ✨ Features** (A high-level list of key features)
5.  **## 🚀 Installation** (Simple, step-by-step instructions)
6.  **## 💻 Usage** (Explain how to use the application, not the code)
7.  **## 🤝 Contributing** (Optional: if you have contribution guidelines)
8.  **## 📄 License**

## FORMATTING REQUIREMENTS:
- Use standard markdown syntax.
- Keep the tone professional but friendly.`;
  };

  // Package.json analysis instructions
  const getPackageJsonInstructions = (): string => {
    if (!request.packageJson) return "";

    return `## PACKAGE.JSON ANALYSIS:
Extract and use these details from the provided package.json:
- Package name for accurate badge URLs
- Scripts section for usage examples  
- Dependencies for prerequisite listing
- Repository URL validation
- License information for badges
- Version for npm badge
- Description for project overview

Package.json content:
${request.packageJson}`;
  };

  // Environment variables section
  const getEnvVariableInstructions = (): string => {
    return `## ENVIRONMENT VARIABLES:
Create a comprehensive .env.example file showing:
- All required API keys with descriptive comments
- Database connection strings with examples
- Default values where applicable
- Security notes for sensitive variables
- Links to obtain API keys

Format as a proper .env file with clear structure.`;
  };

  // Existing README handling
  const getExistingReadmeInstructions = (): string => {
    if (!request.currentReadme) return "";

    return `## EXISTING README ENHANCEMENT:
Current README provided. Enhance it by:
- Replacing all placeholder content with actual values
- Updating outdated API examples to current standards
- Expanding sections with detailed information
- Preserving unique project-specific content
- Improving code examples with proper error handling
- Adding missing required sections

Current README content:
${request.currentReadme}`;
  };

  // Quality validation checklist
  const getValidationChecklist = (): string => {
    return `## VALIDATION CHECKLIST:
Your README must pass these checks:
✅ All URLs are real and functional (no placeholders)
✅ Installation steps are clear and correct.
✅ The description accurately reflects the project.
✅ Proper markdown formatting is used throughout.

## OUTPUT REQUIREMENTS:
- Generate a README that is around 1000-2000 characters.
- It should be professional and immediately usable.
- Focus on clarity and ease of understanding.`;
  };

  // Final generation instruction
  const getFinalInstruction = (): string => {
    return `Generate the complete README.md content now. Start with "# ${
      request.repoName
    }" and create production-ready documentation. The document should end after the "License" section. Do not add any conversational closings or "thank you" notes.

IMPORTANT: In your output, use actual triple backticks (not the word or escaped versions) for all code blocks.

Repository clone URL to use: ${getCloneUrl()}`;
  };

  // Combine all sections with clear separation
  const sections = [
    buildRepoInfo(),
    getSystemInstructions(),
    getPackageJsonInstructions(),
    getEnvVariableInstructions(),
    getExistingReadmeInstructions(),
    getValidationChecklist(),
    "---",
    getFinalInstruction(),
  ].filter((section) => section.trim().length > 0);

  return sections.join("\n\n");
};

// Helper to extract repository details from URL
export const parseRepoUrl = (
  url: string
): { owner: string; name: string } | null => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
  return match ? { owner: match[1], name: match[2] } : null;
};

// Enhanced quality scorer with better validation
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
  const placeholderPatterns = [
    /<your_/,
    /your_repository_url/,
    /YOUR_API_KEY/,
    /\[INSERT_/,
    /TODO:/,
    /PLACEHOLDER/,
  ];

  const hasPlaceholders = placeholderPatterns.some((pattern) =>
    pattern.test(readme)
  );
  if (hasPlaceholders) {
    issues.push("Contains placeholder content that needs replacement");
    score -= 3;
  }

  // Check for proper repository URL usage
  if (repoUrl && !readme.includes(repoUrl)) {
    issues.push("Repository URL not properly integrated");
    score -= 2;
  }

  // Validate code block formatting
  const codeBlockCount = (readme.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    issues.push("Malformed code blocks (unmatched backticks)");
    score -= 2;
  }

  const properCodeBlocks = Math.floor(codeBlockCount / 2);
  if (properCodeBlocks < 3) {
    issues.push("Insufficient code examples (minimum 3 required)");
    score -= 2;
  }

  // Check for modern API patterns
  if (
    readme.includes("completions.create") &&
    !readme.includes("chat.completions.create")
  ) {
    issues.push("Uses outdated OpenAI API patterns");
    score -= 2;
  }

  // Validate required sections
  const requiredSections = [
    /# .+/, // Title
    /## .*Features/,
    /## .*Installation/,
    /## .*Usage/,
    /## .*Contributing/,
  ];

  const missingSections = requiredSections.filter(
    (pattern) => !pattern.test(readme)
  );
  if (missingSections.length > 0) {
    issues.push(
      `Missing required sections: ${missingSections.length} section(s)`
    );
    score -= missingSections.length;
  }

  // Check overall quality indicators
  if (readme.length < 2000) {
    suggestions.push("README could be more comprehensive and detailed");
    score -= 1;
  }

  if (readme.length > 5000) {
    suggestions.push("README might be too lengthy - consider condensing");
  }

  // Check for badges
  if (!readme.includes("![") && !readme.includes("badge")) {
    suggestions.push(
      "Consider adding relevant badges for professional appearance"
    );
  }

  // Check for proper markdown formatting
  const hasProperHeaders = /^#{1,6} /.test(readme);
  if (!hasProperHeaders) {
    issues.push("Improper markdown header formatting");
    score -= 1;
  }

  return {
    score: Math.max(0, Math.min(10, score)),
    issues,
    suggestions,
  };
};

// Additional utility for validating generated README
export const validateReadmeStructure = (
  readme: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for basic structure
  if (!readme.startsWith("#")) {
    errors.push("README should start with a main title (# Title)");
  }

  // Validate code block pairing
  const backtickMatches = readme.match(/```/g);
  if (backtickMatches && backtickMatches.length % 2 !== 0) {
    errors.push("Unmatched code block backticks");
  }

  // Check for empty sections
  const emptyHeaderPattern = /^#{2,6}\s+.+\n\s*\n#{2,6}/gm;
  if (emptyHeaderPattern.test(readme)) {
    warnings.push("Found empty sections between headers");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

# readmeGenerator 🤖

A tool to automatically generate comprehensive README files for your GitHub repositories using AI. It analyzes your codebase, structure, and `package.json` to create informative, well-structured documentation, saving you time and effort.

[![npm version](https://img.shields.io/npm/v/github-readme-generator)](https://www.npmjs.com/package/github-readme-generator)
[![license](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)
![GitHub Actions](https://github.com/tanbiralam/readmeGenerator/workflows/Node.js%20CI/badge.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)

## ✨ Features

*   **AI-Powered README Generation:** Leverages Claude, OpenAI, and Gemini to analyze your repository (code, structure, `package.json`) and generate a well-formatted README.
*   **GitHub Repository Integration:** Directly connects to your GitHub account to fetch repositories for analysis, handling both public and private access with appropriate permissions.
*   **Real-time Markdown Editor:** Provides a live editor to preview and fine-tune the generated README content in Markdown, allowing for precise customization.
*   **Flexible Export Options:** Downloads the generated README as a `.md` file or commits it directly to your GitHub repository.
*   **Secure Authentication:** Uses Supabase Auth for secure sign-in via GitHub, Google, or email/password.

## 📋 Prerequisites

Before you begin, ensure you have the following:

*   Node.js (version 20.0.0 or later): [https://nodejs.org/](https://nodejs.org/)
*   npm or yarn package manager
*   Supabase account and project: [https://supabase.com/](https://supabase.com/)
*   GitHub OAuth App configured with a callback URL pointing to your deployed instance (e.g., `http://localhost:3000/api/auth/callback/github`). Ensure the callback URL matches your development or production environment.
*   API keys for at least one of these LLMs:
    *   Anthropic Claude: [https://www.anthropic.com/](https://www.anthropic.com/)
    *   OpenAI: [https://openai.com/](https://openai.com/)
    *   Google Gemini: [https://ai.google.dev/](https://ai.google.dev/)

## 🚀 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/tanbiralam/readmeGenerator.git
    cd readmeGenerator
2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
3.  **Create a `.env` file:**

    Copy the contents of `.env.example` to a new file named `.env` in the root directory and populate the environment variables:
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL  # Your Supabase project URL (e.g., https://your-project.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY # Your Supabase anon key (public key)
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # Your Supabase service role key (for admin tasks - keep secret!)
    
    # GitHub OAuth Configuration
    GITHUB_ID=YOUR_GITHUB_APP_ID # Your GitHub OAuth App ID
    GITHUB_SECRET=YOUR_GITHUB_APP_SECRET # Your GitHub OAuth App Secret
    
    # AI API Keys (At least one is required)
    CLAUDE_API_KEY=YOUR_CLAUDE_API_KEY # Anthropic Claude API Key (Get it from: https://console.anthropic.com/settings/keys)
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY # OpenAI API Key (Get it from: https://platform.openai.com/api-keys)
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY # Google Gemini API Key (Get it from: https://ai.google.dev/)

    # Base URL (For local development or production)
    NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change for production deployment (e.g., https://yourdomain.com)
    
    # Rate Limiting Configuration (Optional, adjust as needed)
    MAX_REQUESTS_PER_MINUTE=60 # Maximum number of API requests allowed per minute
    **Security Note:** Never commit your `.env` file to version control. Keep your API keys and secrets safe. Use a tool like Doppler to sync secrets to your local environment and production.

4.  **Run database migrations (if applicable):** This project uses Supabase. Ensure your database is set up correctly. You might need to define schemas and enable authentication. Refer to the Supabase documentation for details. Consider using the Supabase CLI for managing migrations: `supabase db push`

5.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
6.  **Access the application:** Open [http://localhost:3000](http://localhost:3000) in your browser.

7.  **Verification:** After installation, sign in with one of the available methods and verify that you can fetch repositories from your GitHub account. Check your Supabase project to ensure users are being authenticated correctly. Examine the logs for any errors during startup or authentication.

## 💻 Usage

1.  **Authenticate:** Sign in using GitHub, Google, or email/password. Ensure your GitHub account has the necessary permissions to access the repositories you want to analyze.

2.  **Select a Repository:** Choose a repository from the list. The application will display both public and private repositories accessible to your account.

3.  **Generate README:** Click the "Generate" button. The AI will analyze your repository and generate a README draft. This might take a few seconds depending on the repository size and the selected AI model.

4.  **Edit and Preview:** Refine the generated content using the live Markdown editor. Preview the changes in real-time to ensure accuracy and clarity.

5.  **Export/Commit:** Download the generated README as a `.md` file or commit it directly to your GitHub repository. The commit functionality requires a properly configured GitHub API token with sufficient permissions.

### Example 1: Generating README Content with OpenAI

```typescript
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateReadme(repoDetails: string): Promise<string | null> {
  try {
    // Call the OpenAI API to generate README content using the chat completions endpoint
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4' for more advanced models
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates README files for GitHub repositories.',
        },
        {
          role: 'user',
          content: `Generate a README for the following repository: ${repoDetails}`,
        },
      ],
      max_tokens: 1024, // Limit the response length
      temperature: 0.7, // Adjust for creativity
    });

    // Return the generated content
    return completion.choices[0].message?.content || null;
  } catch (error: any) {
    // Handle errors, including rate limits and API issues
    console.error('Error generating README:', error);

    // Check for rate limit errors and suggest a retry
    if (error.status === 429) {
      console.warn('Rate limit exceeded. Please try again later.');
      // Implement retry logic with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
      return generateReadme(repoDetails); // Retry the request
    }
    return null;
  }
}

// Example usage (replace with actual repository details)
const repoDescription = "A simple React component library.";
generateReadme(repoDescription)
  .then((readmeContent) => {
    if (readmeContent) {
      console.log('Generated README:', readmeContent);
    } else {
      console.log('Failed to generate README.');
    }
  });
### Example 2: Interacting with the GitHub API

```typescript
import { Octokit } from "@octokit/rest";

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Ensure you have a GitHub token set in your environment
});

async function getRepoDetails(owner: string, repo: string): Promise<any> {
  try {
    // Retrieve repository information
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Retrieve the README content (optional)
    try {
      const readmeResponse = await octokit.rest.repos.getReadme({
        owner,
        repo,
      });

      const readmeData = readmeResponse.data as any;  //added explicit type casting here

      // Process the data (e.g., extract description, languages, etc.)
      console.log("Repository Details:", repoData);
      // You might want to decode the README content from base64
      if (readmeData && readmeData.content) {
          console.log("README Content:", Buffer.from(readmeData.content, 'base64').toString());
      }
      return { repoData, readmeData };
    } catch (readmeError: any) {
      console.warn("README not found:", readmeError.message);
      return { repoData, readmeData: null }; // Handle case where README doesn't exist
    }

  } catch (error: any) {
    console.error("Error fetching repository details:", error);
    // Handle errors like repository not found or insufficient permissions
    throw error; // Re-throw to be handled by the calling function
  }
}


// Example usage
const owner = "octocat"; // Replace with the repository owner
const repo = "Spoon-Knife"; // Replace with the repository name

getRepoDetails(owner, repo)
  .then(details => {
    console.log("Successfully fetched repository details:", details.repoData.description);
  })
  .catch(error => {
    console.error("Failed to fetch repository details:", error);
  });
### Example 3: Calling the Anthropic Claude API

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function generateReadmeWithClaude(repoDescription: string): Promise<string | null> {
  try {
    const response = await anthropic.completions.create({
      model: "claude-3-opus-20240229", // Or another suitable Claude model
      max_tokens_to_sample: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate a comprehensive README file for a GitHub repository with the following description: ${repoDescription}. Include sections for Description, Installation, Usage, Contributing, and License.`,
        },
      ],
    });

    return response.completion || null;
  } catch (error: any) {
    console.error("Error generating README with Claude:", error);

    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", error.status, error.message);
    }
    return null;
  }
}

// Example usage:
const repoDesc = "A Next.js application for generating README files.";
generateReadmeWithClaude(repoDesc)
  .then((readme) => {
    if (readme) {
      console.log("Claude generated README:", readme);
    } else {
      console.log("Failed to generate README with Claude.");
    }
  });
## ⚙️ Configuration

The application's behavior can be customized using environment variables. These variables are loaded from the `.env` file. See the `.env.example` file for a complete list of configurable options.

Key configuration areas:

*   **API Keys:** Specify API keys for the AI models you want to use. At least one API key is required for the AI-powered generation to function.
*   **GitHub Authentication:** Configure the GitHub OAuth App credentials for user authentication and repository access. Ensure the callback URL is correctly set in your GitHub OAuth App configuration.
*   **Supabase:** Set the Supabase project URL and API keys for authentication and data storage. Incorrect Supabase configuration can lead to authentication errors.
*   **Rate Limiting:** Adjust `MAX_REQUESTS_PER_MINUTE` to control the rate at which API requests are made, preventing potential rate limiting errors.

## 🤝 Contributing

We welcome contributions to improve `readmeGenerator`! To contribute:

1.  Fork the repository: [https://github.com/tanbiralam/readmeGenerator](https://github.com/tanbiralam/readmeGenerator)
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes, ensuring they adhere to the project's coding style and include appropriate tests.
4.  Submit a pull request with a clear description of your changes.

**Note:** Direct commits to the `main` branch are not permitted. All changes must be submitted via pull request. Provide detailed information about your changes in the pull request description.

### Contributing with GitHub API Commit Access

To enable direct commits to GitHub repositories:

1.  Create a personal access token (PAT) with the `repo` scope.
2.  Add a `GITHUB_TOKEN` environment variable to your `.env` file.
3.  Use the Octokit library to authenticate and interact with the GitHub API.
4.  Implement error handling to gracefully manage authorization issues. Ensure the PAT has the necessary permissions for the target repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE) file for details.
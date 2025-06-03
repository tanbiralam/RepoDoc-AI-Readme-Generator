# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  


---

readmeGenerator is a powerful AI-driven tool designed to automatically generate professional GitHub README files tailored to your projects. It harnesses advanced AI models including OpenAI GPT-4, Anthropic Claude, and Google Generative AI, combined with GitHub API metadata, to create rich, context-aware documentation with minimal effort.

---

## ✨ Features

- **AI-powered README generation** using OpenAI GPT-4 and GPT-3.5-turbo with context-aware, customizable prompts for precise and high-quality outputs.- **Automated GitHub repository metadata fetching** via Octokit REST API for dynamic project detail inclusion.
- **Interactive React UI** with Radix UI tooltips supporting live editing, previewing, and syntax-highlighted markdown rendering for seamless user experience.
- **Advanced markdown processing** using remark, rehype, and react-syntax-highlighter for beautifully styled and readable README files.
- **Stripe payment integration** to enable premium feature management and usage billing within the app.
- **Secure authentication and state management** powered by Supabase and Next.js, ensuring robust session handling and data persistence.
- **Robust error handling and retry logic** implemented across all API interactions to maximize reliability and fault tolerance.
- **Built on Next.js 15 and TypeScript**, offering a scalable, maintainable, and developer-friendly codebase with excellent performance.

---

## 📋 Prerequisites

Before installing and running readmeGenerator, ensure you have the following:

1. **Node.js v18 or higher** — [Download Node.js](https://nodejs.org/)
2. **npm v9 or higher** (comes bundled with Node.js)
3. **A GitHub account** with a personal access token (PAT) having `repo` scope — [Create PAT](https://github.com/settings/tokens)
4. **OpenAI API key** — [Get your API key](https://platform.openai.com/account/api-keys)
5. **Anthropic API key** — [Sign up at Anthropic](https://www.anthropic.com/)
6. **Google Generative AI API credentials** — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
7. **Stripe API keys** — [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
8. **Supabase project** for authentication and database — [Create project on Supabase](https://supabase.io/)
9. **PostgreSQL database** (managed by Supabase or self-hosted)
10. **Basic understanding of environment variables and `.env` configuration**

---

## 🚀 Installation

Follow these step-by-step instructions to set up readmeGenerator locally:

1. **Clone the repository**

```bash
git clone https://github.com/tanbiralam/readmeGenerator.git
cd readmeGenerator
2. **Install dependencies**

```bash
npm install
3. **Set up environment variables**

```bash
cp .env.example .env
Edit the `.env` file and fill in your API keys and database credentials accordingly.

4. **Database setup**

If using Supabase, create a new project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema will be managed automatically via migrations or you can run:

```bash
npm run db:migrate
*(Adjust commands if you manage migrations differently.)*

5. **Start development server**

```bash
npm run dev
6. **Verify installation**

- Navigate to `http://localhost:3000` in your browser.
- You should see the readmeGenerator UI.
- Test generating a README by providing a GitHub repository or project details.
- Check console logs for errors.

If the application loads and README generation works successfully, your installation is complete.

---

## 💻 Usage

Below are multiple TypeScript examples demonstrating core API interactions with robust error handling and current best practices.

### 1. Generate README using OpenAI GPT-4 chat completion

```typescript
import { config } from "dotenv";
import OpenAI from "openai";

config(); // Load environment variables from .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function generateReadme(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert GitHub README generator." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from OpenAI.");
    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate README via OpenAI.");
  }
}

// Example usage:
(async () => {
  const prompt = "Generate a professional README for a TypeScript GitHub project named readmeGenerator.";
  try {
    const readme = await generateReadme(prompt);
    console.log("Generated README:\n", readme);
  } catch (error) {
    console.error(error);
  }
})();
---

### 2. Fetch GitHub repository details via Octokit REST API

```typescript
import { Octokit } from "@octokit/rest";
import { config } from "dotenv";

config(); // Load environment variables from .env

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface RepoInfo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
}

async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });

    return {
      full_name: data.full_name,
      description: data.description,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count,
      html_url: data.html_url,
    };
  } catch (error) {
    console.error("GitHub API error:", error);
    throw new Error("Failed to fetch repository info from GitHub.");
  }
}

// Example usage:
(async () => {
  try {
    const repoData = await getRepoInfo("tanbiralam", "readmeGenerator");
    console.log(`Repository: ${repoData.full_name}`);
    console.log(`Description: ${repoData.description}`);
    console.log(`Stars: ${repoData.stargazers_count}`);
    console.log(`Forks: ${repoData.forks_count}`);
    console.log(`Open Issues: ${repoData.open_issues_count}`);
    console.log(`URL: ${repoData.html_url}`);
  } catch (error) {
    console.error(error);
  }
})();
---

### 3. Anthropic API call with retry logic using TypeScript

```typescript
import { config } from "dotenv";
import Anthropics from "@anthropic-ai/sdk";

config(); // Load environment variables from .env

const anthropic = new Anthropics({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

async function callAnthropicWithRetry(
  prompt: string,
  retries = 3,
  delayMs = 1000
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.completions.create({
        prompt,
        model: "claude-v1",
        max_tokens_to_sample: 1000,
      });
      if (!response.completion) throw new Error("No completion returned.");
      return response.completion;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error("Anthropic API request failed after maximum retries.");
      }
      // Exponential backoff before retrying
      await new Promise((res) => setTimeout(res, delayMs * attempt));
    }
  }
  throw new Error("Unexpected error in Anthropic retry logic.");
}

// Example usage:
(async () => {
  try {
    const text = await callAnthropicWithRetry("Generate a README introduction paragraph.");
    console.log("Anthropic generated text:\n", text);
  } catch (error) {
    console.error(error);
  }
})();
---

## ⚙️ Configuration

readmeGenerator requires the following environment variables configured in your `.

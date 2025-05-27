# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  
[![Build Status](https://github.com/tanbiralam/readmeGenerator/actions/workflows/ci.yml/badge.svg)](https://github.com/tanbiralam/readmeGenerator/actions)  
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)

---

A powerful and customizable tool to automatically generate professional GitHub README files using AI and advanced integrations. It leverages OpenAI's GPT models alongside multiple AI and API services to create rich, dynamic, and well-structured README content tailored to your project needs.

---

## ✨ Features

- **AI-powered README generation** using OpenAI GPT-3.5-turbo and GPT-4 models with context-aware prompts.
- **Multi-source integration** including Anthropic, Google Generative AI, and GitHub API for enriched content.
- **Interactive UI components** powered by React and Radix UI for editing and previewing README content live.
- **Syntax highlighting and markdown enhancements** with remark, rehype, and react-syntax-highlighter.
- **Stripe payment integration** for premium features and usage tracking.
- **Robust state management and authentication** via Supabase and Next.js for user sessions.
- **Highly customizable configuration** via environment variables and JSON config files.
- **Comprehensive error handling and retry logic** for stable API communication.
- **Built with Next.js 15 and TypeScript** to ensure best performance and developer experience.

---

## 📋 Prerequisites

Before installing and running readmeGenerator, ensure you have the following installed and configured:

1. **Node.js v18 or higher** — [Download Node.js](https://nodejs.org/)
2. **npm v9 or higher** (comes with Node.js)
3. **A GitHub account** and personal access token for API access (with repo scope)
4. **OpenAI API key** — [Get your API key](https://platform.openai.com/account/api-keys)
5. **Anthropic API key** — [Create an account](https://www.anthropic.com/)
6. **Google Generative AI API credentials** — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
7. **Stripe API keys** for payment integration — [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
8. **Supabase project** for authentication and database — [Supabase.io](https://supabase.io/)
9. **PostgreSQL database** (managed by Supabase or self-hosted)
10. **Basic familiarity with environment variables and .env files**

---

## 🚀 Installation

Follow these step-by-step instructions to get readmeGenerator running locally:

1. **Clone the repository**

```bash
git clone https://github.com/tanbiralam/readmeGenerator.git
cd readmeGenerator
2. **Install dependencies**

```bash
npm install
3. **Set up environment variables**

Create a `.env` file in the root directory based on the example below:

```bash
cp .env.example .env
Edit `.env` and fill in your API keys and database credentials.

4. **Database setup**

If you are using Supabase, create a new project and note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema is managed automatically via migrations or you can run:

```bash
npm run db:migrate
*(Adjust commands if you manage migrations differently.)*

5. **Start development server**

```bash
npm run dev
6. **Verify installation**

- Visit `http://localhost:3000` in your browser.
- You should see the readmeGenerator UI.
- Try generating a sample README by providing a GitHub repo or project details.
- Check console logs for any errors.

If the app loads without errors and README generation completes, your installation is successful.

---

## 💻 Usage

Below are multiple usage examples demonstrating the core API interactions using TypeScript and best practices.

### 1. Generate README using OpenAI chat completion (GPT-4)

```typescript
import { config } from "dotenv";
import OpenAI from "openai";

config(); // Load environment variables from .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  model: 'gpt-4' | 'gpt-3.5-turbo';
  messages: { role: string; content: string }[];
  max_tokens?: number;
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
    return response.choices[0].message?.content ?? "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate README");
  }
}

// Example usage:
(async () => {
  const prompt = "Generate a professional README for a TypeScript GitHub project named readmeGenerator.";
  const readmeContent = await generateReadme(prompt);
  console.log(readmeContent);
})();
---

### 2. Fetch GitHub repo details via Octokit

```typescript
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getRepoInfo(owner: string, repo: string) {
  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error("GitHub API error:", error);
    throw new Error("Failed to fetch repository info");
  }
}

// Example usage:
(async () => {
  const repoData = await getRepoInfo("tanbiralam", "readmeGenerator");
  console.log(`Repository: ${repoData.full_name} - ${repoData.description}`);
})();
---

### 3. Retry logic with Axios for Anthropic SDK calls

```typescript
import Anthropics from "@anthropic-ai/sdk";

const anthropic = new Anthropics({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

async function callAnthropicWithRetry(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.completions.create({
        prompt,
        model: "claude-v1",
        max_tokens_to_sample: 1000,
      });
      return response.completion;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error("Anthropic API request failed after retries");
      }
      // Exponential backoff
      await new Promise((res) => setTimeout(res, attempt * 1000));
    }
  }
  throw new Error("Unexpected error in retry logic");
}

// Example usage:
(async () => {
  const text = await callAnthropicWithRetry("Generate a README introduction paragraph.");
  console.log(text);
})();
---

## ⚙️ Configuration

readmeGenerator is configured via environment variables. Below are the key variables you must set in your `.env` file:

| Variable                  | Description                                                  | Example                                | Required |
|---------------------------|--------------------------------------------------------------|--------------------------------------|----------|
| OPENAI_API_KEY            | API key for OpenAI GPT models                                | sk-abc123xyz                         | Yes      |
| ANTHROPIC_API_KEY         | API key for Anthropic AI                                     | anthropic-xyz123                    | Yes      |
| GOOGLE_AI_API_KEY         | Google Generative AI API key                                 | AIzaSy...                          | Yes      |
| GITHUB_TOKEN              | GitHub Personal Access Token (with repo scope)              | ghp_abc1234567890                  | Yes      |
| STRIPE_SECRET_KEY         | Secret key for Stripe payment integration                    | sk_test_4eC39HqLyjWDarjtT1zdp7dc  | Yes      |
| SUPABASE_URL              | Supabase project URL                                         | https://xyzcompany.supabase.co    | Yes      |
| SUPABASE_ANON_KEY         | Supabase anonymous public API key                            | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Yes      |
| DATABASE_URL              | PostgreSQL connection string (if self-hosted)                | postgres://user:password@host:5432/dbname | Conditional |
| NEXT_PUBLIC_APP_URL       | Public URL of the deployed app (for OAuth redirects, etc.)  | http://localhost:3000               | Yes      |
| NODE_ENV                  | Node environment (development, production)                  | development                       | Yes      |

---

### .env.example

```env
# OpenAI API Key - Get yours from https://platform.openai.com/account/api-keys
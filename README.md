# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool that automatically creates professional and customized GitHub README files for your projects. By leveraging advanced AI models such as OpenAI GPT-4, Anthropic Claude, and Google Generative AI alongside GitHub repository metadata, it delivers rich and context-aware documentation with minimal effort.

---

## ✨ Features

- AI-driven README generation using OpenAI GPT-4 and GPT-3.5-turbo with customizable prompts.
- Automatic GitHub repository metadata fetching via Octokit REST API for dynamic README content.
- Interactive React UI with Radix UI tooltips featuring live editing, preview, and syntax-highlighted markdown.
- Advanced markdown processing with remark, rehype, and react-syntax-highlighter for elegant formatting.
- Stripe integration for premium features and usage billing.
- Secure authentication and session management powered by Supabase and Next.js.
- Robust error handling and retry logic for all API interactions.
- Built with Next.js 15 and TypeScript for scalability, maintainability, and performance.

---

## 🚀 Installation

Follow these steps to set up readmeGenerator locally:

1. **Clone the repository**

```bash
git clone https://github.com/tanbiralam/readmeGenerator.git
cd readmeGenerator

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file and fill in your API keys and database credentials as needed.

4. **Database setup**

If using Supabase, create a new project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema is managed automatically. If you use migrations, run:

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Verify installation**

Open your browser and navigate to [http://localhost:3000](http://localhost:3000). The UI should load and allow you to generate README files based on your GitHub repositories.

---

## 💻 Usage

Use the application by entering your GitHub repository or project details in the UI and let the AI generate a professional README for you. The tool supports live editing and previewing before you save your README.

Below are examples of core API interactions implemented in the project to illustrate its workings:

### Generate README using OpenAI GPT-4

```typescript
import { config } from "dotenv";
import OpenAI from "openai";

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

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
```

### Fetch GitHub repository details with Octokit

```typescript
import { Octokit } from "@octokit/rest";
import { config } from "dotenv";

config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getRepoInfo(owner: string, repo: string) {
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
```

### Anthropic API call with retry logic

```typescript
import { config } from "dotenv";
import Anthropics from "@anthropic-ai/sdk";

config();

const anthropic = new Anthropics({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

async function callAnthropicWithRetry(prompt: string, retries = 3, delayMs = 1000): Promise<string> {
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
      await new Promise(res => setTimeout(res, delayMs * attempt));
    }
  }
  throw new Error("Unexpected error in Anthropic retry logic.");
}
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a pull request with your improvements. For major changes, open an issue first to discuss what you would like to change.

Ensure your code follows the existing style and passes linting with:

```bash
npm run lint
```

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE).

---

# .env.example

```env
# GitHub Personal Access Token with 'repo' scope
GITHUB_TOKEN=your_github_personal_access_token_here
# Obtain at: https://github.com/settings/tokens

# OpenAI API Key for GPT models
OPENAI_API_KEY=your_openai_api_key_here
# Get your key at: https://platform.openai.com/account/api-keys

# Anthropic API Key for Claude model
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# Sign up at: https://www.anthropic.com/

# Google Generative AI API credentials (JSON or relevant keys)
GOOGLE_API_KEY=your_google_api_key_here
# Configure via: https://console.cloud.google.com/apis/credentials

# Stripe API keys for payment integration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
# Manage keys at: https://dashboard.stripe.com/apikeys

# Supabase configuration for authentication and database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
# Create project: https://supabase.io/

# PostgreSQL connection string (if self-hosted)
DATABASE_URL=postgresql://user:password@host:port/database
# Ensure this is kept secret and never committed to public repos
```

---

Thank you for using **readmeGenerator**! If you have any questions or feedback, please open an issue on the [GitHub repository](https://github.com/tanbiralam/readmeGenerator).
```
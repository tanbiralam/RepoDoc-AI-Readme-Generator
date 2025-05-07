# GitHub README Generator

Generate professional, comprehensive READMEs for your GitHub repositories using the power of AI. This full-stack application leverages large language models (LLMs) to analyze your codebase and create informative and well-structured README files, saving you time and effort.

## Features

- **AI-Powered Generation**: Analyzes your repository's code, structure, and package.json to generate high-quality READMEs. Utilizes Claude, OpenAI, and Gemini APIs for flexible LLM selection.
- **Repository Access**: Connect with your GitHub account to fetch public repositories or grant access to private repositories for analysis.
- **Live Editor**: Edit and preview the generated README in real-time with a Markdown editor. Fine-tune the content to perfectly represent your project.
- **Export Options**: Download the generated README as a Markdown file or commit it directly to your GitHub repository.
- **Authentication**: Securely sign in with GitHub, Google, or email/password via Supabase Auth.
- **Subscription Tiers (Future)**: Planned support for free, pro, and enterprise plans with varying usage limits. Currently, all features are available.

## Tech Stack

- **Frontend**: React, TypeScript, Next.js 15
- **Styling**: Tailwind CSS, Radix UI, clsx, class-variance-authority, tw-animate-css, Lucide React Icons, React Icons
- **Backend**: Supabase (Authentication, Database)
- **State Management**: Leverages Next.js features.
- **APIs**: GitHub API, Anthropic Claude API, Google Gemini API, OpenAI API
- **Payments (Future)**: Stripe integration planned for subscription management.
- **Markdown Rendering**: react-markdown, react-syntax-highlighter

## Installation

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase Account and Project
- GitHub OAuth App
- API Keys for Claude, OpenAI, and Gemini (at least one)

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/github-readme-generator.git
cd github-readme-generator
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Create a `.env.local` file:**

   Populate `.env.local` in the root directory with the following environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>

# Stripe (Future)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
STRIPE_SECRET_KEY=<your_stripe_secret_key>

# AI APIs
CLAUDE_API_KEY=<your_claude_api_key>
OPENAI_API_KEY=<your_openai_api_key>
GEMINI_API_KEY=<your_gemini_api_key>

# Base URL (For local development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Start the development server:**

```bash
npm run dev
# or
yarn dev
```

5. **Access the application:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Authenticate:** Sign in with your preferred method (GitHub, Google, or email/password).
2. **Select a Repository:** Choose a public repository from your GitHub account or provide access to a private repository.
3. **Generate README:** Click the generate button. The application will analyze your repository and create a README.
4. **Edit and Preview:** Use the live editor to customize the generated README content.
5. **Export/Commit:** Download the finalized README as a Markdown file or commit it directly to your GitHub repository.

## Configuration

The application is primarily configured through the `.env.local` file (see Installation).

## Contributing

Contributions are welcome! Please open an issue to discuss proposed changes or submit a pull request. Ensure your code adheres to the project's coding style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

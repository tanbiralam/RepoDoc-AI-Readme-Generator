# GitHub README Generator

A full-stack application that uses AI to generate professional READMEs for GitHub repositories. Built with React, TypeScript, Next.js, Supabase, and Tailwind CSS.

## Features

- **Authentication**: Sign in with GitHub, Google, or email/password via Supabase Auth
- **Repository Access**: Fetch public GitHub repositories or access private repos with permission
- **AI-Powered Generation**: Uses Claude 3.7 Sonnet to analyze repos and generate high-quality READMEs
- **Live Editor**: Edit and preview generated READMEs in real-time
- **Export Options**: Download as Markdown or commit directly to GitHub repositories
- **Subscription Tiers**: Free, Pro, and Enterprise plans with usage limits

## Tech Stack

- **Frontend**: React with TypeScript
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with ShadCN UI components
- **Backend**: Supabase for authentication and database
- **APIs**: GitHub API, Claude/OpenAI/Gemini for AI generation
- **Payments**: Stripe for subscription management

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account
- GitHub OAuth App
- Stripe account (for payments)
- AI API keys (Claude, OpenAI, or Gemini)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/github-readme-generator.git
cd github-readme-generator
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# AI APIs
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

Create the following tables in your Supabase project:

### profiles

- id: uuid (primary key, references auth.users.id)
- email: text
- created_at: timestamptz
- updated_at: timestamptz
- subscription_tier: text
- readme_generations_count: integer

### subscriptions

- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- plan_id: text
- status: text
- created_at: timestamptz
- current_period_end: timestamptz

## Stripe Webhook Setup

To set up the Stripe webhook:

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL (e.g., `https://yourdomain.com/api/webhook`)
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Click "Add endpoint"
6. Copy the Webhook Signing Secret
7. Add the signing secret to your `.env.local` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

For local development:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run `stripe login` to authenticate
3. Run `stripe listen --forward-to localhost:3000/api/webhook` to forward webhook events to your local server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

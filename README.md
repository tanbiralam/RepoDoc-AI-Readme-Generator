# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool that automatically generates professional, customized GitHub README files for your projects. It leverages advanced AI models such as OpenAI GPT-4, combined with GitHub repository metadata via Octokit REST API, to produce rich, context-aware documentation with ease.

---

## ✨ Features

- AI-driven README generation with OpenAI GPT-4 and GPT-3.5-turbo using customizable prompts.
- Dynamic fetching of GitHub repository metadata via Octokit REST API.
- Interactive React UI with Radix UI tooltips, live markdown editing, preview, and syntax highlighting.
- Advanced markdown processing with remark, rehype, and react-syntax-highlighter for elegant formatting.
- Stripe integration for premium features and usage billing.
- Secure authentication and session management powered by Supabase and Next.js.
- Robust error handling and retry logic on all API interactions.
- Built on Next.js 15 and TypeScript for scalability and optimal performance.

---

## 🚀 Installation

Follow these steps to set up **readmeGenerator** locally:

1. **Clone the repository**

```bash
git clone https://github.com/tanbiralam/readmeGenerator.git
cd readmeGenerator
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file with your API keys and database credentials (see `.env.example` below for details).

4. **Database setup**

Create a Supabase project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema is managed automatically. For migrations (if needed), run:

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Access the application**

Open your browser to [http://localhost:3000](http://localhost:3000) to start generating README files.

---

## 💻 Usage

Use the intuitive web interface to enter your GitHub repository URL or project details. The AI will generate a professional README tailored to your project automatically. You can edit the generated markdown with live preview and syntax highlighting before saving or downloading the final README file.

The tool supports multiple AI models and enriches your documentation with comprehensive repository insights, reducing the effort required to create detailed project documentation.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

- Fork the repository.
- Create a feature branch (`git checkout -b feature-name`).
- Ensure your code follows the existing style and passes linting:

```bash
npm run lint
```

- Submit a pull request describing your changes.
- For major changes, please open an issue first to discuss.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE).

---

# .env.example

```env
# OpenAI API key for AI-driven README generation
# Obtain from: https://platform.openai.com/account/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Stripe API secret key for payment processing and billing
# Obtain from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Supabase project URL and anon/public key for authentication and database access
# Create a project at: https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Database connection string (if applicable)
# Format example for PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_URL=your_database_connection_string_here

# Security note:
# Keep these keys private and never commit them to public repositories.
# Use environment variables to manage sensitive information securely.
```
# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool that automatically generates professional and customized GitHub README files for your projects. It leverages advanced AI models like OpenAI GPT-4, Anthropic Claude, and Google Generative AI, combined with GitHub repository metadata, to produce rich, context-aware documentation effortlessly.

---

## ✨ Features

- AI-driven README generation using OpenAI GPT-4 and GPT-3.5-turbo with customizable prompts.
- Fetches GitHub repository metadata dynamically via Octokit REST API.
- Interactive React UI with Radix UI tooltips, live editing, preview, and syntax-highlighted markdown.
- Advanced markdown processing using remark, rehype, and react-syntax-highlighter for elegant formatting.
- Stripe integration for premium features and usage billing.
- Secure authentication and session management with Supabase and Next.js.
- Robust error handling and retry logic for all API interactions.
- Built with Next.js 15 and TypeScript for scalability and performance.

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

Edit the `.env` file to add your API keys and database credentials (see `.env.example` for guidance).

4. **Database setup**

For Supabase, create a new project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The schema is managed automatically. If you use migrations, run:

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

Use the intuitive UI to input your GitHub repository or project details. The AI will generate a professional README tailored to your project. You can edit and preview the generated markdown live before saving or downloading the README file.

The platform supports multiple AI models and provides detailed repository insights to enrich your documentation with minimal effort.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

- Fork the repository.
- Create a feature branch.
- Ensure your code follows the existing style and passes linting:

```bash
npm run lint
```

- Submit a pull request describing your changes.
- For major changes, please open an issue first to discuss.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE).
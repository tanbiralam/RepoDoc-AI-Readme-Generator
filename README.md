# readmeGenerator 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool that automatically creates professional, customized GitHub README files for your projects. It combines OpenAI GPT-4 with GitHub repository metadata via the Octokit REST API to generate rich, context-aware documentation effortlessly.

---

## ✨ Features

- AI-driven README creation using OpenAI GPT-4 and GPT-3.5-turbo with customizable prompts.  
- Dynamic retrieval of GitHub repository metadata through Octokit REST API.  
- Interactive React UI featuring Radix UI tooltips, live markdown editing, preview, and syntax highlighting.  
- Advanced markdown processing with remark, rehype, and react-syntax-highlighter for polished formatting.  
- Stripe integration for premium features and usage billing.  
- Secure authentication and session management powered by Supabase and Next.js.  
- Robust error handling and retry mechanisms on all API calls.  
- Built with Next.js 15 and TypeScript for performance and scalability.  

---

## 🚀 Installation

To set up **readmeGenerator** locally, follow these steps:

1. **Clone the repository**

```bash
git clone https://github.com/tanbiralam/readmeGenerator.git
cd readmeGenerator
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` to include your OpenAI API key, Stripe secret key, Supabase credentials, and database connection string.

4. **Database setup**

Create a Supabase project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The schema is managed automatically. For migrations, if needed, run:

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open the application**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser to begin generating README files.

---

## 💻 Usage

Use the web interface to input your GitHub repository URL or enter your project details manually. The AI engine will generate a tailored, professional README automatically. You can edit the markdown with live preview and syntax highlighting. Once satisfied, save or download your README to include in your project.

The app supports multiple AI models and enriches your documentation with comprehensive repository insights, making it easy to create detailed, high-quality project documentation quickly.

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
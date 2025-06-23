# readmeGenerate using AI 🤖

[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool designed to automatically generate professional and customized GitHub README files. It leverages OpenAI's GPT-4 along with live GitHub repository data via the Octokit REST API to create detailed, context-aware documentation with minimal effort.

---

## ✨ Features

- AI-driven README generation using OpenAI GPT-4 and GPT-3.5-turbo with customizable prompts  
- Real-time GitHub repository metadata fetched through Octokit REST API  
- Interactive React interface with Radix UI components for an enhanced UX: tooltips, live markdown editing, preview, and syntax highlighting  
- Advanced markdown processing powered by remark, rehype, and react-syntax-highlighter for polished output  
- Seamless Stripe integration enabling premium features and usage billing  
- Secure authentication and session handling using Supabase and Next.js  
- Robust error handling and automatic retry mechanisms for API calls  
- Built on Next.js 15 and TypeScript for optimal performance and scalability  

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

3. **Configure environment variables**

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` to include your OpenAI API key, Stripe secret key, Supabase credentials, and database connection string.

4. **Database setup**

Create a Supabase project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema is managed automatically. If manual migrations are needed, run:

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Access the application**

Open your browser and go to [http://localhost:3000](http://localhost:3000) to start generating README files.

---

## 💻 Usage

Use the web interface to enter your GitHub repository URL or manually provide your project details. The AI engine will generate a tailored README file automatically. You can edit the markdown with a live preview and syntax highlighting to refine your documentation. When satisfied, download or save your README to your project repository.

The tool supports multiple AI models and enriches your README with comprehensive repository insights, enabling you to create high-quality, professional project documentation quickly and effortlessly.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

- Fork the repository  
- Create a feature branch (`git checkout -b feature-name`)  
- Make sure your code follows the existing style and passes linting:

```bash
npm run lint
```

- Submit a pull request with a clear description of your changes  
- For major updates, open an issue first to discuss your proposal  

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE).
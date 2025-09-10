
[![npm version](https://img.shields.io/npm/v/github-readme-generator?color=blue&label=npm)](https://www.npmjs.com/package/github-readme-generator)  
[![License: MIT](https://img.shields.io/github/license/tanbiralam/readmeGenerator)](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE)  

---

readmeGenerator is an AI-powered tool that streamlines the creation of professional and customized GitHub README files. By leveraging OpenAI's GPT-4 and live GitHub data accessed through Octokit REST API, it produces detailed, context-aware documentation with minimal user effort.

---

## ✨ Features

- AI-driven README generation using OpenAI GPT-4 and GPT-3.5-turbo with customizable prompts  
- Real-time GitHub repository metadata retrieval via Octokit REST API  
- Interactive React interface with Radix UI components including tooltips, live markdown editing, preview, and syntax highlighting  
- Advanced markdown processing powered by remark, rehype, and react-syntax-highlighter for polished output  
- Seamless Stripe integration for premium feature access and billing management  
- Secure authentication and session handling using Supabase and Next.js  
- Robust error handling with automatic retry logic for API calls  
- Built with Next.js 15 and TypeScript for performance and scalability  

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

Create a copy of the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file to include your OpenAI API key, Stripe secret key, Supabase credentials, and database connection string.

4. **Database setup**

Set up a Supabase project and obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The database schema is managed automatically. If manual migrations are necessary, run:

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Access the application**

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start generating README files.

---

## 💻 Usage

Use the intuitive web interface to input your GitHub repository URL or manually enter project details. The AI engine will generate a tailored README file automatically. You can edit the markdown with live preview and syntax highlighting to customize your documentation. Once satisfied, download or save your README directly to your project repository.

The tool supports multiple AI models and enriches your README with comprehensive repository insights, enabling you to create professional-quality documentation quickly and effortlessly.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

- Fork the repository  
- Create a feature branch (`git checkout -b feature-name`)  
- Ensure your code adheres to the existing style and passes linting:

```bash
npm run lint
```

- Submit a pull request with a clear description of your changes  
- For significant updates, open an issue first to discuss your proposal  

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/tanbiralam/readmeGenerator/blob/main/LICENSE).

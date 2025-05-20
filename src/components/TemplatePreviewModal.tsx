"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Code } from "lucide-react";
import { Template } from "@/utils/constants";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
}

const TEMPLATE_PREVIEWS = {
  "Modern Project": `
# Project Name

![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-green)

A modern, efficient solution for [brief description of what your project does].

## Features

- **Fast Performance**: Optimized for speed and efficiency
- **Customizable**: Easy to adapt to your specific needs
- **Cross-platform**: Works on Windows, MacOS, and Linux
- **Lightweight**: Minimal dependencies and small footprint

## Installation

\`\`\`bash
npm install your-package-name
# or
yarn add your-package-name
\`\`\`

## Usage

\`\`\`javascript
import { feature } from 'your-package-name';

// Initialize with your configuration
const instance = feature.init({
  option1: 'value1',
  option2: 'value2'
});

// Use the features
instance.doSomething();
\`\`\`

## Documentation

For full documentation, visit [docs.example.com](https://docs.example.com).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
`,

  "Developer Portfolio": `
# John Doe - Full Stack Developer

![Profile Banner](https://via.placeholder.com/1200x300)

## 👋 About Me

I'm a passionate full-stack developer with expertise in React, Node.js, and cloud technologies. With 5+ years of experience building scalable web applications and services.

## 🛠️ Skills

### Frontend
- React/Next.js
- TypeScript
- Tailwind CSS
- Redux

### Backend
- Node.js/Express
- Python/Django
- RESTful APIs
- GraphQL

### DevOps & Tools
- AWS/GCP
- Docker & Kubernetes
- Git/GitHub
- CI/CD Pipelines

## 🚀 Featured Projects

### Project Awesome
A real-time collaboration platform built with React, Node.js and Socket.io.
[Demo](https://example.com) | [GitHub](https://github.com/username/project)

### Data Visualizer
An interactive dashboard for visualizing complex datasets.
[Demo](https://example.com) | [GitHub](https://github.com/username/project)

## 📫 Contact

- Email: john.doe@example.com
- LinkedIn: [linkedin.com/in/johndoe](https://linkedin.com/in/johndoe)
- Twitter: [@johndoe](https://twitter.com/johndoe)

Feel free to reach out if you're looking for a developer, have a question, or just want to connect!
`,

  "API Documentation": `
# User API Documentation

![API Version](https://img.shields.io/badge/API%20Version-v1.0-blue)

Comprehensive documentation for the User Management API endpoints.

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication

All API requests require the use of a generated API key. You can get your API key from the developer dashboard.

Authentication to the API is performed via HTTP Bearer Auth. The token should be provided in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## User Endpoints

### Get User

\`GET /users/:id\`

Retrieves a specific user by ID.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id   | string | The user's unique identifier |

#### Response

\`\`\`json
{
  "id": "usr_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-15T00:00:00Z",
  "status": "active"
}
\`\`\`

### Create User

\`POST /users\`

Creates a new user.

#### Request Body

\`\`\`json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}
\`\`\`

#### Response

\`\`\`json
{
  "id": "usr_789012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "created_at": "2023-06-20T00:00:00Z",
  "status": "active"
}
\`\`\`

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of requests.

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error
`,

  "Open Source": `
# Open Source Project

![Build Status](https://img.shields.io/github/workflow/status/username/repo/CI) 
![License](https://img.shields.io/github/license/username/repo) 
![Contributors](https://img.shields.io/github/contributors/username/repo)

An open-source tool designed for the community, by the community.

## 🚀 Project Vision

This project aims to provide a robust, community-driven solution for [specific problem]. We believe in collaborative development and welcome contributions from developers worldwide.

## 📋 Features

- Feature one with brief description
- Feature two with brief description
- Feature three with brief description
- And many more to come!

## 🛠️ Technology Stack

- Frontend: React, TypeScript
- Backend: Node.js, Express
- Database: MongoDB
- DevOps: Docker, GitHub Actions

## 🔧 Installation

Clone the repository:
\`\`\`bash
git clone https://github.com/username/project.git
cd project
\`\`\`

Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

## 🤝 Contributing

We welcome contributions of all kinds! Please check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- All our amazing contributors
- The open source projects that inspired us
- The community for their continuous support and feedback
`,
};

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: TemplatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (template) {
      const templatePreview =
        TEMPLATE_PREVIEWS[template.name as keyof typeof TEMPLATE_PREVIEWS] ||
        "";
      setContent(templatePreview);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl h-[calc(100vh-6rem)] bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-800 p-4">
            <div>
              <h3 className="text-xl font-medium text-white">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === "preview"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  Preview
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === "code"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("code")}
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Markdown
                  </span>
                </button>
              </div>
              <button
                className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "preview" ? (
              <div className="p-8 bg-white text-gray-900 overflow-y-auto h-full">
                <div className="prose prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:rounded prose-code:px-1 max-w-none">
                  {/* This would ideally use a markdown parser like react-markdown */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(content),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 h-full">
                <pre className="text-sm text-gray-300 bg-gray-950 p-6 rounded-lg overflow-auto h-full">
                  <code>{content}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              {template.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Simple markdown formatter function (in a real app, use a proper markdown parser)
function formatMarkdown(markdown: string): string {
  // This is a very basic formatter - in a real app, use a library like react-markdown
  let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Links
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
    )
    // Lists
    .replace(/^\- (.*$)/gm, "<li>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    // Images
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />'
    );

  // Wrap with paragraph tags
  html = "<p>" + html + "</p>";

  // Fix lists
  html = html
    .replace(/<li>(.*?)<\/li>/g, function (match) {
      return '<ul class="list-disc pl-5 my-4">' + match + "</ul>";
    })
    .replace(/<\/ul><ul class="list-disc pl-5 my-4">/g, "");

  return html;
}

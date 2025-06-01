import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkEmoji from "remark-emoji";
import { markdownComponents } from "./MarkdownComponents";
import { ReadmeSection } from "@/types";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  sections?: ReadmeSection[];
}

const preprocessMarkdown = (content: string): string => {
  return (
    content
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      // Fix code blocks with language specifiers
      .replace(/^```(\w+)?\s*\n/g, (_, lang) => `\n\`\`\`${lang || ""}\n`)
      // Ensure code blocks are properly closed
      .replace(/```\s*$/gm, "```\n")
      // Fix code blocks that might be malformed
      .replace(
        /^```([^`\n]+)```$/gm,
        (_, content) => `\n\`\`\`\n${content}\n\`\`\`\n`
      )
      // Ensure proper spacing between code blocks and other content
      .replace(/([^`])\n```/g, "$1\n\n```")
      .replace(/```\n([^`])/g, "```\n\n$1")
      // Fix code blocks with language specifiers
      .replace(/^```(\w+)\s*$/gm, (_, lang) => `\`\`\`${lang}\n`)
      // Ensure proper spacing for headers
      .replace(/\n(#{1,6})\s*([^\n]+)/g, "\n\n$1 $2\n")
      // Fix list formatting
      .replace(/^\s*[-*+]\s/gm, "- ")
      .replace(/^\s*(\d+)\.\s/gm, "$1. ")
      // Clean up excessive newlines while preserving code block formatting
      .replace(/\n{3,}/g, "\n\n")
      // Ensure code blocks have proper line breaks
      .replace(/```\n*([^`]+?)\n*```/g, "```\n$1\n```")
  );
};

export default function MarkdownPreview({
  content,
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sections,
}: MarkdownPreviewProps) {
  const processedContent = preprocessMarkdown(content);

  return (
    <div
      className={`prose prose-slate max-w-none dark:prose-invert 
      prose-headings:text-gray-100
      prose-p:text-gray-300 
      prose-strong:text-gray-100
      prose-ul:text-gray-300
      prose-ol:text-gray-300
      prose-li:marker:text-gray-500
      prose-pre:bg-[#1e1e1e] 
      prose-pre:text-gray-100
      prose-pre:rounded-lg
      prose-code:font-mono
      prose-blockquote:text-gray-300 
      prose-blockquote:border-gray-600
      prose-a:break-all 
      prose-a:font-mono
      ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          [remarkToc, { tight: true, maxDepth: 3 }],
          [remarkEmoji, { emoticon: true }],
        ]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

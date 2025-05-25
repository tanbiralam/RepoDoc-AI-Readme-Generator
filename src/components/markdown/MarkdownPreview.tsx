import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkEmoji from "remark-emoji";
import { markdownComponents } from "./MarkdownComponents";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const preprocessMarkdown = (content: string): string => {
  return (
    content
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      // Ensure code blocks have proper spacing and format
      .replace(/```(\w+)?\s*\n/g, (_, lang) => `\n\`\`\`${lang || ""}\n`)
      .replace(/```\s*$/gm, "```\n")
      // Fix code blocks that might be malformed
      .replace(
        /^```([^`\n]+)```$/gm,
        (_, content) => `\`\`\`\n${content}\n\`\`\``
      )
      // Ensure headers have proper spacing
      .replace(/\n(#{1,6})\s*([^\n]+)/g, "\n\n$1 $2\n")
      // Fix list formatting
      .replace(/^\s*[-*+]\s/gm, "- ")
      .replace(/^\s*(\d+)\.\s/gm, "$1. ")
      // Clean up excessive newlines while preserving code block formatting
      .replace(/\n{3,}/g, "\n\n")
      // Ensure proper spacing around code blocks
      .replace(/\n*```/g, "\n\n```")
  );
};

export default function MarkdownPreview({
  content,
  className = "",
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

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Components } from "react-markdown";

type CodeBlockProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

const processCodeContent = (content: string) => {
  // Remove the outermost code fence if present
  let processed = content.replace(/^```[\s\S]*?\n([\s\S]*?)```$/g, "$1");

  // Clean up any remaining internal code fences
  processed = processed.replace(/```(\w+)?\n/g, "");
  processed = processed.replace(/```/g, "");

  return processed.trim();
};

export const markdownComponents: Components = {
  code: ({ inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || "");
    const content = String(children).replace(/\n$/, "");

    // Handle inline code
    if (inline) {
      return (
        <code
          className={`font-mono bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm ${className}`}
          {...props}
        >
          {content}
        </code>
      );
    }

    // Extract language from code fence if present
    const codeFenceMatch = content.match(/^```(\w+)?/);
    const language = match?.[1] || codeFenceMatch?.[1] || "text";

    // Process the content to handle nested code blocks
    const processedContent = processCodeContent(content);

    return (
      <SyntaxHighlighter
        // @ts-expect-error - Known type issue with style prop
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="my-4 rounded-lg overflow-hidden"
        customStyle={{
          margin: 0,
          background: "#1e1e1e",
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: "0.875rem",
            lineHeight: "1.5",
          },
        }}
        {...props}
      >
        {processedContent}
      </SyntaxHighlighter>
    );
  },
  // Customize link rendering
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isUrl = href?.startsWith("http") || href?.startsWith("https");
    return (
      <a
        href={href}
        target={isUrl ? "_blank" : undefined}
        rel={isUrl ? "noopener noreferrer" : undefined}
        className="text-blue-400 hover:text-blue-300 font-mono break-all"
        {...props}
      >
        {children}
      </a>
    );
  },
  // Customize table rendering
  table: ({
    children,
    ...props
  }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-8">
      <table
        className="min-w-full divide-y divide-gray-600 border border-gray-600"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  // Add custom styles for headings - Dark theme
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold mt-5 mb-2 text-gray-100" {...props}>
      {children}
    </h3>
  ),
  // Add styles for paragraphs - Dark theme
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
    const childrenArray = React.Children.toArray(children);

    const hasNonTextChild = childrenArray.some(
      (child) =>
        React.isValidElement(child) &&
        typeof child === "object" &&
        "type" in child &&
        child.type !== "text"
    );

    if (hasNonTextChild) {
      return <>{children}</>;
    }

    return (
      <p
        className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap"
        {...props}
      >
        {children}
      </p>
    );
  },
  // Add styles for lists - Dark theme
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-gray-300 mb-4 list-disc pl-5" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-gray-300 mb-4 list-decimal pl-5" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => {
    // Check if the list item contains only a code block
    const childrenArray = React.Children.toArray(children);
    if (
      childrenArray.length === 1 &&
      React.isValidElement(childrenArray[0]) &&
      childrenArray[0].type === "code"
    ) {
      return (
        <li className="text-gray-300 mb-2" {...props}>
          {children}
        </li>
      );
    }
    return (
      <li className="text-gray-300 mb-2" {...props}>
        {children}
      </li>
    );
  },
  // Add styles for blockquotes - Dark theme
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="text-gray-300 border-l-4 border-gray-600 pl-4 italic my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
};

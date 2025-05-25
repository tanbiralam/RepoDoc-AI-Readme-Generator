import React, { ReactElement } from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type InsertText = string | ((selectedText: string) => string);

interface MarkdownToolboxProps {
  onInsert: (text: InsertText) => void;
  className?: string;
}

interface Tool {
  icon: ReactElement;
  label: string;
  action: InsertText;
  tooltip: string;
  shortcut?: string;
}

export default function MarkdownToolbox({
  onInsert,
  className = "",
}: MarkdownToolboxProps) {
  const tools: Tool[] = [
    {
      icon: <span className="font-bold text-lg text-blue-400">H</span>,
      label: "Heading",
      action: "# ",
      tooltip: "Add heading",
      shortcut: "Ctrl + H",
    },
    {
      icon: <span className="font-bold text-gray-100">B</span>,
      label: "Bold",
      action: (text) => `**${text || "bold text"}**`,
      tooltip: "Make text bold",
      shortcut: "Ctrl + B",
    },
    {
      icon: <span className="italic text-gray-100">I</span>,
      label: "Italic",
      action: (text) => `*${text || "italic text"}*`,
      tooltip: "Make text italic",
      shortcut: "Ctrl + I",
    },
    {
      icon: <span className="underline text-gray-100">U</span>,
      label: "Link",
      action: (text) => `[${text || "link text"}](url)`,
      tooltip: "Insert link",
      shortcut: "Ctrl + K",
    },
    {
      icon: <span className="text-gray-100 text-lg">•</span>,
      label: "List",
      action: "- ",
      tooltip: "Add list item",
    },
    {
      icon: <span className="text-gray-100">1.</span>,
      label: "Numbered List",
      action: "1. ",
      tooltip: "Add numbered list item",
    },
    {
      icon: <span className="text-gray-100 font-mono">`</span>,
      label: "Code",
      action: (text) => `\`${text || "code"}\``,
      tooltip: "Insert inline code",
      shortcut: "Ctrl + `",
    },
    {
      icon: <span className="text-gray-100 font-mono text-sm">```</span>,
      label: "Code Block",
      action: (text) => `\`\`\`\n${text || "code block"}\n\`\`\``,
      tooltip: "Insert code block",
      shortcut: "Ctrl + Shift + `",
    },
    {
      icon: <span className="text-gray-100 text-lg">{">"}</span>,
      label: "Quote",
      action: "> ",
      tooltip: "Add blockquote",
    },
    {
      icon: <span className="text-gray-100">―</span>,
      label: "Horizontal Rule",
      action: "\n---\n",
      tooltip: "Insert horizontal rule",
    },
    {
      icon: <span className="text-xl">🖼️</span>,
      label: "Image",
      action: "![alt text](image-url)",
      tooltip: "Insert image",
    },
    {
      icon: <span className="text-xl">📋</span>,
      label: "Table",
      action:
        "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
      tooltip: "Insert table",
    },
  ];

  return (
    <div
      className={`flex flex-wrap gap-1 p-2 bg-gray-800/80 border-b border-gray-700 backdrop-blur-sm ${className}`}
    >
      <TooltipProvider>
        {tools.map((tool, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-700 hover:text-gray-100 transition-colors duration-200 relative group"
                onClick={() => onInsert(tool.action)}
              >
                {tool.icon}
                <span className="absolute inset-0 rounded-md ring-1 ring-gray-600 group-hover:ring-gray-500 transition-colors duration-200" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-gray-100">
              <p>{tool.tooltip}</p>
              {tool.shortcut && (
                <p className="text-xs text-gray-400">{tool.shortcut}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

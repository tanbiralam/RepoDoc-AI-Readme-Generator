import React, { useRef, useCallback } from "react";
import MarkdownToolbox from "./MarkdownToolbox";
import { useMarkdownShortcuts } from "../../hooks/useMarkdownShortcuts";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

type InsertText = string | ((selectedText: string) => string);

export default function MarkdownEditor({
  content,
  onChange,
  placeholder = "Start writing your README...",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolboxInsert = useCallback(
    (text: InsertText) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      let newText = text;
      if (typeof text === "function") {
        newText = text(selectedText);
      } else if (selectedText) {
        // If text is selected and the insertion is a prefix (like '# ' or '> ')
        if (text.endsWith(" ")) {
          newText = text + selectedText;
        }
        // If text is selected and we're wrapping it (like **bold**)
        else if (text.includes("text")) {
          newText = text.replace("text", selectedText);
        }
      }

      const newContent =
        content.substring(0, start) + newText + content.substring(end);

      onChange(newContent);

      // Set cursor position after the insertion
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + newText.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [content, onChange]
  );

  useMarkdownShortcuts({
    onBold: () => handleToolboxInsert((text) => `**${text || "bold text"}**`),
    onItalic: () => handleToolboxInsert((text) => `*${text || "italic text"}*`),
    onHeading: () => handleToolboxInsert("# "),
    onLink: () =>
      handleToolboxInsert((text) => `[${text || "link text"}](url)`),
    onInlineCode: () => handleToolboxInsert((text) => `\`${text || "code"}\``),
    onCodeBlock: () =>
      handleToolboxInsert((text) => `\`\`\`\n${text || "code block"}\n\`\`\``),
  });

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <MarkdownToolbox onInsert={handleToolboxInsert} />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm bg-gray-900 text-gray-100 placeholder-gray-400 border-none"
        spellCheck="false"
      />
    </div>
  );
}

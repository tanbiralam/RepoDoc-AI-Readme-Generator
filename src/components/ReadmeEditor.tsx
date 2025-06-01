import { useState, useEffect, useRef } from "react";
import MarkdownEditor from "./markdown/MarkdownEditor";
import MarkdownPreview from "./markdown/MarkdownPreview";
import { ReadmeSection } from "@/types";

interface ReadmeEditorProps {
  readmeContent: string;
  onChange: (content: string) => void;
  onToggleFullScreen?: (isFullScreen: boolean) => void;
  sections?: ReadmeSection[];
}

export default function ReadmeEditor({
  readmeContent,
  onChange,
  onToggleFullScreen,
  sections,
}: ReadmeEditorProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [content, setContent] = useState<string>(readmeContent);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(readmeContent);
  }, [readmeContent]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
        onToggleFullScreen?.(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEditing, onToggleFullScreen]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  if (isEditing) {
    return (
      <div
        ref={editorContainerRef}
        className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-sm">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-100">Edit README</h2>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-900/50 text-indigo-300 rounded-md">
              Editor Mode
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                onToggleFullScreen?.(false);
              }}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-all duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close Editor (ESC)
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-900">
          <MarkdownEditor
            content={content}
            onChange={handleContentChange}
            placeholder="# README Content"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ zIndex: 1 }}
      >
        <button
          onClick={() => {
            setIsEditing(true);
            onToggleFullScreen?.(true);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all duration-200 shadow-sm flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>
      <MarkdownPreview content={content} className="p-4" sections={sections} />
    </div>
  );
}

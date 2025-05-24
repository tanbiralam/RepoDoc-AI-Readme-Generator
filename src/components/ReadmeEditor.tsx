import { useState, useEffect, useRef } from "react";
// import { ReadmeGenerationResult, ReadmeSection } from "@/types"; // ReadmeSection is no longer used
import { ReadmeGenerationResult } from "@/types";
import TiptapEditor from "./TiptapEditor";

interface ReadmeEditorProps {
  readmeContent: string;
  onChange: (content: string) => void;
  sections?: ReadmeGenerationResult["sections"]; // Kept for potential future use like scrollToSection
  onToggleFullScreen?: (isFullScreen: boolean) => void;
}

export default function ReadmeEditor({
  readmeContent,
  onChange,
  // sections, // No longer used
  onToggleFullScreen,
}: ReadmeEditorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [content, setContent] = useState<string>(readmeContent);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(readmeContent);
  }, [readmeContent]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        onToggleFullScreen?.(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullScreen, onToggleFullScreen]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  const toggleFullScreen = () => {
    const newFullScreenState = !isFullScreen;
    setIsFullScreen(newFullScreenState);
    onToggleFullScreen?.(newFullScreenState);
    if (newFullScreenState && editorContainerRef.current) {
      setTimeout(() => editorContainerRef.current?.focus(), 0);
    }
  };

  return (
    <div
      ref={editorContainerRef}
      className={`rounded-lg overflow-hidden bg-white text-black shadow-sm border border-gray-100 ${
        isFullScreen ? "fixed inset-0 z-[9999]" : ""
      }`}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
        <h2 className="text-lg font-medium text-gray-900">README Editor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullScreen}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isFullScreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5-5m0 0l5-5m-5 5h16m0-5l-5 5m0 0l5 5m-5-5H4"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
          </button>
          <button
            onClick={() => setEditMode(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              !editMode
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setEditMode(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              editMode
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      {editMode ? (
        <div className="flex flex-col md:flex-row border-b border-gray-100">
          <div className="w-full md:w-1/2 border-r border-gray-100">
            <div className="bg-gray-50/80 p-3 border-b border-gray-100 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                MARKDOWN EDITOR
              </span>
            </div>
            <TiptapEditor
              content={content}
              onChange={handleContentChange}
              editable={true}
              className={`p-1 ${
                isFullScreen ? "h-[calc(100vh-180px)]" : "h-[500px]"
              }`}
              placeholder="# README Content"
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50/80 p-3 border-b border-gray-100 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">PREVIEW</span>
            </div>
            <div
              className={`overflow-y-auto ${
                isFullScreen ? "h-[calc(100vh-180px)]" : "h-[500px]"
              }`}
            >
              <TiptapEditor
                content={content}
                onChange={() => {}}
                editable={false}
                className="p-1"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={contentContainerRef}
          className={`overflow-y-auto ${
            isFullScreen ? "h-[calc(100vh-120px)]" : "h-[560px]"
          }`}
        >
          <TiptapEditor
            content={content}
            onChange={() => {}}
            editable={false}
            className="p-1"
          />
        </div>
      )}

      <div className="bg-gray-50/80 p-4 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100">
        <span className="font-medium">Use Markdown syntax for formatting</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-xs">
            {isFullScreen ? "Press ESC to exit full screen" : ""}
          </span>
          <a
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-semibold flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Markdown Cheat Sheet
          </a>
        </div>
      </div>
    </div>
  );
}

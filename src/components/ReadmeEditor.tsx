import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ReadmeGenerationResult, ReadmeSection } from "@/types";

interface ReadmeEditorProps {
  readmeContent: string;
  onChange: (content: string) => void;
  sections?: ReadmeGenerationResult["sections"];
}

export default function ReadmeEditor({
  readmeContent,
  onChange,
  sections,
}: ReadmeEditorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [content, setContent] = useState<string>(readmeContent);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(readmeContent);
  }, [readmeContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const scrollToSection = (index: number) => {
    setActiveSection(index);

    // Get the section title from the sections array
    if (sections && sections[index] && contentContainerRef.current) {
      const sectionTitle = sections[index].title;
      const contentContainer = contentContainerRef.current;

      // Find all heading elements in the preview area
      const headingElements = contentContainer.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );

      // Look for the heading element that matches the section title
      for (let i = 0; i < headingElements.length; i++) {
        if (headingElements[i].textContent?.trim() === sectionTitle) {
          const headingPositionTop = (headingElements[i] as HTMLElement)
            .offsetTop;

          // Scroll the container to the heading position
          contentContainer.scrollTo({
            top: headingPositionTop,
            behavior: "smooth",
          });
          break;
        }
      }
    }
  };

  return (
    <div className="rounded-lg overflow-hidden bg-white text-black shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
        <h2 className="text-lg font-medium text-gray-900">README Preview</h2>
        <div className="flex items-center space-x-2">
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

      {sections && !editMode && (
        <div className="flex border-b border-gray-100">
          <div className="w-1/4 border-r border-gray-100 overflow-y-auto max-h-[500px] bg-white">
            <div className="sticky top-0 bg-indigo-600 text-white px-4 py-2 text-sm font-medium z-10">
              Table of Contents
            </div>
            <ul className="divide-y divide-gray-100">
              {sections.map((section: ReadmeSection, index: number) => (
                <li
                  key={index}
                  className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all duration-200 
                    ${
                      activeSection === index
                        ? "bg-indigo-100 border-l-4 border-indigo-500"
                        : "border-l-4 border-transparent"
                    }`}
                  onClick={() => scrollToSection(index)}
                >
                  <span
                    className={`text-sm ${
                      section.level === 1
                        ? "font-semibold text-gray-900"
                        : section.level === 2
                        ? "font-medium text-gray-800 pl-2"
                        : "font-normal text-gray-700 pl-4"
                    } 
                    ${activeSection === index ? "text-indigo-700" : ""}`}
                  >
                    {section.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            ref={contentContainerRef}
            className="w-3/4 p-6 overflow-y-auto max-h-[500px] prose prose-indigo prose-headings:font-bold prose-headings:text-gray-900 max-w-none"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {(!sections || editMode) && (
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
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-[500px] p-5 font-mono text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 leading-relaxed border-0"
              placeholder="# README Content"
              spellCheck="false"
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
            <div className="p-6 overflow-y-auto h-[500px] prose prose-indigo prose-headings:font-bold prose-headings:text-gray-900 max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50/80 p-4 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100">
        <span className="font-medium">Use Markdown syntax for formatting</span>
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
  );
}

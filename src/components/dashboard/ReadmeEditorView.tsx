import { GitHubRepo, ReadmeSection } from "@/types";
import ReadmeEditor from "@/components/ReadmeEditor";
import ExportButtons from "@/components/ExportButtons";
import { useState } from "react";

interface ReadmeEditorViewProps {
  readmeContent: string;
  selectedRepo: GitHubRepo | null;
  sections?: ReadmeSection[];
  onChange: (content: string) => void;
}

export default function ReadmeEditorView({
  readmeContent,
  selectedRepo,
  sections,
  onChange,
}: ReadmeEditorViewProps) {
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);

  return (
    <div
      className={`space-y-6 animate-fadeIn ${
        isEditorFullScreen
          ? "fixed inset-0 z-[9998] bg-gray-950/80 backdrop-blur-sm"
          : ""
      }`}
    >
      <div
        className={`bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-blue-500/5 ${
          isEditorFullScreen
            ? "!bg-transparent !backdrop-blur-none !shadow-none !border-none !m-0 !p-0 !rounded-none"
            : ""
        }`}
      >
        {!isEditorFullScreen && (
          <div className="border-b border-gray-700 px-6 py-4 bg-gray-800/30">
            <h3 className="font-medium text-gray-100 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              README.md for {selectedRepo?.name}
            </h3>
          </div>
        )}
        <ReadmeEditor
          readmeContent={readmeContent}
          onChange={onChange}
          sections={sections}
          onToggleFullScreen={setIsEditorFullScreen}
        />
      </div>

      {!isEditorFullScreen && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-800 p-6 transition-all duration-300 hover:shadow-blue-500/5">
          <h3 className="font-medium text-gray-100 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              ></path>
            </svg>
            Export Options
          </h3>
          <ExportButtons
            readmeContent={readmeContent}
            selectedRepo={selectedRepo}
          />
        </div>
      )}
    </div>
  );
}

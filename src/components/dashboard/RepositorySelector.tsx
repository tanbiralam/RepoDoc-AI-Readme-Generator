import { useState } from "react";
import { GitHubRepo } from "@/types";
import RepoList from "@/components/RepoList";

interface RepositorySelectorProps {
  hasGithubConnection: boolean;
  selectedRepo: GitHubRepo | null;
  onRepoSelect: (repo: GitHubRepo) => void;
  onGenerateReadme: () => Promise<void>;
  isGenerating: boolean;
  showGitHubPrompt: boolean;
  setShowGitHubPrompt: (show: boolean) => void;
}

export default function RepositorySelector({
  hasGithubConnection,
  selectedRepo,
  onRepoSelect,
  onGenerateReadme,
  isGenerating,
  showGitHubPrompt,
  setShowGitHubPrompt,
}: RepositorySelectorProps) {
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-indigo-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          ></path>
        </svg>
        Repositories
      </h2>

      {hasGithubConnection ? (
        <RepoList
          onRepoSelect={onRepoSelect}
          selectedRepo={selectedRepo}
          onGenerateReadme={onGenerateReadme}
          isGenerating={isGenerating}
        />
      ) : (
        <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600">
            Connect your GitHub account to see your repositories.
          </p>
          {!showGitHubPrompt && (
            <button
              onClick={() => setShowGitHubPrompt(true)}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Show GitHub connection prompt
            </button>
          )}
        </div>
      )}

      {/* Debug logs toggle */}
      {selectedRepo && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={toggleLogs}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            {showLogs ? "Hide Debug Logs" : "View Debug Logs"}
          </button>

          {showLogs && (
            <div className="mt-3 text-xs bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
              {JSON.parse(
                localStorage.getItem("readme_generation_logs") || "[]"
              )
                .filter(
                  (log: Record<string, unknown>) =>
                    typeof log.message === "string" &&
                    log.message.includes(selectedRepo.name)
                )
                .slice(-5)
                .map((log: Record<string, unknown>, index: number) => (
                  <div
                    key={index}
                    className="mb-2 pb-2 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                  >
                    <div className="text-gray-400">
                      {new Date(log.timestamp as string).toLocaleTimeString()}
                    </div>
                    <div className="text-gray-700">{log.message as string}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

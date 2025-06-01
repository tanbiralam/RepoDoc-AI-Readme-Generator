import { GitHubRepo } from "@/types";
import RepoList from "@/components/RepoList";
import DebugLogs from "@/components/dashboard/DebugLogs";

interface RepositoryPanelProps {
  hasGithubConnection: boolean;
  selectedRepo: GitHubRepo | null;
  showLogs: boolean;
  generatingReadme: boolean;
  onRepoSelect: (repo: GitHubRepo) => void;
  onGenerateReadme: () => Promise<void>;
  onToggleLogs: () => void;
}

export default function RepositoryPanel({
  hasGithubConnection,
  selectedRepo,
  showLogs,
  generatingReadme,
  onRepoSelect,
  onGenerateReadme,
  onToggleLogs,
}: RepositoryPanelProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-800 p-6 sticky top-24 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-indigo-400"
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

        {/* Repository List */}
        {hasGithubConnection && (
          <div className="mt-4">
            <RepoList onRepoSelect={onRepoSelect} selectedRepo={selectedRepo} />
          </div>
        )}

        {/* Generate README button - only if there's a selected repo */}
        {selectedRepo && (
          <div className="mt-4">
            <button
              onClick={onGenerateReadme}
              disabled={generatingReadme}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {generatingReadme ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate README</>
              )}
            </button>
          </div>
        )}

        {/* Debug logs toggle - only if there's a selected repo */}
        {selectedRepo && (
          <div className="mt-4">
            <DebugLogs
              showLogs={showLogs}
              onToggleLogs={onToggleLogs}
              selectedRepo={selectedRepo}
            />
          </div>
        )}
      </div>
    </div>
  );
}

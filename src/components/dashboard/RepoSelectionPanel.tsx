import { GitHubRepo } from "@/types";
import RepoList from "@/components/RepoList";
import DebugLogs from "./DebugLogs";

interface RepoSelectionPanelProps {
  hasGithubConnection: boolean;
  selectedRepo: GitHubRepo | null;
  generatingReadme: boolean;
  showGitHubPrompt: boolean;
  onRepoSelect: (repo: GitHubRepo) => void;
  onGenerateReadme: () => Promise<void>;
  onShowGitHubPrompt: () => void;
}

/**
 * Repository selection panel component
 */
export function RepoSelectionPanel({
  hasGithubConnection,
  selectedRepo,
  generatingReadme,
  showGitHubPrompt,
  onRepoSelect,
  onGenerateReadme,
  onShowGitHubPrompt,
}: RepoSelectionPanelProps) {
  return (
    <div className="lg:col-span-1">
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
            isGenerating={generatingReadme}
          />
        ) : (
          <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">
              Connect your GitHub account to see your repositories.
            </p>
            {!showGitHubPrompt && (
              <button
                onClick={onShowGitHubPrompt}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Show GitHub connection prompt
              </button>
            )}
          </div>
        )}

        {/* Debug logs toggle */}
        {selectedRepo && <DebugLogs selectedRepo={selectedRepo} />}
      </div>
    </div>
  );
}

export default RepoSelectionPanel;

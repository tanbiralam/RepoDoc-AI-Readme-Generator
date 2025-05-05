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
  generatingReadme: _generatingReadme,
  onRepoSelect,
  onGenerateReadme: _onGenerateReadme,
  onToggleLogs,
}: RepositoryPanelProps) {
  const handleConnectGitHub = async () => {
    const { connectGitHub } = await import("@/services/auth");
    connectGitHub();
  };

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

        {!hasGithubConnection ? (
          <div className="p-4 text-center bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              Connect your GitHub account to see your repositories.
            </p>
            <button
              onClick={handleConnectGitHub}
              className="mt-4 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md font-medium transition-colors shadow-md shadow-indigo-500/20"
            >
              Connect GitHub
            </button>
          </div>
        ) : (
          <RepoList onRepoSelect={onRepoSelect} selectedRepo={selectedRepo} />
        )}

        {/* Debug logs toggle - only if there's a selected repo */}
        {selectedRepo && (
          <DebugLogs
            showLogs={showLogs}
            onToggleLogs={onToggleLogs}
            selectedRepo={selectedRepo}
          />
        )}
      </div>
    </div>
  );
}

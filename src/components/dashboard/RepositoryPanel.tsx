import { GitHubRepo } from "@/types";
import RepoList from "@/components/RepoList";
import DebugLogs from "@/components/dashboard/DebugLogs";

interface RepositoryPanelProps {
  hasGithubConnection: boolean;
  selectedRepo: GitHubRepo | null;
  showLogs: boolean;
  onRepoSelect: (repo: GitHubRepo) => void;
  onToggleLogs: () => void;
}

export default function RepositoryPanel({
  hasGithubConnection,
  selectedRepo,
  showLogs,
  onRepoSelect,
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

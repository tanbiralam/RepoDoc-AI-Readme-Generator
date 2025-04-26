import { connectGitHub } from "@/services/auth";

interface GitHubConnectionPromptProps {
  showGitHubPrompt: boolean;
  onDismiss: () => void;
  onConnect: () => void;
}

/**
 * A floating prompt that appears when a user needs to connect to GitHub
 */
function GitHubConnectionPrompt({
  showGitHubPrompt,
  onDismiss,
  onConnect,
}: GitHubConnectionPromptProps) {
  if (!showGitHubPrompt) {
    return null;
  }

  const handleConnectGitHub = async () => {
    await connectGitHub();
    onConnect();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 text-indigo-600 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">
            Connect Your GitHub Account
          </h3>
          <p className="mt-2 text-gray-600">
            Connecting your GitHub account allows us to access your repositories
            and generate README files for them.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleConnectGitHub}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm w-full"
          >
            Connect GitHub
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow-sm w-full"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default GitHubConnectionPrompt;

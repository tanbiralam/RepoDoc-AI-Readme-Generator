import React from "react";
import { useAuth } from "@/context/AuthContext";
import { connectGitHub } from "@/services/auth";
import { Github } from "lucide-react";

interface GitHubConnectionPromptProps {
  onDismiss?: () => void;
}

export default function GitHubConnectionPrompt({
  onDismiss,
}: GitHubConnectionPromptProps) {
  const { user, githubToken, hasGithubConnection } = useAuth();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Don't show if user already has GitHub connection
  if (!user || hasGithubConnection || githubToken) {
    return null;
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const { error } = await connectGitHub();

      if (error) {
        throw error;
      }

      // The page will redirect to GitHub, so we don't need to handle success here
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to GitHub"
      );
      setIsConnecting(false);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 animate-fadeIn">
      <div className="absolute top-3 right-3">
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
          <Github className="h-6 w-6 text-blue-600" />
        </div>

        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            Connect your GitHub account
          </h3>

          <p className="mt-2 text-sm text-blue-700">
            To generate READMEs for your repositories, you need to connect your
            GitHub account. This allows us to access your repositories and
            create tailored README files.
          </p>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
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
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  Connect with GitHub
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

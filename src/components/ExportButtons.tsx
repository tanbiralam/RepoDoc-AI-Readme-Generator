import { useState } from "react";
import { GitHubRepo } from "@/types";
import { commitReadmeToRepo } from "@/services/github";
import { useAuth } from "@/context/AuthContext";

interface ExportButtonsProps {
  readmeContent: string;
  selectedRepo: GitHubRepo | null;
}

export default function ExportButtons({
  readmeContent,
  selectedRepo,
}: ExportButtonsProps) {
  const { githubToken, hasPrivateRepoAccess } = useAuth();
  const [committing, setCommitting] = useState<boolean>(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);

  const handleDownload = () => {
    // Create a blob from the README content
    const blob = new Blob([readmeContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    // Create a link element and click it to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCommitToGitHub = async () => {
    if (!selectedRepo || !githubToken) return;

    try {
      setCommitting(true);
      setCommitError(null);
      setCommitSuccess(false);

      // Extract owner and repo name from full_name (format: owner/repo)
      const [owner, repo] = selectedRepo.full_name.split("/");

      const { success, error } = await commitReadmeToRepo(
        owner,
        repo,
        readmeContent,
        githubToken
      );

      if (error) throw error;

      if (success) {
        setCommitSuccess(true);
        setTimeout(() => setCommitSuccess(false), 5000); // Reset success message after 5 seconds
      }
    } catch (err) {
      setCommitError("Failed to commit README to GitHub. Please try again.");
      console.error("Error committing README:", err);
    } finally {
      setCommitting(false);
    }
  };

  const canCommitToGitHub =
    githubToken &&
    selectedRepo &&
    // If it's a public repo or the user has private repo access
    (!selectedRepo.private || hasPrivateRepoAccess);

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(readmeContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy README:", err);
      });
  };

  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownload}
          disabled={!readmeContent}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm transition-all duration-200 text-sm"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          Download README
        </button>

        <button
          onClick={handleCopyToClipboard}
          disabled={!readmeContent}
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm transition-all duration-200 text-sm"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Copied!
            </>
          ) : (
            <>
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
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                ></path>
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>

        <button
          onClick={handleCommitToGitHub}
          disabled={!canCommitToGitHub || !readmeContent || committing}
          className="px-4 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm transition-all duration-200 text-sm"
        >
          {committing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
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
              Committing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.217.682-.481 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.891 1.529 2.341 1.087 2.91.831.092-.645.35-1.085.636-1.336-2.22-.251-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
              Commit to GitHub
            </>
          )}
        </button>
      </div>

      {!githubToken && (
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-800 flex items-start animate-fadeIn">
          <svg
            className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5"
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
          <div>
            <p className="font-medium text-sm">
              To commit directly to GitHub, please login with your GitHub
              account.
            </p>
          </div>
        </div>
      )}

      {githubToken && selectedRepo?.private && !hasPrivateRepoAccess && (
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-800 flex items-start animate-fadeIn">
          <svg
            className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          <div>
            <p className="font-medium text-sm">
              You need to upgrade your plan to commit to private repositories.
            </p>
          </div>
        </div>
      )}

      {commitError && (
        <div className="p-4 rounded-lg bg-red-50/80 border border-red-200 text-red-700 flex items-start animate-fadeIn">
          <svg
            className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <p className="font-medium text-sm">{commitError}</p>
          </div>
        </div>
      )}

      {commitSuccess && (
        <div className="p-4 rounded-lg bg-green-50/80 border border-green-200 text-green-700 flex items-start animate-fadeIn">
          <svg
            className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <div>
            <p className="font-medium text-sm">
              README successfully committed to GitHub!
            </p>
            <p className="text-xs text-green-600 mt-1">
              You can now view it on your repository page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

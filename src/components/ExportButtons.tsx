import { useState } from 'react';
import { GitHubRepo } from '@/types';
import { commitReadmeToRepo } from '@/services/github';
import { useAuth } from '@/context/AuthContext';

interface ExportButtonsProps {
  readmeContent: string;
  selectedRepo: GitHubRepo | null;
}

export default function ExportButtons({ readmeContent, selectedRepo }: ExportButtonsProps) {
  const { githubToken, hasPrivateRepoAccess } = useAuth();
  const [committing, setCommitting] = useState<boolean>(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);

  const handleDownload = () => {
    // Create a blob from the README content
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and click it to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
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
      const [owner, repo] = selectedRepo.full_name.split('/');
      
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
      setCommitError('Failed to commit README to GitHub. Please try again.');
      console.error('Error committing README:', err);
    } finally {
      setCommitting(false);
    }
  };

  const canCommitToGitHub = githubToken && selectedRepo && (
    // If it's a public repo or the user has private repo access
    !selectedRepo.private || hasPrivateRepoAccess
  );

  return (
    <div className="space-y-5 mt-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleDownload}
          disabled={!readmeContent}
          className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors border border-blue-700 text-base"
        >
          <svg
            className="w-5 h-5"
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
          onClick={handleCommitToGitHub}
          disabled={!canCommitToGitHub || !readmeContent || committing}
          className="px-5 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors border border-gray-900 text-base"
        >
          {committing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Committing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Commit to GitHub
            </>
          )}
        </button>
      </div>

      {!githubToken && (
        <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-md">
          <p className="text-amber-800 font-medium text-sm">
            To commit directly to GitHub, please login with your GitHub account.
          </p>
        </div>
      )}

      {githubToken && selectedRepo?.private && !hasPrivateRepoAccess && (
        <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-md">
          <p className="text-amber-800 font-medium text-sm">
            You need to upgrade your plan to commit to private repositories.
          </p>
        </div>
      )}

      {commitError && (
        <div className="p-4 border-2 border-red-200 bg-red-50 rounded-md">
          <p className="text-red-700 font-medium">{commitError}</p>
        </div>
      )}

      {commitSuccess && (
        <div className="p-4 border-2 border-green-200 bg-green-50 rounded-md flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
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
          <p className="text-green-700 font-medium">
            README successfully committed to GitHub!
          </p>
        </div>
      )}
    </div>
  );
}

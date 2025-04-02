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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={!readmeContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {committing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
          )}
          Commit to GitHub
        </button>
      </div>
      
      {!githubToken && (
        <p className="text-sm text-amber-600">
          You need to sign in with GitHub to commit README files.
        </p>
      )}
      
      {githubToken && selectedRepo?.private && !hasPrivateRepoAccess && (
        <p className="text-sm text-amber-600">
          You need additional permissions to commit to private repositories.
        </p>
      )}
      
      {commitError && (
        <div className="p-3 text-sm rounded-md bg-red-50 text-red-600">
          {commitError}
        </div>
      )}
      
      {commitSuccess && (
        <div className="p-3 text-sm rounded-md bg-green-50 text-green-600">
          README successfully committed to {selectedRepo?.full_name}!
        </div>
      )}
    </div>
  );
}

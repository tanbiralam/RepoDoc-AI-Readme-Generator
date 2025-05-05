import { useState, useEffect } from "react";
import { GitHubRepo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchUserRepos } from "@/services/github";

interface RepoListProps {
  onRepoSelect: (repo: GitHubRepo) => void;
  selectedRepo?: GitHubRepo | null;
  onGenerateReadme?: () => Promise<void>;
  isGenerating?: boolean;
}

export default function RepoList({
  onRepoSelect,
  selectedRepo,
  onGenerateReadme,
  isGenerating = false,
}: RepoListProps) {
  const { githubToken } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    // If user is authenticated with GitHub token, fetch their repos
    if (githubToken) {
      loadUserRepos();
    } else {
      // If no GitHub token, set loading to false
      setLoading(false);
    }
  }, [githubToken]);

  const loadUserRepos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { repos: userRepos, error } = await fetchUserRepos(githubToken!);

      if (error) throw error;

      setRepos(userRepos);
    } catch (err) {
      setError("Failed to load repositories. Please try again.");
      console.error("Error fetching user repos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle generate readme button click
  const handleGenerateReadmeClick = (repo: GitHubRepo) => {
    // First select the repo if not already selected
    if (!selectedRepo || selectedRepo.id !== repo.id) {
      onRepoSelect(repo);
    }

    // Then call the generate function if provided
    if (onGenerateReadme) {
      onGenerateReadme();
    }
  };

  // Filter repos based on search term
  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no GitHub token, show message to connect GitHub
  if (!githubToken) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-600">
          Connect your GitHub account to see your repositories.
        </p>
        <button
          onClick={() => {
            import("@/services/auth").then(({ connectGitHub }) =>
              connectGitHub()
            );
          }}
          className="mt-4 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md font-medium transition-colors"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full p-2.5 pl-10 text-black border border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm placeholder-gray-400 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg
          className="absolute left-3 top-3 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>

      {error && (
        <div className="p-3 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 mb-4 flex items-center">
          <svg
            className="h-4 w-4 text-red-500 mr-2 flex-shrink-0"
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
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
          {filteredRepos.length === 0 ? (
            <div className="p-6 text-center text-gray-500 font-medium">
              {repos.length === 0
                ? "No repositories found. Please refresh or try again later."
                : "No repositories match your search."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredRepos.map((repo) => (
                <li
                  key={repo.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRepo && selectedRepo.id === repo.id
                      ? "bg-indigo-50"
                      : ""
                  }`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div
                        className="truncate cursor-pointer"
                        onClick={() => onRepoSelect(repo)}
                      >
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
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
                          <span className="font-medium text-sm text-gray-900">
                            {repo.name}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          {repo.description || "No description"}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 ml-2">
                        {repo.language && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 mr-2">
                            {repo.language}
                          </span>
                        )}
                        <button
                          onClick={() => handleGenerateReadmeClick(repo)}
                          disabled={isGenerating}
                          className="inline-flex items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isGenerating &&
                          selectedRepo &&
                          selectedRepo.id === repo.id ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                              Generating
                            </span>
                          ) : (
                            "Generate README"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

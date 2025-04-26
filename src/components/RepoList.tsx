import { useState, useEffect } from "react";
import { GitHubRepo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchPublicRepos, fetchUserRepos } from "@/services/github";

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
  const [githubUsername, setGithubUsername] = useState<string>("");

  useEffect(() => {
    // If user is authenticated with GitHub token, fetch their repos
    if (githubToken) {
      loadUserRepos();
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

  const loadPublicRepos = async () => {
    if (!githubUsername.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { repos: publicRepos, error } = await fetchPublicRepos(
        githubUsername
      );

      if (error) throw error;

      setRepos(publicRepos);
    } catch (err) {
      setError(
        "Failed to load repositories. Please check the username and try again."
      );
      console.error("Error fetching public repos:", err);
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

  return (
    <div className="space-y-4">
      {!githubToken && (
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="GitHub Username"
            className="flex-1 p-2.5 border border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm placeholder-gray-400 text-black"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
          />
          <button
            onClick={loadPublicRepos}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-none text-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
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
                Loading
              </span>
            ) : (
              "Load Repos"
            )}
          </button>
        </div>
      )}

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
                ? "No repositories found. Please load repositories first."
                : "No repositories match your search."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {filteredRepos.map((repo) => (
                <li
                  key={repo.id}
                  className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group ${
                    selectedRepo?.id === repo.id
                      ? "bg-indigo-50/80 border-l-4 border-indigo-500"
                      : "border-l-4 border-transparent"
                  }`}
                  onClick={() => onRepoSelect(repo)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {repo.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {repo.language && (
                          <span className="flex items-center text-xs font-medium text-gray-600 px-2 py-0.5 rounded-md bg-gray-100/80">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center text-xs font-medium text-gray-600 px-2 py-0.5 rounded-md bg-gray-100/80">
                          <svg
                            className="w-3 h-3 mr-1 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            ></path>
                          </svg>
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center text-xs font-medium text-gray-600 px-2 py-0.5 rounded-md bg-gray-100/80">
                          <svg
                            className="w-3 h-3 mr-1 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.217.682-.481 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.891 1.529 2.341 1.087 2.91.831.092-.645.35-1.085.636-1.336-2.22-.251-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                          </svg>
                          Fork{repo.forks_count !== 1 ? "s" : ""}:{" "}
                          {repo.forks_count}
                        </span>
                      </div>

                      {selectedRepo?.id === repo.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onGenerateReadme) onGenerateReadme();
                          }}
                          disabled={isGenerating}
                          className="ml-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
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
                              Generating...
                            </span>
                          ) : (
                            "Generate README"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReadmeClick(repo);
                          }}
                          className="ml-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          Select
                        </button>
                      )}
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

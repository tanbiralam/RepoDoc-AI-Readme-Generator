import { useState, useEffect, useCallback } from "react";
import { GitHubRepo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchUserRepos } from "@/services/github";

interface RepoListProps {
  onRepoSelect: (repo: GitHubRepo) => void;
  selectedRepo?: GitHubRepo | null;
}

export default function RepoList({
  onRepoSelect,
  selectedRepo,
}: RepoListProps) {
  const { githubToken } = useAuth();
  const [currentPagedRepos, setCurrentPagedRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const loadUserRepos = useCallback(
    async (pageToLoad: number) => {
      if (!githubToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const { repos: newRepos, error: fetchError } = await fetchUserRepos(
          githubToken,
          pageToLoad,
          itemsPerPage
        );

        if (fetchError) throw fetchError;

        setCurrentPagedRepos(newRepos);
        setHasNextPage(newRepos.length === itemsPerPage);
      } catch (err) {
        setError("Failed to load repositories. Please try again.");
        console.error("Error fetching user repos:", err);
        setCurrentPagedRepos([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    },
    [githubToken, itemsPerPage]
  );

  useEffect(() => {
    loadUserRepos(currentPage);
  }, [githubToken, currentPage, loadUserRepos]);

  const filteredRepos = currentPagedRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.language &&
        repo.language.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadUserRepos(1);
    }
  }, [currentPage, loadUserRepos, searchTerm]);

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (!githubToken) {
    return (
      <div className="p-4 text-center bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-300">
          Connect your GitHub account to see your repositories.
        </p>
        <button
          onClick={() => {
            import("@/services/auth").then(({ connectGitHub }) =>
              connectGitHub()
            );
          }}
          className="mt-4 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition-colors shadow-md shadow-blue-500/20"
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
          className="w-full p-2.5 pl-10 text-gray-200 bg-gray-800/80 border border-gray-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/30 focus:ring-opacity-50 text-sm placeholder-gray-500 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg
          className="absolute left-3 top-3 h-4 w-4 text-gray-500"
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
        <div className="p-3 text-sm font-medium rounded-lg bg-red-900/30 text-red-300 border border-red-800 mb-4 flex items-center">
          <svg
            className="h-4 w-4 text-red-400 mr-2 flex-shrink-0"
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
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-gray-800/60 shadow-lg border border-gray-700">
          {filteredRepos.length === 0 ? (
            <div className="p-6 text-center text-gray-400 font-medium">
              {currentPagedRepos.length === 0
                ? "No repositories found. Please refresh or try again later."
                : "No repositories match your search."}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className={`hover:bg-gray-700/50 transition-colors ${
                      selectedRepo && selectedRepo.id === repo.id
                        ? "bg-blue-900/40 border-l-2 border-blue-400"
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
                              className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0"
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
                            <div>
                              <span className="font-medium text-sm text-gray-100">
                                {repo.name}
                              </span>
                              <p className="text-xs text-gray-400">
                                {repo.full_name}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-400 truncate">
                            {repo.description || "No description"}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 ml-2">
                          {repo.language && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-800">
                              {repo.language}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {(currentPage > 1 || hasNextPage) && (
                <div className="bg-gray-800/80 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-1 border border-gray-700 text-xs font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-400 text-xs">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={!hasNextPage}
                      className="relative inline-flex items-center px-2 py-1 border border-gray-700 text-xs font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Showing{" "}
                        <span className="font-medium">
                          {filteredRepos.length}
                        </span>{" "}
                        repositories on this page
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-700 bg-gray-800 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <span
                          aria-current="page"
                          className="relative inline-flex items-center px-3 py-1 border border-gray-700 bg-gray-800 text-xs font-medium text-blue-300"
                        >
                          {currentPage}
                        </span>
                        <button
                          onClick={goToNextPage}
                          disabled={!hasNextPage}
                          className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-700 bg-gray-800 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { GitHubRepo } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { fetchPublicRepos, fetchUserRepos } from '@/services/github';

interface RepoListProps {
  onRepoSelect: (repo: GitHubRepo) => void;
  selectedRepo?: GitHubRepo | null;
  onGenerateReadme?: () => Promise<void>;
  isGenerating?: boolean;
}

export default function RepoList({ onRepoSelect, selectedRepo, onGenerateReadme, isGenerating = false }: RepoListProps) {
  const { user, githubToken } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [githubUsername, setGithubUsername] = useState<string>('');

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
      setError('Failed to load repositories. Please try again.');
      console.error('Error fetching user repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicRepos = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { repos: publicRepos, error } = await fetchPublicRepos(githubUsername);
      
      if (error) throw error;
      
      setRepos(publicRepos);
    } catch (err) {
      setError('Failed to load repositories. Please check the username and try again.');
      console.error('Error fetching public repos:', err);
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
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">GitHub Repositories</h2>
        
        {!githubToken && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="GitHub Username"
              className="flex-1 p-2.5 border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
            <button 
              onClick={loadPublicRepos}
              className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm transition-colors focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Repos'}
            </button>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder="Search repositories..."
            className="w-full p-2.5 pl-10 border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-500"
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
      </div>

      {error && (
        <div className="p-4 text-sm font-medium rounded-md bg-red-100 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-md">
          {filteredRepos.length === 0 ? (
            <div className="p-6 text-center text-gray-600 font-medium">
              {repos.length === 0 
                ? 'No repositories found. Please load repositories first.' 
                : 'No repositories match your search.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRepos.map((repo) => (
                <li
                  key={repo.id}
                  className={`p-5 hover:bg-gray-50 transition-colors ${selectedRepo?.id === repo.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg text-gray-900">{repo.name}</h3>
                          {repo.private && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1.5 font-medium">
                          {repo.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <span className="flex items-center text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-md text-gray-800 border border-gray-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-md text-gray-800 border border-gray-200">
                          <svg
                            className="w-4 h-4 mr-1.5 text-amber-500"
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
                        <span className="flex items-center text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-md text-gray-800 border border-gray-200">
                          <svg
                            className="w-4 h-4 mr-1.5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 10.2C5 5.22 9.2 2 12 2c3.36 0 5.97 2.33 6.8 5M3 19a5 5 0 015-5c2.67 0 4.33 1.43 5 4 .67-2.57 2.33-4 5-4a5 5 0 015 5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            ></path>
                          </svg>
                          {repo.forks_count}
                        </span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => onRepoSelect(repo)}
                          className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors text-sm font-semibold shadow-sm border border-gray-300"
                        >
                          Select
                        </button>
                        <button 
                          onClick={() => handleGenerateReadmeClick(repo)}
                          disabled={isGenerating}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-semibold inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border border-blue-700"
                        >
                          {isGenerating && selectedRepo?.id === repo.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-white border-t-transparent"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              Generate README
                            </>
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
      
      {selectedRepo && onGenerateReadme && (
        <div className="sticky bottom-4 left-0 right-0 mt-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-blue-800">Selected: <span className="font-bold">{selectedRepo.name}</span></span>
            </div>
            <button
              id="generate-readme-btn"
              onClick={onGenerateReadme}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border border-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 mr-2 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                'Generate README'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

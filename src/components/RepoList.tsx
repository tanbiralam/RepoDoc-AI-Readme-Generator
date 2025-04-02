import { useState, useEffect } from 'react';
import { GitHubRepo } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { fetchPublicRepos, fetchUserRepos } from '@/services/github';

interface RepoListProps {
  onRepoSelect: (repo: GitHubRepo) => void;
  selectedRepo?: GitHubRepo | null;
}

export default function RepoList({ onRepoSelect, selectedRepo }: RepoListProps) {
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

  // Filter repos based on search term
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold">GitHub Repositories</h2>
        
        {!githubToken && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="GitHub Username"
              className="flex-1 p-2 border rounded-md"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
            <button 
              onClick={loadPublicRepos}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
            className="w-full p-2 pl-10 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
        <div className="p-3 text-sm rounded-md bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          {filteredRepos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {repos.length === 0 
                ? 'No repositories found. Please load repositories first.' 
                : 'No repositories match your search.'}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredRepos.map((repo) => (
                <li
                  key={repo.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedRepo?.id === repo.id ? 'bg-blue-50' : ''}`}
                  onClick={() => onRepoSelect(repo)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{repo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{repo.description || 'No description'}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        {repo.language && (
                          <span className="flex items-center text-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center text-xs">
                          <svg
                            className="w-4 h-4 mr-1"
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
                        <span className="flex items-center text-xs">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-11l3 3-3 3m0-6h6"
                            ></path>
                          </svg>
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>
                    {repo.private && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Private
                      </span>
                    )}
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

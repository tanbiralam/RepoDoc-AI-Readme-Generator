"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GitHubRepo, ReadmeGenerationResult } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { generateReadmeWithAI, generateBasicReadmeTemplate } from '@/services/readmeGenerator';
import { getPackageJson, getReadmeContent } from '@/services/github';
import { incrementReadmeGeneration } from '@/services/stripe';
import RepoList from '@/components/RepoList';
import ReadmeEditor from '@/components/ReadmeEditor';
import ExportButtons from '@/components/ExportButtons';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, githubToken } = useAuth();
  const { plan, canGenerateReadme, readmeGenerationsRemaining, refreshSubscription } = useSubscription();
  
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeResult, setReadmeResult] = useState<ReadmeGenerationResult | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [generatingReadme, setGeneratingReadme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setReadmeResult(null);
    setReadmeContent('');
    setError(null);
  };

  const handleGenerateReadme = async () => {
    if (!selectedRepo || !user) return;
    if (!canGenerateReadme()) {
      setError(`You've reached your limit of ${plan.readme_generations_limit} README generations for your ${plan.name} plan. Please upgrade to generate more READMEs.`);
      return;
    }

    try {
      setGeneratingReadme(true);
      setError(null);

      // Extract owner and repo name
      const [owner, repo] = selectedRepo.full_name.split('/');

      // Get package.json content if available
      const { content: packageJsonContent } = await getPackageJson(
        owner, 
        repo, 
        githubToken || undefined
      );

      // Get current README.md content if available
      const { content: currentReadmeContent } = await getReadmeContent(
        owner, 
        repo, 
        githubToken || undefined
      );

      // Generate README using AI
      const { result, error } = await generateReadmeWithAI({
        repoName: selectedRepo.name,
        repoDescription: selectedRepo.description || undefined,
        repoLanguage: selectedRepo.language || undefined,
        packageJson: packageJsonContent || undefined,
        currentReadme: currentReadmeContent || undefined,
      });

      if (error) throw error;

      if (result) {
        setReadmeResult(result);
        setReadmeContent(result.content);
        
        // Increment README generation count
        await incrementReadmeGeneration(user.id);
        // Refresh subscription info
        await refreshSubscription();
      } else {
        // Fallback to basic template
        const basicTemplate = generateBasicReadmeTemplate(
          selectedRepo.name,
          selectedRepo.description || undefined,
          selectedRepo.language || undefined
        );
        setReadmeResult(basicTemplate);
        setReadmeContent(basicTemplate.content);
      }
    } catch (err) {
      setError('Failed to generate README. Please try again.');
      console.error('Error generating README:', err);
    } finally {
      setGeneratingReadme(false);
    }
  };

  const handleReadmeContentChange = (content: string) => {
    setReadmeContent(content);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">GitHub README Generator</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="block text-gray-700">Hello, {user.email}</span>
                <span className="block text-gray-500">
                  {plan.name} Plan ({readmeGenerationsRemaining} generations left)
                </span>
              </div>
              <button
                onClick={() => router.push('/subscription')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {plan.name === 'Free' ? 'Upgrade' : 'Manage Subscription'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Repository</h2>
              <RepoList onRepoSelect={handleRepoSelect} selectedRepo={selectedRepo} />
              {selectedRepo && (
                <div className="mt-6">
                  <button
                    onClick={handleGenerateReadme}
                    disabled={generatingReadme}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generatingReadme ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating README...
                      </>
                    ) : (
                      <>Generate README</>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will use 1 of your {readmeGenerationsRemaining} remaining generations
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600">
                {error}
              </div>
            )}

            {readmeContent ? (
              <div className="space-y-6">
                <ReadmeEditor
                  readmeContent={readmeContent}
                  onChange={handleReadmeContentChange}
                  sections={readmeResult?.sections}
                />
                <ExportButtons
                  readmeContent={readmeContent}
                  selectedRepo={selectedRepo}
                />
              </div>
            ) : selectedRepo ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No README Generated</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click the "Generate README" button to create a README for this repository.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 0l-8 4-8-4"
                  ></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Repository Selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a repository from the list to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

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

// Create a utility to help log with timestamps
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, ...data };
  console.log(`[${timestamp}] ${message}`, data || '');
  
  // You can also store logs in localStorage for persistence
  const logs = JSON.parse(localStorage.getItem('readme_generation_logs') || '[]');
  logs.push(logEntry);
  localStorage.setItem('readme_generation_logs', JSON.stringify(logs));
};

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
    logWithTime(`Repository selected: ${repo.name}`, { repoId: repo.id, repoFullName: repo.full_name });
    setSelectedRepo(repo);
    setReadmeResult(null);
    setReadmeContent('');
    setError(null);
  };

  const handleGenerateReadme = async () => {
    if (!selectedRepo || !user) {
      logWithTime('Cannot generate README: No repository selected or user not logged in', { 
        hasSelectedRepo: !!selectedRepo, 
        isUserLoggedIn: !!user 
      });
      return;
    }
    
    if (!canGenerateReadme()) {
      const errorMessage = `You've reached your limit of ${plan.readme_generations_limit} README generations for your ${plan.name} plan. Please upgrade to generate more READMEs.`;
      logWithTime('Cannot generate README: Generation limit reached', { 
        plan: plan.name, 
        limit: plan.readme_generations_limit,
        remaining: readmeGenerationsRemaining
      });
      setError(errorMessage);
      return;
    }

    try {
      logWithTime('Starting README generation process', { 
        repoName: selectedRepo.name, 
        repoId: selectedRepo.id,
        repoFullName: selectedRepo.full_name
      });
      
      setGeneratingReadme(true);
      setError(null);

      // Extract owner and repo name
      const [owner, repo] = selectedRepo.full_name.split('/');
      logWithTime('Extracted repository info', { owner, repo });

      // Get package.json content if available
      logWithTime('Fetching package.json content');
      const { content: packageJsonContent } = await getPackageJson(
        owner, 
        repo, 
        githubToken || undefined
      );
      
      logWithTime('Package.json fetch result', { 
        hasPackageJson: !!packageJsonContent,
        packageJsonLength: packageJsonContent ? packageJsonContent.length : 0 
      });

      // Get current README.md content if available
      logWithTime('Fetching current README.md content');
      const { content: currentReadmeContent } = await getReadmeContent(
        owner, 
        repo, 
        githubToken || undefined
      );
      
      logWithTime('Current README.md fetch result', { 
        hasReadme: !!currentReadmeContent,
        readmeLength: currentReadmeContent ? currentReadmeContent.length : 0 
      });

      // Generate README using AI
      logWithTime('Sending data to AI for README generation', {
        repoName: selectedRepo.name,
        hasDescription: !!selectedRepo.description,
        hasLanguage: !!selectedRepo.language,
        hasPackageJson: !!packageJsonContent,
        hasCurrentReadme: !!currentReadmeContent
      });
      
      const { result, error } = await generateReadmeWithAI({
        repoName: selectedRepo.name,
        repoDescription: selectedRepo.description || undefined,
        repoLanguage: selectedRepo.language || undefined,
        packageJson: packageJsonContent || undefined,
        currentReadme: currentReadmeContent || undefined,
      });

      if (error) {
        logWithTime('Error during AI README generation', { error: error.message });
        throw error;
      }

      if (result) {
        logWithTime('Successfully received AI generated README', { 
          contentLength: result.content.length,
          sectionCount: result.sections?.length || 0 
        });
        
        setReadmeResult(result);
        setReadmeContent(result.content);
        
        // Increment README generation count
        logWithTime('Incrementing README generation count');
        await incrementReadmeGeneration(user.id);
        
        // Refresh subscription info
        logWithTime('Refreshing subscription information');
        await refreshSubscription();
        
        logWithTime('README generation process completed successfully');
      } else {
        logWithTime('AI generation returned no result, falling back to basic template');
        // Fallback to basic template
        const basicTemplate = generateBasicReadmeTemplate(
          selectedRepo.name,
          selectedRepo.description || undefined,
          selectedRepo.language || undefined
        );
        logWithTime('Generated basic template fallback', { contentLength: basicTemplate.content.length });
        
        setReadmeResult(basicTemplate);
        setReadmeContent(basicTemplate.content);
      }
    } catch (err) {
      const errorMessage = 'Failed to generate README. Please try again.';
      logWithTime('Error in README generation process', { 
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined 
      });
      
      setError(errorMessage);
      console.error('Error generating README:', err);
    } finally {
      logWithTime('README generation process finished', { success: !error });
      setGeneratingReadme(false);
    }
  };

  const handleReadmeContentChange = (content: string) => {
    setReadmeContent(content);
    logWithTime('README content edited by user', { newLength: content.length });
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
              <RepoList 
                onRepoSelect={handleRepoSelect} 
                selectedRepo={selectedRepo} 
                onGenerateReadme={handleGenerateReadme}
                isGenerating={generatingReadme}
              />
              
              {/* Add a button to view logs */}
              {selectedRepo && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const logs = JSON.parse(localStorage.getItem('readme_generation_logs') || '[]');
                      console.log('README Generation Logs:', logs);
                      alert('Logs printed to console. Press F12 to view them.');
                    }}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    View Debug Logs in Console (F12)
                  </button>
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

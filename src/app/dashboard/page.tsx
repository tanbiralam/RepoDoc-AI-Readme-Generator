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
      
      // Try generating the README with AI first
      try {
        const { result, error: aiError } = await generateReadmeWithAI({
          repoName: selectedRepo.name,
          repoDescription: selectedRepo.description || '',
          repoLanguage: selectedRepo.language || '',
          packageJson: packageJsonContent || '',
          currentReadme: currentReadmeContent || '',
          topics: selectedRepo.topics || [],
          isPrivate: selectedRepo.private || false
        });
        
        if (aiError) throw aiError;
        
        if (result) {
          logWithTime('README generated successfully using AI', { 
            contentLength: result.content.length,
            sectionCount: result.sections?.length || 0
          });
          
          setReadmeResult(result);
          setReadmeContent(result.content);
          
          // Increment the readme generation count
          if (user) {
            logWithTime('Incrementing README generation count');
            await incrementReadmeGeneration(user.id);
            refreshSubscription();
            logWithTime('README generation count incremented');
          }
        } else {
          throw new Error('AI generation returned no result');
        }
      } catch (aiError) {
        logWithTime('Error generating README with AI. Using fallback template.', { error: aiError });
        console.error('Error generating README with AI:', aiError);
        
        // Fallback to basic template if AI generation fails
        const basicResult = generateBasicReadmeTemplate(
          selectedRepo.name,
          selectedRepo.description || '',
          selectedRepo.language || ''
        );
        
        logWithTime('Basic fallback template generated', { 
          contentLength: basicResult.content.length,
          sectionCount: basicResult.sections?.length || 0
        });
        
        setReadmeResult(basicResult);
        setReadmeContent(basicResult.content);
        
        // Still increment the generation count for the fallback
        if (user) {
          logWithTime('Incrementing README generation count for fallback generation');
          await incrementReadmeGeneration(user.id);
          refreshSubscription();
          logWithTime('README generation count incremented for fallback');
        }
      }

    } catch (error) {
      logWithTime('Error in README generation process', { error });
      console.error('Error generating README:', error);
      setError('Failed to generate README. Please try again.');
    } finally {
      setGeneratingReadme(false);
    }
  };

  const handleReadmeContentChange = (content: string) => {
    setReadmeContent(content);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">GitHub README Generator</h1>
          
          {user && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <span className="block text-gray-800 font-medium">{user.email}</span>
                  <span className="block text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {plan.name} Plan
                    </span>
                    <span className="ml-2 text-gray-500">
                      {readmeGenerationsRemaining} generations remaining
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push('/subscription')}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow-sm transition-colors"
              >
                {plan.name === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Repository</h2>
              <RepoList 
                onRepoSelect={handleRepoSelect} 
                selectedRepo={selectedRepo} 
                onGenerateReadme={handleGenerateReadme}
                isGenerating={generatingReadme}
              />
              
              {/* Add a button to view logs */}
              {selectedRepo && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const logs = JSON.parse(localStorage.getItem('readme_generation_logs') || '[]');
                      console.log('README Generation Logs:', logs);
                      alert('Logs printed to console. Press F12 to view them.');
                    }}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 py-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    View Debug Logs (F12)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border-2 border-red-200 text-red-700 font-medium">
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
              <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
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
                <h3 className="mt-4 text-lg font-bold text-gray-800">No README Generated</h3>
                <p className="mt-2 text-gray-600">
                  Click the "Generate README" button to create a README for this repository.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
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
                <h3 className="mt-4 text-lg font-bold text-gray-800">Select a Repository</h3>
                <p className="mt-2 text-gray-600">
                  Choose a repository from the list to generate a README file.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            {new Date().getFullYear()} GitHub README Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

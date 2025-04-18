"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepo, ReadmeGenerationResult } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  generateReadmeWithAI,
  generateBasicReadmeTemplate,
} from "@/services/readmeGenerator";
import { getPackageJson, getReadmeContent } from "@/services/github";
import { incrementReadmeGeneration } from "@/services/stripe";
import RepoList from "@/components/RepoList";
import ReadmeEditor from "@/components/ReadmeEditor";
import ExportButtons from "@/components/ExportButtons";

// Create a utility to help log with timestamps
const logWithTime = (message: string, data?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, ...data };
  console.log(`[${timestamp}] ${message}`, data || "");

  // You can also store logs in localStorage for persistence
  const logs = JSON.parse(
    localStorage.getItem("readme_generation_logs") || "[]"
  );
  logs.push(logEntry);
  localStorage.setItem("readme_generation_logs", JSON.stringify(logs));
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, githubToken } = useAuth();
  const {
    plan,
    canGenerateReadme,
    readmeGenerationsRemaining,
    refreshSubscription,
  } = useSubscription();

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeResult, setReadmeResult] =
    useState<ReadmeGenerationResult | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [generatingReadme, setGeneratingReadme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Add global styles for animations
  useEffect(() => {
    // Add animation styles to the document
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
    `;
    document.head.appendChild(styleEl);

    // Cleanup function to remove the style element
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleRepoSelect = (repo: GitHubRepo) => {
    logWithTime(`Repository selected: ${repo.name}`, {
      repoId: repo.id,
      repoFullName: repo.full_name,
    });
    setSelectedRepo(repo);
    setReadmeResult(null);
    setReadmeContent("");
    setError(null);
  };

  const handleGenerateReadme = async () => {
    if (!selectedRepo || !user) {
      logWithTime(
        "Cannot generate README: No repository selected or user not logged in",
        {
          hasSelectedRepo: !!selectedRepo,
          isUserLoggedIn: !!user,
        }
      );
      return;
    }

    if (!canGenerateReadme()) {
      const errorMessage = `You've reached your limit of ${plan.readme_generations_limit} README generations for your ${plan.name} plan. Please upgrade to generate more READMEs.`;
      logWithTime("Cannot generate README: Generation limit reached", {
        plan: plan.name,
        limit: plan.readme_generations_limit,
        remaining: readmeGenerationsRemaining,
      });
      setError(errorMessage);
      return;
    }

    try {
      logWithTime("Starting README generation process", {
        repoName: selectedRepo.name,
        repoId: selectedRepo.id,
        repoFullName: selectedRepo.full_name,
      });

      setGeneratingReadme(true);
      setError(null);

      // Extract owner and repo name
      const [owner, repo] = selectedRepo.full_name.split("/");
      logWithTime("Extracted repository info", { owner, repo });

      // Get package.json content if available
      logWithTime("Fetching package.json content");
      const { content: packageJsonContent } = await getPackageJson(
        owner,
        repo,
        githubToken || undefined
      );

      logWithTime("Package.json fetch result", {
        hasPackageJson: !!packageJsonContent,
        packageJsonLength: packageJsonContent ? packageJsonContent.length : 0,
      });

      // Get current README.md content if available
      logWithTime("Fetching current README.md content");
      const { content: currentReadmeContent } = await getReadmeContent(
        owner,
        repo,
        githubToken || undefined
      );

      logWithTime("Current README.md fetch result", {
        hasReadme: !!currentReadmeContent,
        readmeLength: currentReadmeContent ? currentReadmeContent.length : 0,
      });

      // Generate README using AI
      logWithTime("Sending data to AI for README generation", {
        repoName: selectedRepo.name,
        hasDescription: !!selectedRepo.description,
        hasLanguage: !!selectedRepo.language,
        hasPackageJson: !!packageJsonContent,
        hasCurrentReadme: !!currentReadmeContent,
      });

      // Try generating the README with AI first
      try {
        const { result, error: aiError } = await generateReadmeWithAI({
          repoName: selectedRepo.name,
          repoDescription: selectedRepo.description || "",
          repoLanguage: selectedRepo.language || "",
          packageJson: packageJsonContent || "",
          currentReadme: currentReadmeContent || "",
          topics: selectedRepo.topics || [],
          isPrivate: selectedRepo.private || false,
        });

        if (aiError) throw aiError;

        if (result) {
          logWithTime("README generated successfully using AI", {
            contentLength: result.content.length,
            sectionCount: result.sections?.length || 0,
          });

          setReadmeResult(result);
          setReadmeContent(result.content);

          // Increment the readme generation count
          if (user) {
            logWithTime("Incrementing README generation count");
            await incrementReadmeGeneration(user.id);
            refreshSubscription();
            logWithTime("README generation count incremented");
          }
        } else {
          throw new Error("AI generation returned no result");
        }
      } catch (aiError) {
        logWithTime(
          "Error generating README with AI. Using fallback template.",
          { error: aiError }
        );
        console.error("Error generating README with AI:", aiError);

        // Fallback to basic template if AI generation fails
        const basicResult = generateBasicReadmeTemplate(
          selectedRepo.name,
          selectedRepo.description || "",
          selectedRepo.language || ""
        );

        logWithTime("Basic fallback template generated", {
          contentLength: basicResult.content.length,
          sectionCount: basicResult.sections?.length || 0,
        });

        setReadmeResult(basicResult);
        setReadmeContent(basicResult.content);

        // Still increment the generation count for the fallback
        if (user) {
          logWithTime(
            "Incrementing README generation count for fallback generation"
          );
          await incrementReadmeGeneration(user.id);
          refreshSubscription();
          logWithTime("README generation count incremented for fallback");
        }
      }
    } catch (error) {
      logWithTime("Error in README generation process", { error });
      console.error("Error generating README:", error);
      setError("Failed to generate README. Please try again.");
    } finally {
      setGeneratingReadme(false);
    }
  };

  const handleReadmeContentChange = (content: string) => {
    setReadmeContent(content);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern top navigation bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">
                GitHub README Generator
              </h1>
            </div>

            {user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push("/subscription")}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 font-medium"
                >
                  {plan.name === "Free"
                    ? "Upgrade Plan"
                    : "Manage Subscription"}
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="text-right text-sm">
                    <span className="block text-gray-700 font-medium">
                      {user.email}
                    </span>
                    <div className="flex items-center mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {plan.name} Plan
                      </span>
                      <span className="ml-2 text-gray-500 text-xs">
                        {readmeGenerationsRemaining} generations left
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-medium shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Subtle intro section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to your dashboard
          </h2>
          <p className="text-gray-600">
            Generate professional READMEs for your repositories in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium animate-fadeIn">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repository selection panel with glassmorphism effect */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 transition-all duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-500"
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
                Repositories
              </h2>

              <RepoList
                onRepoSelect={handleRepoSelect}
                selectedRepo={selectedRepo}
                onGenerateReadme={handleGenerateReadme}
                isGenerating={generatingReadme}
              />

              {/* Debug logs toggle with improved design */}
              {selectedRepo && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={toggleLogs}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    {showLogs ? "Hide Debug Logs" : "View Debug Logs"}
                  </button>

                  {showLogs && (
                    <div className="mt-3 text-xs bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
                      {JSON.parse(
                        localStorage.getItem("readme_generation_logs") || "[]"
                      )
                        .filter(
                          (log: Record<string, unknown>) =>
                            typeof log.message === "string" &&
                            log.message.includes(selectedRepo.name)
                        )
                        .slice(-5)
                        .map((log: Record<string, unknown>, index: number) => (
                          <div
                            key={index}
                            className="mb-2 pb-2 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                          >
                            <div className="text-gray-400">
                              {new Date(
                                log.timestamp as string
                              ).toLocaleTimeString()}
                            </div>
                            <div className="text-gray-700">
                              {log.message as string}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main content area with the README editor */}
          <div className="lg:col-span-2">
            {readmeContent ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/80">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-indigo-500"
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
                      README.md for {selectedRepo?.name}
                    </h3>
                  </div>
                  <ReadmeEditor
                    readmeContent={readmeContent}
                    onChange={handleReadmeContentChange}
                    sections={readmeResult?.sections}
                  />
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      ></path>
                    </svg>
                    Export Options
                  </h3>
                  <ExportButtons
                    readmeContent={readmeContent}
                    selectedRepo={selectedRepo}
                  />
                </div>
              </div>
            ) : selectedRepo ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
                {generatingReadme ? (
                  <div className="py-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <h3 className="mt-6 text-lg font-medium text-gray-900">
                      Generating README...
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Please wait while we analyze your repository and generate
                      a README file.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-24 w-24 text-indigo-400 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                      <svg
                        className="h-12 w-12"
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
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">
                      Ready to Generate README
                    </h3>
                    <p className="mt-2 text-gray-600 max-w-md mx-auto">
                      Click the "Generate README" button in the repository panel
                      to create a README for {selectedRepo.name}.
                    </p>
                    <button
                      onClick={handleGenerateReadme}
                      disabled={generatingReadme}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate README
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-16 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
                <div className="mx-auto h-24 w-24 text-indigo-400 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <svg
                    className="h-12 w-12"
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
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  Select a Repository
                </h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Choose a repository from the list to get started with
                  generating a professional README.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} GitHub README Generator. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

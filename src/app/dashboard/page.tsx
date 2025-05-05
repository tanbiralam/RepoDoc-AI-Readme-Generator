"use client";

import { useState, useEffect } from "react";
import { GitHubRepo, ReadmeGenerationResult } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  generateReadmeWithAI,
  generateBasicReadmeTemplate,
} from "@/services/readmeGenerator";
import { getPackageJson, getReadmeContent } from "@/services/github";
import { incrementReadmeGeneration } from "@/services/stripe";
import { useToast } from "@/context/ToastContext";
import {
  DashboardHeader,
  ErrorMessage,
  RepositoryPanel,
  MainContentPanel,
  DashboardFooter,
} from "@/components/dashboard";

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
  const { user, githubToken, hasGithubConnection } = useAuth();
  const {
    plan,
    canGenerateReadme,
    readmeGenerationsRemaining,
    refreshSubscription,
  } = useSubscription();
  const { showToast } = useToast();

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeResult, setReadmeResult] =
    useState<ReadmeGenerationResult | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [generatingReadme, setGeneratingReadme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Check URL for GitHub connection status
  useEffect(() => {
    const url = new URL(window.location.href);
    const githubConnectionParam = url.searchParams.get("github_connection");
    const directGitHubLogin = url.searchParams.get("direct_github_login");

    if (githubConnectionParam === "success") {
      showToast("GitHub successfully connected!", "success");
      // Clean up URL parameters
      url.searchParams.delete("github_connection");
      window.history.replaceState({}, document.title, url.toString());
    }

    if (directGitHubLogin === "true") {
      showToast("Successfully signed in with GitHub!", "success");
      // Clean up URL parameters
      url.searchParams.delete("direct_github_login");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [showToast]);

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

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro section */}
        <DashboardHeader user={user} />

        {/* Error message */}
        <ErrorMessage message={error} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repository selection panel */}
          <RepositoryPanel
            hasGithubConnection={hasGithubConnection}
            selectedRepo={selectedRepo}
            showLogs={showLogs}
            generatingReadme={generatingReadme}
            onRepoSelect={handleRepoSelect}
            onGenerateReadme={handleGenerateReadme}
            onToggleLogs={toggleLogs}
          />

          {/* Main content area */}
          <MainContentPanel
            hasGithubConnection={hasGithubConnection}
            readmeContent={readmeContent}
            selectedRepo={selectedRepo}
            generatingReadme={generatingReadme}
            readmeSections={readmeResult?.sections}
            onReadmeContentChange={handleReadmeContentChange}
            onGenerateReadme={handleGenerateReadme}
          />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

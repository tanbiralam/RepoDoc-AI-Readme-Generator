import { useState } from "react";
import { GitHubRepo, ReadmeGenerationResult } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  generateReadmeWithAI,
  generateBasicReadmeTemplate,
} from "@/services/readmeGenerator";
import { getPackageJson, getReadmeContent } from "@/services/github";
import { incrementReadmeGeneration } from "@/services/stripe";
import { logWithTime } from "@/utils/logging";
import { useToast } from "@/context/ToastContext";

/**
 * Custom hook for handling README generation functionality
 */
export const useReadmeGenerator = () => {
  const { user, githubToken } = useAuth();
  const {
    plan,
    canGenerateReadme,
    readmeGenerationsRemaining,
    refreshSubscription,
  } = useSubscription();
  const { showSuccess, showError, showWarning, showLoading, hideToast } =
    useToast();

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeResult, setReadmeResult] =
    useState<ReadmeGenerationResult | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [generatingReadme, setGeneratingReadme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle repository selection
   */
  const handleRepoSelect = (repo: GitHubRepo) => {
    logWithTime(`Repository selected: ${repo.name}`, {
      message: `Repository selected: ${repo.name}`,
      data: {
        repoId: repo.id,
        repoFullName: repo.full_name,
      },
    });
    setSelectedRepo(repo);
    setReadmeResult(null);
    setReadmeContent("");
    setError(null);
  };

  /**
   * Handle README content change
   */
  const handleReadmeContentChange = (content: string) => {
    setReadmeContent(content);
  };

  /**
   * Generate a README for the selected repository
   */
  const handleGenerateReadme = async () => {
    if (!selectedRepo || !user) {
      logWithTime(
        "Cannot generate README: No repository selected or user not logged in",
        {
          message:
            "Cannot generate README: No repository selected or user not logged in",
          data: {
            hasSelectedRepo: !!selectedRepo,
            isUserLoggedIn: !!user,
          },
        }
      );
      return;
    }

    let loadingToastId = "";

    if (!canGenerateReadme()) {
      const errorMessage =
        "Due to temporary testing constraints, all users are limited to 3 total README generations, regardless of subscription tier.";
      logWithTime("Cannot generate README: Global generation limit reached", {
        message: "Cannot generate README: Global generation limit reached",
        data: {
          plan: plan.name,
          limit: plan.readme_generations_limit,
          remaining: readmeGenerationsRemaining,
        },
      });
      setError(errorMessage);
      showWarning(errorMessage);
      return;
    }

    try {
      logWithTime("Starting README generation process", {
        message: "Starting README generation process",
        data: {
          repoName: selectedRepo.name,
          repoId: selectedRepo.id,
          repoFullName: selectedRepo.full_name,
        },
      });

      loadingToastId = showLoading("Generating README...");
      setGeneratingReadme(true);
      setError(null);

      // Extract owner and repo name
      const [owner, repo] = selectedRepo.full_name.split("/");
      logWithTime("Extracted repository info", {
        message: "Extracted repository info",
        data: { owner, repo },
      });

      // Get package.json content if available
      logWithTime("Fetching package.json content", {
        message: "Fetching package.json content",
      });
      const { content: packageJsonContent } = await getPackageJson(
        owner,
        repo,
        githubToken || undefined
      );

      logWithTime("Package.json fetch result", {
        message: "Package.json fetch result",
        data: {
          hasPackageJson: !!packageJsonContent,
          packageJsonLength: packageJsonContent ? packageJsonContent.length : 0,
        },
      });

      // Get current README.md content if available
      logWithTime("Fetching current README.md content", {
        message: "Fetching current README.md content",
      });
      const { content: currentReadmeContent } = await getReadmeContent(
        owner,
        repo,
        githubToken || undefined
      );

      logWithTime("Current README.md fetch result", {
        message: "Current README.md fetch result",
        data: {
          hasReadme: !!currentReadmeContent,
          readmeLength: currentReadmeContent ? currentReadmeContent.length : 0,
        },
      });

      // Generate README using AI
      logWithTime("Sending data to AI for README generation", {
        message: "Sending data to AI for README generation",
        data: {
          repoName: selectedRepo.name,
          hasDescription: !!selectedRepo.description,
          hasLanguage: !!selectedRepo.language,
          hasPackageJson: !!packageJsonContent,
          hasCurrentReadme: !!currentReadmeContent,
        },
      });

      // Try generating the README with AI first
      try {
        const { result, error: aiError } = await generateReadmeWithAI({
          repoName: selectedRepo.name,
          repoOwner: owner,
          repoUrl: selectedRepo.html_url,
          repoDescription: selectedRepo.description || "",
          repoLanguage: selectedRepo.language || "",
          packageJson: packageJsonContent || "",
          currentReadme: currentReadmeContent || "",
          topics: selectedRepo.topics || [],
          isPrivate: selectedRepo.private || false,
        });

        if (aiError) {
          // Check if this is a rate limit error
          if (aiError.message.includes("Rate limit")) {
            hideToast(loadingToastId);
            showWarning(aiError.message);
            setError(aiError.message);
            return;
          }

          // For other errors, fall back to basic template
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
            const { success } = await incrementReadmeGeneration(user.id);
            if (success) {
              await refreshSubscription();
              logWithTime(
                "README generation count incremented and subscription refreshed"
              );
            } else {
              console.error("Failed to increment README generation count");
            }
          }
        } else if (result) {
          hideToast(loadingToastId);
          showSuccess("README generated successfully!");
          setReadmeResult(result);
          setReadmeContent(result.content);

          // Increment generation count on success
          if (user) {
            logWithTime("Incrementing README generation count");
            const { success } = await incrementReadmeGeneration(user.id);
            if (success) {
              await refreshSubscription();
              logWithTime(
                "README generation count incremented and subscription refreshed"
              );
            } else {
              console.error("Failed to increment README generation count");
            }
          }
        }
      } catch (aiError) {
        logWithTime(
          "Error generating README with AI. Using fallback template.",
          {
            message:
              "Error generating README with AI. Using fallback template.",
            data: {
              errorDetails: aiError,
            },
          }
        );
        console.error("Error generating README with AI:", aiError);

        // Hide the loading toast and show warning
        hideToast(loadingToastId);
        showWarning("AI generation failed. Using a basic template instead.");

        // Fallback to basic template if AI generation fails
        const basicResult = generateBasicReadmeTemplate(
          selectedRepo.name,
          selectedRepo.description || "",
          selectedRepo.language || ""
        );

        logWithTime("Basic fallback template generated", {
          message: "Basic fallback template generated",
          data: {
            contentLength: basicResult.content.length,
            sectionCount: basicResult.sections?.length || 0,
          },
        });

        setReadmeResult(basicResult);
        setReadmeContent(basicResult.content);

        // Still increment the generation count for the fallback
        if (user) {
          logWithTime(
            "Incrementing README generation count for fallback generation",
            {
              message:
                "Incrementing README generation count for fallback generation",
            }
          );
          const { success } = await incrementReadmeGeneration(user.id);
          if (success) {
            await refreshSubscription();
            logWithTime(
              "README generation count incremented and subscription refreshed for fallback",
              {
                message:
                  "README generation count incremented and subscription refreshed for fallback",
              }
            );
          } else {
            console.error(
              "Failed to increment README generation count for fallback"
            );
          }
        }
      }
    } catch (error) {
      logWithTime("Error in README generation process", {
        message: "Error in README generation process",
        data: {
          errorDetails: error,
        },
      });
      console.error("Error generating README:", error);

      // Hide the loading toast and show error
      hideToast(loadingToastId);
      showError("Failed to generate README. Please try again.");

      setError("Failed to generate README. Please try again.");
    } finally {
      setGeneratingReadme(false);
    }
  };

  return {
    selectedRepo,
    readmeResult,
    readmeContent,
    generatingReadme,
    error,
    handleRepoSelect,
    handleReadmeContentChange,
    handleGenerateReadme,
    setError,
  };
};

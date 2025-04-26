import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Custom hook for managing GitHub connection UI state
 */
export const useGitHubConnection = () => {
  const { hasGithubConnection } = useAuth();
  const [showGitHubPrompt, setShowGitHubPrompt] = useState<boolean>(true);

  /**
   * Handle dismissing the GitHub connection prompt
   */
  const handleDismissGitHubPrompt = () => {
    setShowGitHubPrompt(false);
  };

  /**
   * Show the GitHub connection prompt
   */
  const showGitHubConnectionPrompt = () => {
    setShowGitHubPrompt(true);
  };

  /**
   * Connect to GitHub
   */
  const connectToGitHub = async () => {
    const { connectGitHub } = await import("@/services/auth");
    connectGitHub();
  };

  return {
    hasGithubConnection,
    showGitHubPrompt,
    handleDismissGitHubPrompt,
    showGitHubConnectionPrompt,
    connectToGitHub,
  };
};

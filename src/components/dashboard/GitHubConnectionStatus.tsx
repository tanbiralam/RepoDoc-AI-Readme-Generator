"use client";

import { useAuth } from "@/context/AuthContext";
import { connectGitHub } from "@/services/auth";
import { Loader2, Github, UnplugIcon, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function GitHubConnectionStatus() {
  const { hasGithubConnection, githubToken, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectGitHub();
    } catch (error) {
      console.error("Error connecting GitHub:", error);
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/github/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect GitHub");
      }

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
    }
    setIsLoading(false);
  };

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      await connectGitHub();
    } catch (error) {
      console.error("Error reconnecting GitHub:", error);
    }
    setIsLoading(false);
  };

  if (hasGithubConnection) {
    const needsReconnect = !githubToken;

    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-3">
          <Github
            className={`w-5 h-5 ${
              needsReconnect ? "text-yellow-400" : "text-green-400"
            }`}
          />
          <div>
            <p className="text-sm font-medium text-gray-200">
              GitHub {needsReconnect ? "Connection Issue" : "Connected"}
            </p>
            <p className="text-xs text-gray-400">
              {needsReconnect
                ? "Token expired - needs reconnection"
                : "Access token active"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {needsReconnect && (
            <button
              onClick={handleReconnect}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Reconnect</span>
            </button>
          )}
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UnplugIcon className="w-4 h-4" />
            )}
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-3">
        <Github className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-200">
            GitHub Not Connected
          </p>
          <p className="text-xs text-gray-400">
            Connect to access your repositories
          </p>
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Github className="w-4 h-4" />
        )}
        <span>Connect</span>
      </button>
    </div>
  );
}

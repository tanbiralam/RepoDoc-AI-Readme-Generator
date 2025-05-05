import React from "react";
import { useAuth } from "@/context/AuthContext";
import { connectGitHub } from "@/services/auth";
import { Github } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/context/ToastContext";

interface GitHubConnectionPromptProps {
  onDismiss?: () => void;
  onConnect?: () => void;
  forceShow?: boolean; // Added to allow forcing display for reconnection
}

export default function GitHubConnectionPrompt({
  onDismiss,
  onConnect,
  forceShow = false,
}: GitHubConnectionPromptProps) {
  const { user, githubToken, hasGithubConnection, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = React.useState(false);
  const [connectionRetried, setConnectionRetried] = React.useState(false);
  const [tokenInvalid, setTokenInvalid] = React.useState(false);

  // Direct check for GitHub connection and token validity
  React.useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || isCheckingConnection) return;

      setIsCheckingConnection(true);
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("github_connected")
          .eq("id", user.id)
          .single();

        console.log("Direct GitHub connection check:", {
          data,
          error,
          stateConnection: hasGithubConnection,
          token: !!githubToken,
        });

        // Validate GitHub token if present
        if (githubToken) {
          try {
            const response = await fetch("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            if (!response.ok) {
              console.log("GitHub token validation failed, marking as invalid");
              setTokenInvalid(true);
            } else {
              setTokenInvalid(false);
            }
          } catch (err) {
            console.error("Error validating GitHub token:", err);
            setTokenInvalid(true);
          }
        }

        // If database shows connected but state doesn't match or token is missing
        if (data?.github_connected && (!hasGithubConnection || !githubToken)) {
          console.log("GitHub connection state mismatch, refreshing user data");
          await refreshUser();

          // If this is the first retry attempt and we still don't have the token
          if (!connectionRetried) {
            setConnectionRetried(true);

            // Force a page reload as last resort to get fresh session
            setTimeout(() => {
              console.log("Forcing page reload to refresh session");
              window.location.reload();
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Error checking GitHub connection:", err);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkConnectionStatus();
  }, [
    user,
    hasGithubConnection,
    refreshUser,
    isCheckingConnection,
    githubToken,
    connectionRetried,
  ]);

  console.log("GitHubConnectionPrompt render state:", {
    userId: user?.id,
    hasGithubConnection,
    hasGithubToken: !!githubToken,
    tokenInvalid,
    forceShow,
  });

  // Handle successful return from GitHub OAuth
  React.useEffect(() => {
    const handleOAuthReturn = async () => {
      const url = new URL(window.location.href);
      // Check if we're returning from a GitHub connection flow
      if (url.searchParams.get("github_connection") === "success") {
        console.log("Detected GitHub connection success parameter");
        // Remove the parameter to avoid duplicate processing
        url.searchParams.delete("github_connection");
        window.history.replaceState({}, "", url.toString());

        console.log("Forcing user data refresh after GitHub connection");

        try {
          await refreshUser();
          console.log("User data refreshed after GitHub connection");

          // Show toast notification
          showToast("GitHub successfully connected!", "success");

          // Update database directly to ensure connection is marked
          const supabase = createClientComponentClient();
          await supabase
            .from("profiles")
            .update({
              github_connected: true,
              github_connecting: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user?.id);

          // Force a full refresh to get fresh session with token
          setTimeout(() => {
            console.log(
              "Forcing page reload to refresh session after GitHub connection"
            );
            window.location.reload();
          }, 500);
        } catch (err) {
          console.error("Error processing GitHub connection return:", err);
          showToast("Error connecting to GitHub. Please try again.", "error");
        }

        if (onConnect) {
          onConnect();
        }
      }
    };

    if (user) {
      handleOAuthReturn();
    }
  }, [refreshUser, onConnect, user, showToast]);

  // Check if we should display the prompt
  const shouldShow = () => {
    // Show if explicitly requested (reconnection scenario)
    if (forceShow) return true;

    // Don't show if no user
    if (!user) return false;

    // Always show if GitHub token is invalid
    if (tokenInvalid) return true;

    // Show if user has no GitHub connection
    if (!hasGithubConnection) return true;

    // Show if GitHub is connected but token is missing
    if (hasGithubConnection && !githubToken) return true;

    // Otherwise, don't show
    return false;
  };

  // Don't show if we don't need to
  if (!shouldShow()) {
    console.log("GitHubConnectionPrompt hidden");
    return null;
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log("Starting GitHub connection flow");
      const { error } = await connectGitHub({
        redirectTo: `${window.location.origin}/auth/callback?connect=github&redirect_to=/dashboard&github_connection=success&capture_token=true`,
        scopes: ["read:user", "user:email", "repo"],
      });

      if (error) {
        throw error;
      }

      // The page will redirect to GitHub, so we don't need to handle success here
    } catch (err) {
      console.error("Error connecting to GitHub:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to GitHub"
      );
      showToast("Failed to connect to GitHub. Please try again.", "error");
      setIsConnecting(false);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // Determine the appropriate message based on the state
  const getMessage = () => {
    if (tokenInvalid) {
      return "Your GitHub connection needs to be refreshed. Please reconnect to GitHub.";
    }

    if (hasGithubConnection && !githubToken) {
      return "Your GitHub account is connected, but we need additional permissions. Please reconnect.";
    }

    return "Connect your GitHub account to access private repositories and improve your README generation.";
  };

  const getButtonText = () => {
    if (tokenInvalid || (hasGithubConnection && !githubToken)) {
      return isConnecting ? "Reconnecting..." : "Reconnect GitHub";
    }
    return isConnecting ? "Connecting..." : "Connect GitHub";
  };

  return (
    <div className="p-4 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Github className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
          <h3 className="font-semibold">
            {tokenInvalid || (hasGithubConnection && !githubToken)
              ? "Reconnect GitHub"
              : "Connect GitHub"}
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &times;
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {getMessage()}
      </p>
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {getButtonText()}
      </button>
    </div>
  );
}

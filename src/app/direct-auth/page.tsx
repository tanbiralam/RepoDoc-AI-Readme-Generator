"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DirectAuthPage() {
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [authUrl, setAuthUrl] = useState("");

  // Extract client ID from environment variable on component mount
  useEffect(() => {
    // This is just for display - the client ID will be visible in the URL anyway
    const envClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (envClientId) {
      setClientId(envClientId);
    } else {
      setError("GitHub Client ID not found in environment variables");
    }
  }, []);

  const handleDirectGitHubLogin = () => {
    // Get the GitHub OAuth app client ID
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      setError("GitHub Client ID not found in environment variables");
      return;
    }

    // Create the exact redirect URL as configured in GitHub
    const redirectUri = "http://localhost:3000/auth/callback";

    // These are the scopes we need
    const scope = "repo";

    // Generate the GitHub authorization URL
    const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}`;

    // Store the URL in state instead of redirecting immediately
    setAuthUrl(url);
    console.log("Direct GitHub Auth URL:", url);
  };

  const handleRedirect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Direct GitHub Authentication</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <p className="mb-4 text-gray-600 max-w-md text-center">
        This page bypasses Supabase&rsquo;s authentication flow to directly call
        GitHub&rsquo;s OAuth API. It will help us debug the redirect URI issue.
      </p>

      <div className="mb-6 bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Debug Information:</h2>
        <p>
          <strong>Client ID:</strong> {clientId || "Not available"}
        </p>
        <p>
          <strong>Redirect URI:</strong> http://localhost:3000/auth/callback
        </p>
      </div>

      <Button
        onClick={handleDirectGitHubLogin}
        className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded mb-4"
      >
        Generate GitHub Auth URL
      </Button>

      {authUrl && (
        <div className="mt-4 mb-6 w-full max-w-2xl">
          <h3 className="font-semibold mb-2">Generated Auth URL:</h3>
          <div className="bg-gray-100 p-3 rounded overflow-x-auto">
            <code className="text-sm break-all">{authUrl}</code>
          </div>

          <Button
            onClick={handleRedirect}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-4"
          >
            Continue to GitHub
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  signInWithEmail,
  signInWithGitHub,
  resetPassword,
} from "@/services/auth";
import { SignInCredentials } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Github, Lock, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const { showToast } = useToast();

  // Extract error and resetSuccess from URL if present
  useEffect(() => {
    // Check if we have URL error parameters
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("description");
    const githubConnectionParam = url.searchParams.get("github_connection");
    const redirectAfterAuthParam = url.searchParams.get("redirect_after_auth");

    if (errorParam) {
      setError(
        errorDescription
          ? `${errorParam}: ${errorDescription}`
          : `Authentication error: ${errorParam}`
      );

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Handle GitHub connection completion
    if (githubConnectionParam === "completed") {
      setError(null);
      showToast(
        "GitHub connection was successful! Please sign in again to continue.",
        "success"
      );

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Handle redirect after authentication
    if (redirectAfterAuthParam === "true") {
      setError("Your session expired. Please sign in again to continue.");

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
  }, [showToast]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAuthProvider("email");

    try {
      if (mode === "forgot") {
        if (!email) {
          throw new Error("Email is required.");
        }

        const { error } = await resetPassword(email);
        if (error) throw error;

        setResetSuccess(true);
      } else {
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const credentials: SignInCredentials = { email, password };

        const { user, error } = await signInWithEmail(credentials);
        if (error) throw error;
        if (user) router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
      setAuthProvider(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    setAuthProvider("github");

    try {
      const { error } = await signInWithGitHub({
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard&direct_github_login=true`,
      });

      if (error) {
        throw error;
      }

      // The page will redirect to GitHub, so we won't get here on success
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "GitHub authentication failed. Please try again."
      );
      showToast("GitHub authentication failed. Please try again.", "error");
      setLoading(false);
      setAuthProvider(null);
    }
  };

  // Show loading state or prevent rendering if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="relative bg-gray-950 min-h-screen flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/20 blur-3xl -z-10"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-gray-900 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-2xl p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              GitHub README Generator
            </h1>
            <p className="text-gray-400">
              {mode === "signin"
                ? "Sign in to your account"
                : "Reset your password"}
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleEmailAuth}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 rounded-md border-0 bg-gray-800/50 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-blue-500 px-3 py-2.5"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {mode === "signin" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 rounded-md border-0 bg-gray-800/50 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-blue-500 px-3 py-2.5"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="text-sm text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-blue-400 hover:text-blue-300 focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === "forgot" && resetSuccess ? (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
                Password reset email sent! Check your inbox for further
                instructions.
              </div>
            ) : null}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading && authProvider === "email"}
              className="w-full group flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-700/20 transition-all duration-200"
            >
              {loading && authProvider === "email" ? (
                <span className="flex items-center">
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
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  {mode === "signin" && "Sign In"}
                  {mode === "forgot" && "Reset Password"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </motion.button>
          </motion.form>

          {mode === "signin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-gray-700 shadow-sm rounded-md bg-gray-800 hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading && authProvider === "github" ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
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
                  ) : (
                    <>
                      <Github className="h-5 w-5" />
                      <span>GitHub</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            {mode === "signin" && (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-blue-400 hover:text-blue-300 focus:outline-none"
                >
                  Sign up
                </Link>
              </>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                Back to sign in
              </button>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <LogIn className="h-4 w-4 mr-1.5" />
            Back to homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Utility for logging with timestamps and persisting logs to localStorage
 */

interface LogEntry {
  timestamp: string;
  stage: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Utility function to log events with timestamps
 * Works in both client and server environments
 */
export const logWithTime = (
  stage: string,
  { message, data }: { message: string; data?: Record<string, unknown> }
): void => {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    stage,
    message,
    data,
  };

  // Log to console in both environments
  console.log(
    `[${timestamp}][${stage}] ${message}`,
    data ? JSON.stringify(data) : ""
  );

  // Only attempt to use localStorage in browser environment
  if (typeof window !== "undefined") {
    try {
      const logs = JSON.parse(
        localStorage.getItem("readme_generation_logs") || "[]"
      );
      logs.push(logEntry);
      localStorage.setItem("readme_generation_logs", JSON.stringify(logs));
    } catch (error) {
      console.warn("Failed to store log in localStorage:", error);
    }
  }
};

/**
 * Get recent logs filtered by repository name
 * @param repoName - Repository name to filter logs by
 * @param limit - Maximum number of logs to return
 */
export const getRecentLogs = (repoName: string, limit: number = 5) => {
  const logs = JSON.parse(
    localStorage.getItem("readme_generation_logs") || "[]"
  );

  return logs
    .filter(
      (log: Record<string, unknown>) =>
        typeof log.message === "string" && log.message.includes(repoName)
    )
    .slice(-limit);
};

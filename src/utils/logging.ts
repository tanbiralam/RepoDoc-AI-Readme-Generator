/**
 * Utility for logging with timestamps and persisting logs to localStorage
 */

/**
 * Log a message with a timestamp and store it in localStorage
 * @param message - The message to log
 * @param data - Optional data to include with the log
 */
export const logWithTime = (
  message: string,
  data?: Record<string, unknown>
) => {
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

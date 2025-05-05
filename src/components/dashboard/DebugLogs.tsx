import { GitHubRepo } from "@/types";

interface DebugLogsProps {
  showLogs: boolean;
  onToggleLogs: () => void;
  selectedRepo: GitHubRepo;
}

export default function DebugLogs({
  showLogs,
  onToggleLogs,
  selectedRepo,
}: DebugLogsProps) {
  return (
    <div className="mt-5 pt-4 border-t border-gray-700">
      <button
        onClick={onToggleLogs}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-gray-400 hover:text-indigo-400 rounded-md hover:bg-gray-800/60 transition-colors"
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
        <div className="mt-3 text-xs bg-gray-800/60 p-3 rounded-md max-h-48 overflow-y-auto border border-gray-700">
          {JSON.parse(localStorage.getItem("readme_generation_logs") || "[]")
            .filter(
              (log: Record<string, unknown>) =>
                typeof log.message === "string" &&
                log.message.includes(selectedRepo.name)
            )
            .slice(-5)
            .map((log: Record<string, unknown>, index: number) => (
              <div
                key={index}
                className="mb-2 pb-2 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0"
              >
                <div className="text-gray-500">
                  {new Date(log.timestamp as string).toLocaleTimeString()}
                </div>
                <div className="text-gray-300">{log.message as string}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

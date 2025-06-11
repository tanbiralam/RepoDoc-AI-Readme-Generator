import { UserProfile } from "@/types/auth";
import GitHubConnectionStatus from "./GitHubConnectionStatus";

interface DashboardHeaderProps {
  user: UserProfile | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 leading-tight">
                Welcome{user?.full_name ? `, ${user.full_name}` : ""}
              </h1>
            </div>
          </div>
        </div>

        <div className="lg:flex-shrink-0">
          <GitHubConnectionStatus />
        </div>
      </div>
    </div>
  );
}

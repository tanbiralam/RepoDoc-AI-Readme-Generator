import { UserProfile } from "@/types/auth";

interface DashboardHeaderProps {
  user: UserProfile | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-2">
        Welcome
        {user?.full_name ? `, ${user.full_name}` : " to your dashboard"}
      </h2>
      <p className="text-gray-400">
        Generate professional READMEs for your repositories in seconds.
      </p>
    </div>
  );
}

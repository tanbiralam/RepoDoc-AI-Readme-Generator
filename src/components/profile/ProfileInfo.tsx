"use client";

import { User } from "@/types";
import { Github } from "lucide-react";

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="p-6">
      <div className="flex items-start">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
          {user.full_name
            ? user.full_name.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="ml-6">
          <h3 className="text-lg font-medium text-gray-100">
            {user.full_name || "No name provided"}
          </h3>
          <p className="text-gray-400">{user.email}</p>
          {user.github_username && (
            <div className="flex items-center mt-2 text-sm text-gray-400">
              <Github className="h-4 w-4 mr-1" />
              <span>@{user.github_username}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 mt-6">
        <h4 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
          Account Details
        </h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-400">User ID</dt>
            <dd className="mt-1 text-sm text-gray-300">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-400">
              Account Created
            </dt>
            <dd className="mt-1 text-sm text-gray-300">
              {/* This would come from the user object if there was a created_at field */}
              {new Date().toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

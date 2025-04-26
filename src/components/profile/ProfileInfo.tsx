"use client";

import { useState } from "react";
import { User } from "@/types";

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.full_name || "",
    email: user.email,
    githubUsername: user.github_username || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to an API to update user info
    // For now, just toggle the editing state
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Profile Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Username
            </label>
            <input
              type="text"
              name="githubUsername"
              value={formData.githubUsername}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-md">
              {user.full_name
                ? user.full_name.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-medium text-gray-900">
                {user.full_name || "No name provided"}
              </h3>
              <p className="text-gray-500">{user.email}</p>
              {user.github_username && (
                <p className="text-sm text-gray-500 mt-1">
                  GitHub: @{user.github_username}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Account Details
            </h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Created
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {/* This would come from the user object if there was a created_at field */}
                  {new Date().toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

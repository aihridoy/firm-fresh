"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChangePasswordMutation } from "@/lib/api/endpoints/users";
import { useAppSelector } from "@/lib/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/lib/api/endpoints/userSlice";
import Image from "next/image";

interface RTKError {
  data?: {
    error?: string;
    message?: string;
  };
  status?: number;
}

export default function ChangePassword() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Ensure component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/login");
    }
  }, [isClient, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setErrorMessage("Current password is required");
      return false;
    }

    if (!formData.newPassword) {
      setErrorMessage("New password is required");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setErrorMessage("New password must be different from current password");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New passwords do not match");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    if (!user?._id) {
      setErrorMessage("User not found. Please login again.");
      return;
    }

    try {
      const result = await changePassword({
        id: user._id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      if (result.status) {
        setSuccessMessage(result.message || "Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrorMessage(result.error || "Failed to change password");
      }
    } catch (err) {
      const error = err as RTKError;
      console.error("Change password error:", error);
      setErrorMessage(
        error.data?.error || "An error occurred. Please try again later."
      );
    }
  };

  // Show nothing until client-side is ready
  if (!isClient) {
    return null;
  }

  // Show loading or redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center text-sm"
                >
                  <i className="fas fa-home mr-2"></i>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                  <Link
                    href="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                  >
                    Profile
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <i className="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Change Password
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-3 rounded-full">
              <i className="fas fa-key text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <i className="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-check-circle text-green-500 mr-3 mt-0.5"></i>
                <div>
                  <h4 className="text-green-800 dark:text-green-200 font-medium">
                    Success!
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.fullName || `${user.firstName} ${user.lastName}`}
                  height={36}
                  width={36}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-lg">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
              )}
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter current password"
                />
                <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showCurrentPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                  ></i>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new password"
                />
                <i className="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showNewPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                  ></i>
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm new password"
                />
                <i className="fas fa-check-double absolute left-3 top-3.5 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Changing...
                  </span>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Change Password
                  </>
                )}
              </button>
              <Link
                href="/profile"
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium transition duration-200 text-center"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </Link>
            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Forgot your current password?
            </Link>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            <i className="fas fa-shield-alt mr-2"></i>
            Password Security Tips
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li className="flex items-start">
              <i className="fas fa-check text-blue-500 mr-2 mt-0.5"></i>
              Use a combination of uppercase, lowercase, numbers, and symbols
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-blue-500 mr-2 mt-0.5"></i>
              Avoid using personal information or common words
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-blue-500 mr-2 mt-0.5"></i>
              Don&apos;t reuse passwords across different accounts
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-blue-500 mr-2 mt-0.5"></i>
              Change your password regularly for better security
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

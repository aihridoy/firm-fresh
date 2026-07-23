"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLoginUserMutation } from "@/lib/api/endpoints/users";

interface RTKError {
  data?: {
    error?: string;
    message?: string;
  };
  status?: number;
}

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setValidationError("Email is invalid");
      return false;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await loginUser({ email: formData.email, password: formData.password }).unwrap();
      toast.success("Welcome back!");
      onSuccess();
    } catch (err) {
      const error = err as RTKError;
      setValidationError(error.data?.error || "Login failed");
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password, remember: false });
    try {
      await loginUser({ email, password }).unwrap();
      toast.success("Welcome back!");
      onSuccess();
    } catch (err) {
      const error = err as RTKError;
      setValidationError(error.data?.error || "Demo login failed");
    }
  };

  return (
    <div className="space-y-6">
      {validationError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
            <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
            <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400 hover:text-gray-600`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="?auth=register" className="text-primary-600 hover:text-primary-500 font-medium">
            Create account
          </Link>
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Accounts:</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleDemoLogin("customer@demo.com", "password123")}
            className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 p-2 rounded transition"
            disabled={isLoading}
          >
            <strong>Customer:</strong> customer@demo.com / password123
          </button>
          <button
            onClick={() => handleDemoLogin("farmer@demo.com", "password123")}
            className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 p-2 rounded transition"
            disabled={isLoading}
          >
            <strong>Farmer:</strong> farmer@demo.com / password123
          </button>
          <button
            onClick={() => handleDemoLogin("admin@demo.com", "password123")}
            className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 p-2 rounded transition"
            disabled={isLoading}
          >
            <strong>Admin:</strong> admin@demo.com / password123
          </button>
        </div>
      </div>
    </div>
  );
}

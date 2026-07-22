"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-3 rounded-full">
              <i className="fas fa-seedling text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your FarmFresh account</p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl">
          <LoginForm onSuccess={() => router.push("/")} />
        </div>
      </div>
    </div>
  );
}

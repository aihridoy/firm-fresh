"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

export default function Register() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-3 rounded-full">
              <i className="fas fa-seedling text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Join FarmFresh community today</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 py-8 px-8 shadow-xl rounded-2xl">
            <RegisterForm onSuccess={() => router.push("/")} />
          </div>
        </div>
      </div>
    </div>
  );
}

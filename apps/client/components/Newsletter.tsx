"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useSubscribeNewsletterMutation } from "@/lib/api/endpoints/newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await subscribe(email.trim()).unwrap();
      toast.success(result.message);
      setEmail("");
    } catch (err) {
      const message = (err as { data?: { error?: string } })?.data?.error;
      toast.error(message || "Couldn't subscribe. Please try again.");
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12 text-center">
          <div className="bg-primary-100 dark:bg-primary-900 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-envelope-open-text text-xl text-primary-600 dark:text-primary-400"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Stay Updated</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get notified about new farmers, seasonal produce, and special offers
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

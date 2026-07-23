"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/api/endpoints/userSlice";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "fa-chart-line" },
  { href: "/admin/users", label: "Users", icon: "fa-users" },
  { href: "/admin/farmers", label: "Farmers", icon: "fa-tractor" },
  { href: "/admin/products", label: "Products", icon: "fa-box" },
  { href: "/admin/orders", label: "Orders", icon: "fa-shopping-bag" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector(selectCurrentUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Guard: only admins get in
  useEffect(() => {
    if (mounted && (!user || user.userType !== "admin")) router.replace("/");
  }, [mounted, user, router]);

  if (!mounted || !user || user.userType !== "admin") return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {user.email === "admin@demo.com" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
            <i className="fas fa-eye text-blue-500"></i>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Read-only demo:</span> You can explore everything, but changes are disabled for this account.
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 space-y-1 sticky top-24">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith(item.href)
                    ? "bg-primary-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <i className={`fas ${item.icon} w-5`}></i>
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile nav */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  pathname.startsWith(item.href)
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

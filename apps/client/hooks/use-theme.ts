"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  // Start with undefined to prevent hydration mismatch
  const [theme, setTheme] = useState<Theme | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Get initial theme
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    // Apply theme to document BEFORE setting state to prevent flash
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setTheme(initialTheme);
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    if (!theme) return; // Guard against toggling before mounted

    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return {
    theme: theme || "light",
    toggleTheme,
    mounted,
  };
}

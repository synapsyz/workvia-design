"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-[#0A0F1E] text-white" : "bg-gray-50 text-gray-900"
      } transition-colors`}
      style={{
        fontFamily:
          'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* Sidebar keeps your original styling and expects darkMode */}
      <Sidebar darkMode={darkMode} />

      <main className="flex-1 p-6">
        {/* Topbar keeps darkMode prop; toggle passed but button removed in the component */}
        <Topbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <div>{children}</div>

        <footer
          className={`mt-8 text-center text-xs ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          © {new Date().getFullYear()} Workvia
        </footer>
      </main>
    </div>
  );
}

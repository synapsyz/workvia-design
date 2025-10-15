"use client";
import Link from "next/link";
import {
  Home,
  Users,
  Box,
  BarChart2,
  Calendar,
  Database,
  Bot,
  ClipboardList,
  Settings,
} from "lucide-react";

export default function Sidebar({ darkMode }: { darkMode: boolean }) {
  const borderColor = darkMode ? "border-[#334155]" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-[#1E293B]/70" : "hover:bg-gray-50";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textStrong = darkMode ? "text-gray-100" : "text-gray-800";

  return (
    <aside
      className={`w-72 ${
        darkMode ? "bg-[#0F172A]" : "bg-white"
      } border-r ${borderColor} min-h-screen p-6 hidden md:block`}
    >
      <div className="flex items-center justify-center mb-10">
        <img src="/logo.png" alt="Logo" className="w-80 h-20 object-contain" />
      </div>

      <nav className="space-y-1">
        {[
          { name: "Home", icon: Home, href: "/dashboard" },
          { name: "Users", icon: Users, href: "/dashboard/users" },
          { name: "Create SOP", icon: Box, href: "/dashboard/createsop" },
          { name: "Tasks", icon: BarChart2, href: "/dashboard/tasks" },
          { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
          { name: "Issues", icon: Database, href: "/dashboard/issues" },
          { name: "Chat", icon: Bot, href: "/dashboard/chat" },
          { name: "AI", icon: Bot, href: "/dashboard/ai" },
          { name: "Exam", icon: ClipboardList, href: "/dashboard/exam" },
          { name: "Settings", icon: Settings, href: "/dashboard/settings" },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center gap-3 p-2 rounded-lg ${hoverBg} text-sm ${
              darkMode ? "text-gray-200" : "text-gray-700"
            } border ${borderColor} transition-all`}
          >
            <item.icon
              className={`w-4 h-4 ${
                darkMode ? "text-blue-300" : "text-[#0A236E]"
              } transition-transform group-hover:scale-110`}
            />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

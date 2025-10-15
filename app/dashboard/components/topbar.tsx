"use client";

import {
  Bell,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  X,
  Save,
  CreditCard,
  Trash2,
  Upload,
  Camera,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";

/* ==============================
   Types
============================== */
interface Profile {
  name: string;
  email: string;
  contact: string;
  designation: string;
  avatar: string; // data URL or external URL
}

interface Account {
  manager: string;
  logo: string; // data URL or external URL
}

interface Language {
  code: string;
  label: string;
  flag: string;
}

interface TopbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  borderColor: string;
  hoverBg: string;
  textMuted: string;
  cardBg: string;
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
  onSave: () => void;
}

/* ==============================
   Helpers
============================== */
const LANGUAGES: Language[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "fr", label: "French", flag: "🇫🇷" },
];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve((ev.target?.result as string) || "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function validateImage(file: File, maxMB = 5): string | null {
  if (!file.type.startsWith("image/")) return "Please upload an image file.";
  const mb = file.size / (1024 * 1024);
  if (mb > maxMB) return `Image must be under ${maxMB} MB.`;
  return null;
}

/* Clean inline Language icon (nice A/文 mark) */
function LanguageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 8h14" />
      <path d="M7 8c0 4 4 8 5 8" />
      <path d="M12 16c1 0 5-4 5-8" />
      <path d="M8 12h8" />
      <path d="M3 20h6" />
      <path d="m4 20 4-12" />
      <path d="m8 20 4-12" />
      <path d="M14 12h7" />
      <path d="M18 8v8" />
    </svg>
  );
}

/* ==============================
   Main Topbar
============================== */
export default function Topbar({ darkMode, toggleDarkMode }: TopbarProps) {
  const [notifications, setNotifications] = useState<
    { id: number; text: string; time: string; read: boolean }[]
  >([
    { id: 1, text: "New user signed up", time: "2m ago", read: false },
    { id: 2, text: "Payment received: $299", time: "1h ago", read: false },
  ]);
  const unread = notifications.filter((n) => !n.read).length;

  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showProfileSettings, setShowProfileSettings] = useState<boolean>(false);

  const [profile, setProfile] = useState<Profile>({
    name: "Maria Gomez",
    email: "maria@example.com",
    contact: "+91 9876543210",
    designation: "Admin",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  });

  const [language, setLanguage] = useState<Language>({
    code: "en",
    label: "English",
    flag: "🇬🇧",
  });

  const borderColor = darkMode ? "border-[#334155]" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-[#1E293B]/70" : "hover:bg-gray-50";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBg = darkMode ? "bg-[#1E293B]" : "bg-white";

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("user_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile) as Profile);
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(JSON.parse(savedLang) as Language);
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfileMenu(false);
      if (langRef.current && !langRef.current.contains(target)) setShowLangMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSaveProfile = (): void => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setShowProfileSettings(false);
  };

  const selectLanguage = (lang: Language): void => {
    setLanguage(lang);
    localStorage.setItem("language", JSON.stringify(lang));
    setShowLangMenu(false);
  };

  return (
    <>
      <header className="flex items-center justify-between mb-6 px-2 sm:px-0">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className={`text-sm ${textMuted}`}>Overview of your workspace ({language.label})</div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((s) => !s)}
              className={`relative p-2 rounded-md ${hoverBg} border ${borderColor}`}
            >
              <Bell className={`w-5 h-5 ${darkMode ? "text-gray-200" : "text-gray-700"}`} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs shadow">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`absolute right-0 mt-3 w-80 ${cardBg} border ${borderColor} rounded-xl shadow-2xl z-50 overflow-hidden`}
                >
                  <div className={`flex items-center justify-between px-4 py-2 border-b ${borderColor}`}>
                    <div className="font-semibold">Notifications</div>
                    <button onClick={() => setNotifications([])} className={`text-xs ${textMuted}`}>
                      Clear
                    </button>
                  </div>

                  <ul className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className={`px-4 py-4 text-sm ${textMuted}`}>No notifications</li>
                    ) : (
                      notifications.map((note) => (
                        <li key={note.id} className={`px-4 py-3 flex gap-3 ${hoverBg}`}>
                          <Bell className="w-4 h-4 text-blue-400" />
                          <div className="text-sm">
                            {note.text}
                            <div className={`text-xs ${textMuted}`}>{note.time}</div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu((s) => !s)}
              className={`flex items-center gap-2 border border-transparent hover:border-gray-300 dark:hover:border-[#334155] rounded-full px-3 py-1 transition`}
              title="Change language"
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm">{language.flag}</span>
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`absolute right-0 mt-2 w-44 ${cardBg} border ${borderColor} rounded-xl shadow-lg z-50 overflow-hidden`}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => selectLanguage(lang)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg}`}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((s) => !s)}
              className="flex items-center gap-3 border border-transparent hover:border-gray-300 dark:hover:border-[#334155] rounded-full pl-3 pr-2 py-1.5 transition"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">{profile.name}</div>
                <div className={`text-xs ${textMuted}`}>{profile.designation}</div>
              </div>
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`absolute right-0 mt-3 w-64 ${cardBg} border ${borderColor} rounded-xl shadow-2xl z-50 overflow-hidden`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#334155]">
                    <img
                      src={profile.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{profile.name}</div>
                      <div className={`text-xs ${textMuted}`}>{profile.designation}</div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowProfileSettings(true);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverBg}`}
                    >
                      <User className="w-4 h-4" /> Profile Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-[#334155]">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30`}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        open={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        darkMode={darkMode}
        borderColor={borderColor}
        hoverBg={hoverBg}
        textMuted={textMuted}
        cardBg={cardBg}
        profile={profile}
        setProfile={setProfile}
        onSave={handleSaveProfile}
      />
    </>
  );
}

/* ==============================
   Profile Settings Modal
============================== */
function ProfileSettingsModal({
  open,
  onClose,
  darkMode,
  borderColor,
  hoverBg,
  textMuted,
  cardBg,
  profile,
  setProfile,
  onSave,
}: ProfileSettingsModalProps) {
  if (!open) return null;

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImage(file, 5);
    if (validation) {
      alert(validation);
      return;
    }
    const dataURL = await readFileAsDataURL(file);
    setProfile((p) => ({ ...p, avatar: dataURL }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[80]"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl border ${borderColor} ${cardBg} p-6 shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Profile Settings</h3>
          <button onClick={onClose} className={`p-1.5 rounded-md ${hoverBg}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border border-gray-300"
            />
            <label
              className="absolute bottom-0 right-0 bg-[#0A236E] text-white p-1.5 rounded-full cursor-pointer"
              title="Change profile picture"
            >
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>
          <div className={`text-xs mt-2 ${textMuted}`}>Click camera to change</div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-medium ${textMuted}`}>Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none ${
                darkMode ? "bg-[#0F172A] border-[#334155] text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className={`text-xs font-medium ${textMuted}`}>Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none ${
                darkMode ? "bg-[#0F172A] border-[#334155] text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className={`text-xs font-medium ${textMuted}`}>Contact Number</label>
            <input
              value={profile.contact}
              onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none ${
                darkMode ? "bg-[#0F172A] border-[#334155] text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className={`text-xs font-medium ${textMuted}`}>Designation</label>
            <input
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none ${
                darkMode ? "bg-[#0F172A] border-[#334155] text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0A236E] text-[#0A236E] hover:bg-[#0A236E] hover:text-white text-sm font-medium transition"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </>
  );
}
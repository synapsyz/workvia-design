"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2 } from "lucide-react";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    thumbnail?: string;
    manager?: string;
    users?: string[];
  }) => void;
  existingData?: {
    name?: string;
    thumbnail?: string;
    manager?: string;
    users?: string[];
  };
  managerOptions: string[];
  userOptions: string[];
  parentCategoryName?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  onSave,
  existingData,
  managerOptions,
  userOptions,
  parentCategoryName,
}) => {
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  // Load existing data or reset
  useEffect(() => {
    if (existingData) {
      setName(existingData.name || "");
      setManager(existingData.manager || "");
      setUsers(existingData.users || []);
      setThumbnail(existingData.thumbnail || undefined);
    } else {
      setName("");
      setManager("");
      setUsers([]);
      setThumbnail(undefined);
    }
  }, [existingData, open]);

  // Handle thumbnail upload
  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnail(url);
    }
  };

  const removeThumbnail = () => setThumbnail(undefined);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, thumbnail, manager, users });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[80]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-[90vw] max-w-md rounded-2xl border border-gray-200 
                       dark:border-[#334155] bg-white dark:bg-[#0F172A] 
                       p-6 shadow-2xl"
          >
            {/* ---------- HEADER ---------- */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0A236E]">
                  {existingData
                    ? "Edit Category"
                    : parentCategoryName
                    ? `Create Subcategory under ${parentCategoryName}`
                    : "Create Category"}
                </h3>
                {parentCategoryName && (
                  <p className="text-xs text-gray-500 mt-1">
                    This subcategory will be added under{" "}
                    <span className="font-medium">{parentCategoryName}</span>.
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ---------- FORM ---------- */}
            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-[#0A236E]/20"
                  placeholder={
                    parentCategoryName
                      ? "Enter subcategory name"
                      : "Enter category name"
                  }
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Thumbnail
                </label>
                <div className="mt-2 flex flex-col gap-2">
                  {!thumbnail ? (
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg text-sm w-fit text-[#0A236E]">
                      <Upload className="w-4 h-4" /> Upload Thumbnail
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnail}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt="Thumbnail"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={removeThumbnail}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        title="Remove Thumbnail"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Manager */}
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Assign Manager
                </label>
                <select
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select Manager</option>
                  {managerOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Users */}
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Assign Users
                </label>
                <select
                  multiple
                  value={users}
                  onChange={(e) =>
                    setUsers(
                      Array.from(e.target.selectedOptions, (opt) => opt.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {userOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---------- ACTIONS ---------- */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    name.trim()
                      ? "bg-[#0A236E] text-white hover:opacity-90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {existingData ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;

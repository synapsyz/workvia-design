"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CategoryCard from "./CategoryCard";
import { Category } from "./types";

interface CategoryListViewProps {
  categories: Category[];
  onCreateCategory: () => void;
  onEditCategory: (id: number) => void;
  onDeleteCategory: (id: number) => void;
  onOpenCategory: (id: number) => void;
}

const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onOpenCategory,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const filtered = categories.filter(
    (cat) => cat.isActive === (activeTab === "active")
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-xl font-semibold text-[#0A236E]">
          {activeTab === "active" ? "Active Categories" : "Inactive Categories"}
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "active"
                ? "bg-[#0A236E] text-white shadow-sm"
                : "border border-[#0A236E] text-[#0A236E] hover:bg-[#0A236E]/5"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "inactive"
                ? "bg-[#0A236E] text-white shadow-sm"
                : "border border-[#0A236E] text-[#0A236E] hover:bg-[#0A236E]/5"
            }`}
          >
            Inactive
          </button>
          <button
            onClick={onCreateCategory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A236E] text-white hover:opacity-90 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>
      </div>

      {/* List View */}
      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500 italic">
          No {activeTab} categories available.
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              thumbnail={cat.thumbnail}
              createdBy={cat.createdBy}
              createdAt={cat.createdAt}
              lastEditedBy={cat.lastEditedBy}
              lastEditedAt={cat.lastEditedAt}
              manager={cat.manager}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
              onOpen={onOpenCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListView;

"use client";

import React, { useState } from "react";
import CategoryListView from "./components/CategoryListView";
import CategoryModal from "./components/CategoryModal";
import SubcategoryCard from "./components/SubcategoryCard";
import SOPCard from "./components/SOPCard";
import SOPEditor from "./components/SOPEditor";
import ApproverAssignModal from "./components/ApproverAssignModal";
import VersionHistoryModal from "./components/VersionHistoryModal";
import { SOP, Category } from "./components/types";

// ============================================================
// PAGE COMPONENT
// ============================================================
export default function CreateSOPPage() {
  // -------------------------
  // Category State
  // -------------------------
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Production SOPs",
      createdBy: "Admin",
      createdAt: "12 Oct 2025",
      lastEditedBy: "Admin",
      lastEditedAt: "13 Oct 2025",
      isActive: true,
      thumbnail: "",
      subcategories: [],
      sops: [],
    },
    {
      id: 2,
      name: "Training Manuals",
      createdBy: "John",
      createdAt: "09 Oct 2025",
      lastEditedBy: "John",
      lastEditedAt: "10 Oct 2025",
      isActive: false,
      thumbnail: "",
      subcategories: [],
      sops: [],
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Category | null>(null);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);

  // -------------------------
  // Modal States
  // -------------------------
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const [versionHistory, setVersionHistory] = useState<
    { version: number; updatedAt: string; updatedBy: string }[]
  >([]);

  // ============================================================
  // CATEGORY HANDLERS
  // ============================================================
  const createCategory = () => {
    setSelectedCategory(null);
    setEditingCategory(null);
    setIsSubcategoryMode(false);
    setShowCategoryModal(true);
  };

  const saveCategory = (data: {
    name: string;
    thumbnail?: string;
    manager?: string;
    users?: string[];
  }) => {
    if (editingCategory) {
      // ✅ Update existing category
      const updatedCats = categories.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              name: data.name,
              thumbnail: data.thumbnail || cat.thumbnail,
              manager: data.manager,
              users: data.users,
              lastEditedBy: "Admin",
              lastEditedAt: new Date().toLocaleDateString(),
            }
          : cat
      );
      setCategories(updatedCats);
      setEditingCategory(null);
    } else {
      // ✅ Create new category
      const newCategory: Category = {
        id: Date.now(),
        name: data.name,
        thumbnail: data.thumbnail || "",
        manager: data.manager,
        users: data.users,
        createdBy: "Admin",
        createdAt: new Date().toLocaleDateString(),
        lastEditedBy: "Admin",
        lastEditedAt: new Date().toLocaleDateString(),
        isActive: true,
        subcategories: [],
        sops: [],
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setShowCategoryModal(false);
  };

  // ============================================================
  // SUBCATEGORY HANDLERS
  // ============================================================
  const addOrEditSubcategory = (data: {
    name: string;
    thumbnail?: string;
    manager?: string;
    users?: string[];
  }) => {
    if (!selectedCategory) return;

    if (editingSubcategory) {
      // ✅ Edit existing subcategory
      const updatedCats = categories.map((cat) => {
        if (cat.id === selectedCategory.id) {
          const updatedSubs =
            cat.subcategories?.map((sub) =>
              sub.id === editingSubcategory.id
                ? {
                    ...sub,
                    name: data.name,
                    thumbnail: data.thumbnail || sub.thumbnail,
                    manager: data.manager,
                    users: data.users,
                    lastEditedBy: "Admin",
                    lastEditedAt: new Date().toLocaleDateString(),
                  }
                : sub
            ) || [];
          return { ...cat, subcategories: updatedSubs };
        }
        return cat;
      });
      setCategories(updatedCats);

      setSelectedCategory((prev) =>
        prev
          ? {
              ...prev,
              subcategories:
                prev.subcategories?.map((sub) =>
                  sub.id === editingSubcategory.id
                    ? {
                        ...sub,
                        name: data.name,
                        thumbnail: data.thumbnail || sub.thumbnail,
                        manager: data.manager,
                        users: data.users,
                        lastEditedBy: "Admin",
                        lastEditedAt: new Date().toLocaleDateString(),
                      }
                    : sub
                ) || [],
            }
          : prev
      );

      setEditingSubcategory(null);
    } else {
      // ✅ Add new subcategory
      const newSub: Category = {
        id: Date.now(),
        name: data.name,
        thumbnail: data.thumbnail || "",
        manager: data.manager,
        users: data.users,
        createdBy: "Admin",
        createdAt: new Date().toLocaleDateString(),
        lastEditedBy: "Admin",
        lastEditedAt: new Date().toLocaleDateString(),
        isActive: true,
        subcategories: [],
        sops: [],
      };

      const updatedCats = categories.map((cat) =>
        cat.id === selectedCategory.id
          ? { ...cat, subcategories: [...(cat.subcategories || []), newSub] }
          : cat
      );
      setCategories(updatedCats);

      setSelectedCategory((prev) =>
        prev ? { ...prev, subcategories: [...(prev.subcategories || []), newSub] } : prev
      );
    }

    setShowCategoryModal(false);
  };

  const deleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const openCategory = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) setSelectedCategory(cat);
  };

  const deleteSubcategory = (id: number) => {
    if (!selectedCategory) return;
    const updated = categories.map((cat) =>
      cat.id === selectedCategory.id
        ? {
            ...cat,
            subcategories: cat.subcategories?.filter((s) => s.id !== id) || [],
          }
        : cat
    );
    setCategories(updated);
    setSelectedCategory((prev) =>
      prev
        ? {
            ...prev,
            subcategories: prev.subcategories?.filter((s) => s.id !== id) || [],
          }
        : prev
    );
  };

  // ============================================================
  // SOP HANDLERS
  // ============================================================
  const createSOP = () => {
    const newSOP: SOP = {
      id: Date.now(),
      title: "New SOP",
      description: "",
      headerMedia: [],
      steps: [],
      version: 1,
      status: "Draft",
    };
    setEditingSOP(newSOP);
  };

  const saveSOP = (updated: SOP) => {
    if (!selectedCategory) return;

    const updatedCategories = categories.map((cat) => {
      if (cat.id === selectedCategory.id) {
        const existingIdx = cat.sops.findIndex((s) => s.id === updated.id);
        const newSops =
          existingIdx !== -1
            ? cat.sops.map((s) => (s.id === updated.id ? updated : s))
            : [...cat.sops, updated];
        return { ...cat, sops: newSops };
      }
      return cat;
    });

    setCategories(updatedCategories);

    setSelectedCategory((prev) =>
      prev
        ? {
            ...prev,
            sops:
              prev.sops.find((s) => s.id === updated.id)
                ? prev.sops.map((s) => (s.id === updated.id ? updated : s))
                : [...prev.sops, updated],
          }
        : prev
    );

    setEditingSOP(null);
  };

  // ============================================================
  // CONDITIONAL VIEWS
  // ============================================================
  if (editingSOP) {
    return (
      <div className="p-6">
        <SOPEditor sop={editingSOP} onSave={saveSOP} onBack={() => setEditingSOP(null)} />
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCategory.thumbnail && (
              <img
                src={selectedCategory.thumbnail}
                alt={selectedCategory.name}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-[#0A236E]">
                {selectedCategory.name}
              </h2>
              <p className="text-sm text-gray-500">
                Manager: {selectedCategory.manager || "Not assigned"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createSOP}
              className="px-4 py-2 bg-[#0A236E] text-white rounded-lg"
            >
              Create SOP
            </button>

            <button
              onClick={() => {
                setIsSubcategoryMode(true);
                setEditingSubcategory(null);
                setShowCategoryModal(true);
              }}
              className="px-4 py-2 border border-[#0A236E] text-[#0A236E] rounded-lg"
            >
              + Subcategory
            </button>

            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Back
            </button>
          </div>
        </div>

        {/* SUBCATEGORIES */}
        <div>
          <h3 className="font-medium text-[#0A236E] mb-2">Subcategories</h3>
          {selectedCategory.subcategories?.length ? (
            <div className="flex flex-col gap-3 w-full">
              {selectedCategory.subcategories.map((sub) => (
                <SubcategoryCard
                  key={sub.id}
                  id={sub.id}
                  name={sub.name}
                  parentName={selectedCategory.name}
                  createdBy={sub.createdBy}
                  createdAt={sub.createdAt}
                  lastEditedBy={sub.lastEditedBy}
                  lastEditedAt={sub.lastEditedAt}
                  thumbnail={sub.thumbnail}
                  manager={sub.manager}
                  onEdit={(id) => {
                    const target =
                      selectedCategory.subcategories?.find((s) => s.id === id) || null;
                    if (target) {
                      setEditingSubcategory(target);
                      setIsSubcategoryMode(true);
                      setShowCategoryModal(true);
                    }
                  }}
                  onDelete={(id) => deleteSubcategory(id)}
                  onOpen={(id) => {
                    const target =
                      selectedCategory.subcategories?.find((s) => s.id === id) || null;
                    if (target) setSelectedCategory(target);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No subcategories yet.</p>
          )}
        </div>

        {/* SOPs */}
        <div>
          <h3 className="font-medium text-[#0A236E] mb-2">SOPs</h3>
          {selectedCategory.sops?.length ? (
            <div className="flex flex-col gap-3 w-full">
              {selectedCategory.sops.map((sop) => (
                <SOPCard
                  key={sop.id}
                  id={sop.id}
                  title={sop.title}
                  createdBy={selectedCategory.createdBy}
                  createdAt={selectedCategory.createdAt}
                  lastEditedBy={selectedCategory.lastEditedBy}
                  lastEditedAt={selectedCategory.lastEditedAt}
                  version={sop.version}
                  status={sop.status}
                  thumbnail={sop.headerMedia?.[0]}
                  onOpen={(id) => {
                    const target = selectedCategory.sops.find((s) => s.id === id);
                    if (target) setEditingSOP(target);
                  }}
                  onEdit={(id) => {
                    const target = selectedCategory.sops.find((s) => s.id === id);
                    if (target) setEditingSOP(target);
                  }}
                  onDelete={(id) => {
                    const updatedCats = categories.map((cat) =>
                      cat.id === selectedCategory.id
                        ? { ...cat, sops: cat.sops.filter((s) => s.id !== id) }
                        : cat
                    );
                    setCategories(updatedCats);
                    setSelectedCategory((prev) =>
                      prev ? { ...prev, sops: prev.sops.filter((s) => s.id !== id) } : prev
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No SOPs created yet.</p>
          )}
        </div>

        {/* Category Modal for Subcategory */}
        <CategoryModal
          open={showCategoryModal && isSubcategoryMode}
          onClose={() => {
            setShowCategoryModal(false);
            setIsSubcategoryMode(false);
            setEditingSubcategory(null);
          }}
          onSave={addOrEditSubcategory}
          parentCategoryName={selectedCategory.name}
          existingData={
            editingSubcategory
              ? {
                  name: editingSubcategory.name,
                  thumbnail: editingSubcategory.thumbnail,
                  manager: editingSubcategory.manager,
                  users: editingSubcategory.users,
                }
              : undefined
          }
          managerOptions={["Arun", "Priya", "David", "John", "Maria"]}
          userOptions={["QA Team", "Production", "HR", "Trainers"]}
        />
      </div>
    );
  }

  // ============================================================
  // ROOT VIEW (CATEGORY LIST)
  // ============================================================
  
  // ✅ FIXED: In this scope, editingSOP is always null, so status is "Draft".
  const currentStatus = "Draft";

  return (
    <div className="p-6 space-y-4">
      <CategoryListView
        categories={categories}
        onCreateCategory={createCategory}
        onEditCategory={(id) => {
          const target = categories.find((c) => c.id === id);
          if (target) {
            setEditingCategory(target);
            setSelectedCategory(null);
            setIsSubcategoryMode(false);
            setShowCategoryModal(true);
          }
        }}
        onDeleteCategory={deleteCategory}
        onOpenCategory={openCategory}
      />

      {/* Category Modal */}
      <CategoryModal
        open={showCategoryModal && !isSubcategoryMode}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={saveCategory}
        existingData={
          editingCategory
            ? {
                name: editingCategory.name,
                thumbnail: editingCategory.thumbnail,
                manager: editingCategory.manager,
                users: editingCategory.users,
              }
            : undefined
        }
        managerOptions={["Arun", "Priya", "David", "John", "Maria"]}
        userOptions={["QA Team", "Production", "HR", "Trainers"]}
      />

      {/* Approver & Version Modals */}
      <ApproverAssignModal
        open={showApproverModal}
        onClose={() => setShowApproverModal(false)}
        onAssign={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
        currentStatus={currentStatus}
        approverOptions={["Ravi Patel", "Priya Nair", "David Chen"]}
      />

      <VersionHistoryModal
        open={showVersionModal}
        versions={versionHistory}
        onRestore={() => {}}
        onClose={() => setShowVersionModal(false)}
      />
    </div>
  );
}
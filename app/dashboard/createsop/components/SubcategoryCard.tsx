"use client";

import React from "react";
import { Folder, Pencil, Trash2 } from "lucide-react";

interface Props {
  id: number;
  name: string;
  parentName: string;
  createdBy: string;
  createdAt: string;
  lastEditedBy: string;
  lastEditedAt: string;
  thumbnail?: string;
  manager?: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
}

const SubcategoryCard: React.FC<Props> = ({
  id,
  name,
  parentName,
  createdBy,
  createdAt,
  lastEditedBy,
  lastEditedAt,
  thumbnail,
  manager,
  onEdit,
  onDelete,
  onOpen,
}) => {
  return (
    <div
      onClick={() => onOpen(id)}
      className="w-full flex items-center justify-between bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-[#334155] rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail + Info */}
      <div className="flex items-center gap-4 w-[25%]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 border">
            <Folder className="w-6 h-6 text-[#0A236E]" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#0A236E]">{name}</h3>
          <p className="text-xs text-gray-500">Subcategory of {parentName}</p>
        </div>
      </div>

      {/* Middle info */}
      <div className="flex-1 grid grid-cols-3 gap-3 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-800">Manager</p>
          <p>{manager || "—"}</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Created</p>
          <p>{createdBy} • {createdAt}</p>
        </div>
        <div>
          <p className="font-medium text-gray-800">Last Edited</p>
          <p>{lastEditedBy} • {lastEditedAt}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-[80px] justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(id);
          }}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Pencil className="w-4 h-4 text-[#0A236E]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-2 rounded-md hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default SubcategoryCard;

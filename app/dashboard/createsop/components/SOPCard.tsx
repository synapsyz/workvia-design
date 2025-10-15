"use client";

import React from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { SOPStatus } from "./types";

interface Props {
  id: number;
  title: string;
  createdBy: string;
  createdAt: string;
  lastEditedBy: string;
  lastEditedAt: string;
  version: number;
  status: SOPStatus;
  thumbnail?: string;
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const statusBadge = (status: SOPStatus) => {
  const styles: Record<SOPStatus, string> = {
    Draft: "bg-gray-100 text-gray-700",
    "Pending Approval": "bg-yellow-50 text-yellow-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-600",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${styles[status]}`}>
      {status}
    </span>
  );
};

const SOPCard: React.FC<Props> = ({
  id,
  title,
  createdBy,
  createdAt,
  lastEditedBy,
  lastEditedAt,
  version,
  status,
  thumbnail,
  onOpen,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onOpen(id)}
      className="w-full flex items-center justify-between bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-[#334155] rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail + title */}
      <div className="flex items-center gap-4 w-[25%]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            className="w-12 h-12 rounded-md object-cover border"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-gray-100 border">
            <FileText className="w-6 h-6 text-[#0A236E]" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#0A236E]">{title}</h3>
          <p className="text-xs text-gray-500">Version {version}</p>
        </div>
      </div>

      {/* Middle info */}
      <div className="flex-1 grid grid-cols-3 gap-3 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-800">Status</p>
          {statusBadge(status)}
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

export default SOPCard;

"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, History } from "lucide-react";
import { SOPVersion } from "./types";

interface VersionHistoryModalProps {
  open: boolean;
  versions: SOPVersion[];
  onRestore: (version: number) => void;
  onClose: () => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  open,
  versions,
  onRestore,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-2xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#0A236E] flex items-center gap-2">
                <History className="w-5 h-5" /> Version History
              </h3>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {versions.length === 0 ? (
              <p className="text-sm text-gray-500">No versions yet.</p>
            ) : (
              <div className="space-y-3">
                {versions
                  .slice()
                  .sort((a, b) => b.version - a.version)
                  .map((v) => (
                    <div
                      key={v.version}
                      className="flex items-center justify-between border rounded-lg p-3 bg-gray-50 dark:bg-[#0F172A]"
                    >
                      <div>
                        <div className="font-medium">v{v.version}</div>
                        <div className="text-xs text-gray-500">
                          {v.updatedAt} • {v.updatedBy}
                        </div>
                        {v.note && <div className="text-xs mt-1">{v.note}</div>}
                      </div>
                      <button
                        onClick={() => onRestore(v.version)}
                        className="px-3 py-1 rounded-md text-sm bg-[#0A236E] text-white"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VersionHistoryModal;

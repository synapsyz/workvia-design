"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SOPStatus } from "./types";

interface ApproverAssignModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (approver: string) => void;
  onApprove: () => void;
  onReject: () => void;
  currentStatus: SOPStatus;
  approverOptions: string[];
}

const ApproverAssignModal: React.FC<ApproverAssignModalProps> = ({
  open,
  onClose,
  onAssign,
  onApprove,
  onReject,
  currentStatus,
  approverOptions,
}) => {
  const [approver, setApprover] = React.useState("");

  React.useEffect(() => {
    if (!open) setApprover("");
  }, [open]);

  const canApprove = currentStatus === "Pending Approval" || currentStatus === "Draft";

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
            className="fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#0A236E]">Approval</h3>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                Current Status:{" "}
                <span className="font-medium">{currentStatus}</span>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Assign Approver</label>
                <select
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select approver</option>
                  {approverOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end mt-3">
                  <button
                    disabled={!approver}
                    onClick={() => onAssign(approver)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      approver ? "bg-[#0A236E] text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Assign
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-[#334155]" />

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={onReject}
                  disabled={!canApprove}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    canApprove
                      ? "border-red-500 text-red-600 hover:bg-red-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  disabled={!canApprove}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    canApprove ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Approve
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApproverAssignModal;

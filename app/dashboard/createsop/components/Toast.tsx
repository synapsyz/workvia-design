"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface ToastProps {
  show: boolean;
  text: string;
  onClose: () => void;
  durationMs?: number;
}

const Toast: React.FC<ToastProps> = ({ show, text, onClose, durationMs = 1800 }) => {
  React.useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [show, onClose, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl bg-white dark:bg-[#0F172A] text-[#0A236E] border border-[#0A236E]/20 shadow-lg flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

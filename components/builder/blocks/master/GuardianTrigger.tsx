// src/components/builder/blocks/master/GuardianTrigger.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye } from "lucide-react";
import { useGuardianStore } from "@/hooks/use-guardian-store";

export function GuardianTrigger() {
  const { isOpen, toggle } = useGuardianStore();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center border-2 border-indigo-400/50 backdrop-blur-md transition-colors"
        >
          <ScanEye size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
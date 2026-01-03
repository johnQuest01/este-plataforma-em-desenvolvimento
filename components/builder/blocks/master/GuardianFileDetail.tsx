// src/components/builder/blocks/master/GuardianFileDetail.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuardianFileDetailProps {
  file: string;
  type: 'UI' | 'LOGIC';
  onClose: () => void;
}

export function GuardianFileDetail({ file, type, onClose }: GuardianFileDetailProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute inset-0 bg-[#0c0c0e] z-50 p-8 flex flex-col border-l border-zinc-800 shadow-2xl"
    >
      <div className="flex justify-between items-start mb-8 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider", type === 'UI' ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400")}>
              {type} Component
            </span>
          </div>
          <h3 className="text-xl font-black text-white break-all leading-tight">{file.split('/').pop()}</h3>
          <p className="text-xs text-zinc-500 font-mono mt-2">{file}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"><X size={20} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
          Visualização detalhada do código em breve.
      </div>
    </motion.div>
  );
}
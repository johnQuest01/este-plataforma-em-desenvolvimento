// components/builder/blocks/GuardianTrigger.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGuardianStore } from '@/hooks/use-guardian-store';

export const GuardianTrigger: React.FC = () => {
  const { isOpen, toggle } = useGuardianStore();

  // Só renderiza em desenvolvimento
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`fixed bottom-8 right-8 z-[10000] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-colors duration-500 border backdrop-blur-md ${
        isOpen 
          ? "bg-white text-zinc-950 border-white" 
          : "bg-indigo-600/90 text-white border-indigo-400/50"
      }`}
    >
      {isOpen ? (
        <ShieldCheck size={24} strokeWidth={2.5} />
      ) : (
        <div className="relative">
          <ShieldAlert size={24} strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </motion.button>
  );
};
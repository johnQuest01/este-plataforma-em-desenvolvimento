// components/builder/blocks/ThemeLever.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { updateGuardianThemeAction } from "@/app/actions/guardian-preferences";

export const ThemeLever: React.FC = () => {
  const { theme, setTheme } = useGuardianStore();

  const handleToggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    
    // Atualização Otimista (Zustand)
    setTheme(newTheme);
    
    // Persistência (Server Action)
    try {
      await updateGuardianThemeAction({ theme: newTheme });
    } catch (error) {
      console.error("Failed to persist theme", error);
    }
  };

  return (
    <div 
      onClick={handleToggle}
      className="relative w-14 h-7 bg-black/20 dark:bg-white/10 rounded-full cursor-pointer p-1 flex items-center border border-black/5 dark:border-white/10 transition-colors"
    >
      <motion.div
        animate={{ x: theme === "dark" ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white dark:bg-indigo-500 rounded-full shadow-lg flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Moon size={10} className="text-white fill-white" />
        ) : (
          <Sun size={10} className="text-amber-500 fill-amber-500" />
        )}
      </motion.div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none opacity-20">
        <Sun size={10} className="text-zinc-950 dark:text-white" />
        <Moon size={10} className="text-zinc-950 dark:text-white" />
      </div>
    </div>
  );
};
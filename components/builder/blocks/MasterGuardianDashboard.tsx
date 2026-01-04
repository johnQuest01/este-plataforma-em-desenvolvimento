// src/components/builder/blocks/MasterGuardianDashboard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { runFullProjectAuditAction } from "@/app/actions/guardian";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";

// Import Lego Blocks
import { GuardianTrigger } from "./master/GuardianTrigger";
import { GuardianHeader, DashboardView } from "./master/GuardianHeader";
import { GuardianSidebar } from "./master/GuardianSidebar";
import { GuardianViewManager } from "./master/GuardianViewManager";

export function MasterGuardianDashboard() {
  const pathname = usePathname();
  const { isOpen } = useGuardianStore();
 
  // Local State
  const [view, setView] = useState<DashboardView>('SCANNER');
  const [loading, setLoading] = useState<boolean>(false);
 
  // Estado de Foco (Qual arquivo estamos analisando especificamente?)
  const [focusedFile, setFocusedFile] = useState<string | undefined>(undefined);
 
  // Estado de Inspeção Visual (Mantido para uso futuro na Sidebar, mas sem overlay por enquanto)
  const [inspectingFile, setInspectingFile] = useState<{ name: string, type: 'UI' | 'LOGIC' } | null>(null);
 
  const [data, setData] = useState<GuardianAuditResponse | null>(null);

  // Data Fetching Inteligente
  const performOmniscientScan = useCallback(async () => {
    setLoading(true);
    try {
      // Passamos o focusedFile para o servidor recalcular as métricas
      const result = await runFullProjectAuditAction(pathname, focusedFile);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [pathname, focusedFile]);

  // Auto-scan ao abrir ou mudar o foco
  useEffect(() => {
    if (isOpen) performOmniscientScan();
  }, [isOpen, performOmniscientScan]);

  // Resetar foco ao mudar de rota
  useEffect(() => {
    setFocusedFile(undefined);
  }, [pathname]);

  // Safety check: Only render in Dev
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      {/* 1. Floating Trigger */}
      <GuardianTrigger />

      {/* 2. Main Dashboard Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col p-6 overflow-hidden font-sans"
          >
            {/* Header Block */}
            <GuardianHeader
              pathname={pathname}
              currentView={view}
              onViewChange={setView}
              onRefresh={performOmniscientScan}
              loading={loading}
            />

            {/* Main Workspace */}
            <div className="flex-1 flex gap-6 overflow-hidden relative">
             
              {/* Sidebar Block */}
              <GuardianSidebar
                data={data}
                activeFile={focusedFile}
                onFocusFile={(file) => setFocusedFile(file)}
                onInspectFile={(name, type) => setInspectingFile({ name, type })}
                onClearFocus={() => setFocusedFile(undefined)}
              />

              {/* Dynamic Content Area */}
              <div className="flex-1 bg-zinc-900/20 rounded-[3rem] border border-zinc-800/50 relative overflow-hidden flex flex-col">
               
                {/* View Manager Block */}
                <GuardianViewManager view={view} data={data} />
               
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
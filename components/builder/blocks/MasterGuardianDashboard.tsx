// src/components/builder/blocks/MasterGuardianDashboard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { runFullProjectAuditAction } from "@/app/actions/guardian";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";
// ✅ Importação do HOC Guardian
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// Import Lego Blocks
import { GuardianTrigger } from "./master/GuardianTrigger";
import { GuardianHeader, DashboardView } from "./master/GuardianHeader";
import { GuardianSidebar } from "./master/GuardianSidebar";

// ✅ CORREÇÃO DE IMPORTAÇÃO: Apontando para a nova estrutura em 'viewmanager'
import { GuardianViewManager } from "./master/viewmanager/GuardianViewManager";

// 1. Componente Base
function MasterGuardianDashboardBase() {
  const pathname = usePathname();
  const { isOpen } = useGuardianStore();
 
  // Local State
  const [view, setView] = useState<DashboardView>('SCANNER');
  const [loading, setLoading] = useState<boolean>(false);
 
  // Estado de Foco
  const [focusedFile, setFocusedFile] = useState<string | undefined>(undefined);
 
  // Estado de Inspeção Visual
  const [inspectingFile, setInspectingFile] = useState<{ name: string, type: 'UI' | 'LOGIC' } | null>(null);
 
  const [data, setData] = useState<GuardianAuditResponse | null>(null);

  // Data Fetching Inteligente
  const performOmniscientScan = useCallback(async () => {
    setLoading(true);
    try {
      const result = await runFullProjectAuditAction(pathname, focusedFile);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [pathname, focusedFile]);

  // Auto-scan
  useEffect(() => {
    if (isOpen) performOmniscientScan();
  }, [isOpen, performOmniscientScan]);

  // Resetar foco
  useEffect(() => {
    setFocusedFile(undefined);
  }, [pathname]);

  // Safety check
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      <GuardianTrigger />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col p-6 overflow-hidden font-sans"
          >
            <GuardianHeader
              pathname={pathname}
              currentView={view}
              onViewChange={setView}
              onRefresh={performOmniscientScan}
              loading={loading}
            />

            <div className="flex-1 flex gap-6 overflow-hidden relative">
              <GuardianSidebar
                data={data}
                activeFile={focusedFile}
                onFocusFile={(file) => setFocusedFile(file)}
                onInspectFile={(name, type) => setInspectingFile({ name, type })}
                onClearFocus={() => setFocusedFile(undefined)}
              />

              <div className="flex-1 bg-zinc-900/20 rounded-[3rem] border border-zinc-800/50 relative overflow-hidden flex flex-col">
                <GuardianViewManager view={view} data={data} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 2. Exportação com Etiqueta
export const MasterGuardianDashboard = withGuardian(
  MasterGuardianDashboardBase,
  "components/builder/blocks/MasterGuardianDashboard.tsx",
  "UI_COMPONENT"
);
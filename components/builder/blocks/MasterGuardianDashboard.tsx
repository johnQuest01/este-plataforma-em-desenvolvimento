// src/components/builder/blocks/MasterGuardianDashboard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { runFullProjectAuditAction } from "@/app/actions/guardian";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// Import Lego Blocks
import { GuardianTrigger } from "./master/GuardianTrigger";
import { GuardianHeader, DashboardView } from "./master/GuardianHeader";
import { GuardianSidebar } from "./master/GuardianSidebar";
import { GuardianViewManager } from "./master/viewmanager/GuardianViewManager";

function MasterGuardianDashboardBase() {
  const pathname = usePathname();
  const { isOpen } = useGuardianStore();
 
  // Local State
  const [view, setView] = useState<DashboardView>('SCANNER');
  const [loading, setLoading] = useState<boolean>(false);
  const [focusedFile, setFocusedFile] = useState<string | undefined>(undefined);
  const [data, setData] = useState<GuardianAuditResponse | null>(null);

  // ✅ NOVO: Estado para controlar a Sidebar no Mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const performOmniscientScan = useCallback(async () => {
    setLoading(true);
    try {
      const result = await runFullProjectAuditAction(pathname, focusedFile);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [pathname, focusedFile]);

  useEffect(() => {
    if (isOpen) performOmniscientScan();
  }, [isOpen, performOmniscientScan]);

  useEffect(() => {
    setFocusedFile(undefined);
    setIsMobileSidebarOpen(false); // Fecha sidebar ao navegar
  }, [pathname]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      <GuardianTrigger />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            // ✅ LAYOUT RESPONSIVO: Padding menor no mobile, fundo total
            className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col p-2 md:p-6 overflow-hidden font-sans"
          >
            {/* Header com controle de Menu Mobile */}
            <GuardianHeader
              pathname={pathname}
              currentView={view}
              onViewChange={setView}
              onRefresh={performOmniscientScan}
              loading={loading}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            />

            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden relative mt-2 md:mt-0">
              
              {/* 
                 ✅ SIDEBAR RESPONSIVA (DRAWER)
                 - Desktop: Exibição normal (block)
                 - Mobile: Absolute, desliza da esquerda ou aparece como modal
              */}
              <AnimatePresence>
                {(isMobileSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`
                      absolute inset-0 z-50 md:static md:z-auto md:block
                      ${isMobileSidebarOpen ? 'block' : 'hidden md:block'}
                    `}
                  >
                    <div className="h-full w-full md:w-80 bg-[#050505] md:bg-transparent pr-2 md:pr-0">
                        <GuardianSidebar
                            data={data}
                            activeFile={focusedFile}
                            onFocusFile={(file) => {
                                setFocusedFile(file);
                                setIsMobileSidebarOpen(false); // Fecha ao selecionar no mobile
                            }}
                            onClearFocus={() => setFocusedFile(undefined)}
                        />
                        {/* Botão fechar menu mobile */}
                        <button 
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="md:hidden absolute top-4 right-4 p-2 bg-zinc-800 text-white rounded-full"
                        >
                            ✕
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Área Principal */}
              <div className="flex-1 bg-zinc-900/20 rounded-2xl md:rounded-[3rem] border border-zinc-800/50 relative overflow-hidden flex flex-col">
                <GuardianViewManager view={view} data={data} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const MasterGuardianDashboard = withGuardian(
  MasterGuardianDashboardBase,
  "components/builder/blocks/MasterGuardianDashboard.tsx",
  "UI_COMPONENT"
);
// src/components/builder/blocks/MasterGuardianDashboard.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
 
  // Local State
  const [view, setView] = useState<DashboardView>('SCANNER');
  const [loading, setLoading] = useState<boolean>(false);
  const [focusedFile, setFocusedFile] = useState<string | undefined>(undefined);
  const [inspectingFile, setInspectingFile] = useState<{ name: string, type: 'UI' | 'LOGIC' } | null>(null);
  const [data, setData] = useState<GuardianAuditResponse | null>(null);

  // Estado para Sidebar Mobile
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
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      <GuardianTrigger />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Transparente (Permite ver o app atrás, mas foca na janela) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
            />

            {/* JANELA FLUTUANTE COMPACTA */}
            <motion.div
              ref={containerRef}
              drag
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
              dragListener={false} // Arrasto controlado apenas pelo Header
              
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              
              className={`
                fixed z-[9999] flex flex-col overflow-hidden font-sans shadow-2xl border border-zinc-800/90 bg-[#09090b]
                /* Mobile: Compacto e Flutuante */
                w-[94vw] h-[75vh] left-[3vw] top-[12.5vh] rounded-2xl
                /* Desktop: Janela Confortável */
                md:w-[900px] md:h-[650px] md:left-[calc(50%-450px)] md:top-[calc(50%-325px)] md:rounded-3xl
              `}
            >
              {/* Header (Área de Arrasto) */}
              <div onPointerDown={(e) => {}}>
                 <GuardianHeader
                    pathname={pathname}
                    currentView={view}
                    onViewChange={setView}
                    onRefresh={performOmniscientScan}
                    loading={loading}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                 />
              </div>

              {/* Corpo do Painel */}
              <div 
                className="flex-1 flex overflow-hidden relative bg-zinc-950/50"
                onPointerDown={(e) => e.stopPropagation()} 
              >
                
                {/* Sidebar (Drawer no Mobile) */}
                <div className={`
                    absolute inset-y-0 left-0 z-30 w-64 bg-zinc-900/95 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out shadow-2xl
                    md:relative md:translate-x-0 md:bg-transparent md:border-r-0 md:w-64 md:shadow-none
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <GuardianSidebar
                        data={data}
                        activeFile={focusedFile}
                        onFocusFile={(file) => {
                            setFocusedFile(file);
                            setIsMobileSidebarOpen(false);
                        }}
                        onInspectFile={(name, type) => setInspectingFile({ name, type })}
                        onClearFocus={() => setFocusedFile(undefined)}
                    />
                </div>

                {/* Área Principal */}
                <div className="flex-1 flex flex-col overflow-hidden relative bg-zinc-900/30 md:rounded-tl-2xl border-l border-zinc-800/50">
                   {/* Overlay para fechar sidebar no mobile */}
                   {isMobileSidebarOpen && (
                       <div 
                           className="absolute inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                           onClick={() => setIsMobileSidebarOpen(false)}
                       />
                   )}
                   
                   <GuardianViewManager view={view} data={data} />
                </div>

              </div>
            </motion.div>
          </>
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
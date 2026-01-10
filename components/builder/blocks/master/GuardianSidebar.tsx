// src/components/builder/blocks/master/GuardianSidebar.tsx
"use client";

import React from "react";
import { Layers, Eye, Box, Target, RotateCcw, Maximize } from "lucide-react";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";

interface GuardianSidebarProps {
  data: GuardianAuditResponse | null;
  activeFile?: string;
  onFocusFile: (file: string) => void;
  // Tornamos opcional (?) para não quebrar o MasterGuardianDashboard que removeu o estado de inspeção
  onInspectFile?: (file: string, type: 'UI' | 'LOGIC') => void;
  onClearFocus: () => void;
}

export function GuardianSidebar({ data, activeFile, onFocusFile, onInspectFile, onClearFocus }: GuardianSidebarProps) {
  const { setTab } = useGuardianStore();
  const isFocusMode = !!activeFile;
  const popups = data?.screenMetadata.potentialPopups || [];

  const handleNavigateToCodeMap = (file: string) => {
    onFocusFile(file);
    // Verificação de segurança antes de chamar
    if (onInspectFile) {
      onInspectFile(file, 'UI');
    }
    setTab('CODE_MAP');
  };

  return (
    // ✅ RESPONSIVIDADE: w-full no mobile, w-80 no desktop
    <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 h-full">
      <div className={cn(
        "p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border backdrop-blur-sm flex flex-col h-full overflow-hidden transition-all duration-300",
        isFocusMode ? "bg-indigo-950/30 border-indigo-500/30 shadow-lg shadow-indigo-900/20" : "bg-zinc-900/90 md:bg-zinc-900/30 border-zinc-800/50"
      )}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className={cn(
            "text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
            isFocusMode ? "text-indigo-400" : "text-zinc-500"
          )}>
            {isFocusMode ? <Target className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {isFocusMode ? "Modo Foco" : "Arquivos da Rota"}
          </h3>
         
          {isFocusMode && (
            <button
              onClick={onClearFocus}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors"
              title="Voltar"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {/* Conteúdo da Sidebar */}
          {!isFocusMode && popups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Maximize size={10} className="text-amber-400" />
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
                  Popups ({popups.length})
                </span>
              </div>
              <div className="space-y-2">
                {popups.map(popupFile => (
                  <button
                    key={popupFile}
                    onClick={() => handleNavigateToCodeMap(popupFile)}
                    className="w-full p-3 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-left transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Box size={14} className="text-amber-400 shrink-0" />
                      <span className="text-[10px] font-bold text-amber-100 truncate">
                        {popupFile.split('/').pop()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {data?.screenMetadata.responsibleFile && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider",
                  isFocusMode ? "text-indigo-400" : "text-zinc-500"
                )}>
                  {isFocusMode ? "ARQUIVO ATIVO" : "PÁGINA PRINCIPAL"}
                </span>
              </div>
              <div
                onClick={() => handleNavigateToCodeMap(data.screenMetadata.responsibleFile)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left group relative transition-all border cursor-pointer active:scale-95",
                  isFocusMode
                    ? "bg-indigo-600/20 border-indigo-500/50"
                    : "bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Eye size={14} className={cn("shrink-0", isFocusMode ? "text-indigo-300" : "text-zinc-400")} />
                    <span className={cn("text-xs font-bold truncate", isFocusMode ? "text-white" : "text-zinc-200")}>
                      {data.screenMetadata.responsibleFile.split('/').pop()}
                    </span>
                  </div>
                </div>
                <p className={cn("text-[9px] truncate font-mono mt-1", isFocusMode ? "text-indigo-300" : "text-zinc-500")}>
                  {data.screenMetadata.responsibleFile}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">
                {isFocusMode ? "Dependências" : "Componentes"}
              </span>
              <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                {data?.screenMetadata.relatedFiles.ui.length || 0}
              </span>
            </div>

            {data?.screenMetadata.relatedFiles.ui.map((file) => (
              <div
                key={file}
                onClick={() => handleNavigateToCodeMap(file)}
                className="w-full text-left p-3 bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800/50 rounded-xl transition-all group flex items-center justify-between cursor-pointer active:scale-95"
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <Box size={14} className="text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-200 truncate transition-colors">
                      {file.split('/').pop()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
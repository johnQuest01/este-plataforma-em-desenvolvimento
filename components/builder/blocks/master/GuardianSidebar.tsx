// src/components/builder/blocks/master/GuardianSidebar.tsx
"use client";

import React from "react";
import { Layers, Eye, Box, Target, RotateCcw, Maximize, ArrowRight } from "lucide-react";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";

interface GuardianSidebarProps {
  data: GuardianAuditResponse | null;
  activeFile?: string;
  onFocusFile: (file: string) => void;
  onInspectFile?: (file: string, type: 'UI' | 'LOGIC') => void;
  onClearFocus: () => void;
}

export function GuardianSidebar({ data, activeFile, onFocusFile, onInspectFile, onClearFocus }: GuardianSidebarProps) {
  const { setTab } = useGuardianStore();
  const isFocusMode = !!activeFile;
  const popups = data?.screenMetadata.potentialPopups || [];

  const handleNavigateToCodeMap = (file: string) => {
    onFocusFile(file);
    if (onInspectFile) onInspectFile(file, 'UI');
    setTab('CODE_MAP');
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/50">
      {/* Header da Sidebar */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900">
          <h3 className={cn(
            "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
            isFocusMode ? "text-indigo-400" : "text-zinc-500"
          )}>
            {isFocusMode ? <Target className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
            {isFocusMode ? "Foco" : "Estrutura"}
          </h3>
         
          {isFocusMode && (
            <button
              onClick={onClearFocus}
              className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors border border-zinc-700"
            >
              <RotateCcw size={10} />
            </button>
          )}
      </div>

      {/* Lista Scrollável */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
        
        {/* Popups */}
        {!isFocusMode && popups.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <Maximize size={10} className="text-amber-400" />
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                Popups ({popups.length})
              </span>
            </div>
            <div className="space-y-1">
              {popups.map(popupFile => (
                <button
                  key={popupFile}
                  onClick={() => handleNavigateToCodeMap(popupFile)}
                  className="w-full p-2 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 rounded-md text-left transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Box size={12} className="text-amber-500/70 shrink-0" />
                    <span className="text-[10px] font-medium text-amber-200/80 truncate">
                      {popupFile.split('/').pop()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Arquivo Principal */}
        {data?.screenMetadata.responsibleFile && (
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                isFocusMode ? "text-indigo-400" : "text-zinc-500"
              )}>
                {isFocusMode ? "Ativo" : "Principal"}
              </span>
            </div>
            <div
              onClick={() => handleNavigateToCodeMap(data.screenMetadata.responsibleFile)}
              className={cn(
                "w-full p-2.5 rounded-lg text-left group relative transition-all border cursor-pointer active:scale-95",
                isFocusMode
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/60"
            )}>
              <div className="flex items-center gap-2 overflow-hidden">
                <Eye size={12} className={cn("shrink-0", isFocusMode ? "text-indigo-400" : "text-zinc-400")} />
                <span className={cn("text-[10px] font-bold truncate", isFocusMode ? "text-indigo-100" : "text-zinc-300")}>
                  {data.screenMetadata.responsibleFile.split('/').pop()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dependências */}
        <div>
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                {isFocusMode ? "Deps" : "Componentes"}
              </span>
              <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700">
                {data?.screenMetadata.relatedFiles.ui.length || 0}
              </span>
            </div>

            <div className="space-y-1">
                {data?.screenMetadata.relatedFiles.ui.map((file) => (
                <div
                    key={file}
                    onClick={() => handleNavigateToCodeMap(file)}
                    className="w-full text-left p-2 bg-zinc-800/20 hover:bg-zinc-800/50 border border-zinc-800/30 rounded-md transition-all group flex items-center justify-between cursor-pointer active:scale-95"
                >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <Box size={12} className="text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                    <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 truncate transition-colors">
                        {file.split('/').pop()}
                    </span>
                    </div>
                </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
// src/components/builder/blocks/master/GuardianSidebar.tsx
"use client";

import React from "react";
import { Layers, Eye, Box } from "lucide-react";
import { GuardianAuditResponse } from "@/schemas/guardian-schema";

interface GuardianSidebarProps {
  data: GuardianAuditResponse | null;
  onSelectFile: (file: string, type: 'UI' | 'LOGIC') => void;
}

export function GuardianSidebar({ data, onSelectFile }: GuardianSidebarProps) {
  return (
    <div className="w-80 flex flex-col gap-4 shrink-0">
      <div className="p-6 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4" /> Arquivos da Rota
          </h3>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-mono">
            {data?.screenMetadata.relatedFiles.ui.length || 0} FILES
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {data?.screenMetadata.responsibleFile && (
            <button 
              onClick={() => onSelectFile(data.screenMetadata.responsibleFile, 'UI')}
              className="w-full p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-left group hover:bg-indigo-600/20 transition-all mb-4"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-indigo-400 uppercase">MAIN PAGE</span>
                <Eye size={12} className="text-indigo-400" />
              </div>
              <p className="text-xs font-bold text-indigo-100 truncate">{data.screenMetadata.responsibleFile.split('/').pop()}</p>
            </button>
          )}

          {data?.screenMetadata.relatedFiles.ui.map((file) => (
            <button 
              key={file}
              onClick={() => onSelectFile(file, 'UI')}
              className="w-full text-left p-3 bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800/50 rounded-xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Box size={14} className="text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                <p className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-200 truncate transition-colors">
                  {file.split('/').pop()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
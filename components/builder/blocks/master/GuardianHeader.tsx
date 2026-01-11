// src/components/builder/blocks/master/GuardianHeader.tsx
"use client";

import React from "react";
import { ShieldAlert, RefreshCw, X, Eye, Database, Activity, History, FolderOpen, Link as LinkIcon, Map, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";

export type DashboardView = 'SCANNER' | 'CODE_MAP' | 'AUDIT' | 'HISTORY' | 'DATABASE' | 'FILES' | 'CONNECTIONS';

const DASHBOARD_TABS: { id: DashboardView; icon: React.ElementType; label: string }[] = [
  { id: 'SCANNER', icon: Eye, label: 'Tela' },
  { id: 'CODE_MAP', icon: Map, label: 'Código' },
  { id: 'CONNECTIONS', icon: LinkIcon, label: 'Fluxo' },
  { id: 'FILES', icon: FolderOpen, label: 'Arqs' },
  { id: 'DATABASE', icon: Database, label: 'Dados' },
  { id: 'AUDIT', icon: Activity, label: 'Diag' },
  { id: 'HISTORY', icon: History, label: 'Hist' }
];

interface GuardianHeaderProps {
  pathname: string;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onRefresh: () => void;
  loading: boolean;
  onToggleMobileSidebar: () => void;
}

export function GuardianHeader({ pathname, currentView, onViewChange, onRefresh, loading, onToggleMobileSidebar }: GuardianHeaderProps) {
  const { toggle } = useGuardianStore();

  return (
    // Header Compacto e Arrastável
    <div className="flex flex-col gap-3 p-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md shrink-0 cursor-grab active:cursor-grabbing select-none">
      
      {/* Linha Superior: Controles e Título */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
            {/* Menu Hamburger (Mobile) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleMobileSidebar(); }}
                className="md:hidden p-1.5 bg-zinc-800 rounded-md text-zinc-400 hover:text-white border border-zinc-700"
            >
                <Menu size={16} />
            </button>

            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
               <ShieldAlert className="text-white w-4 h-4" />
            </div>
            
            <div className="min-w-0 flex flex-col">
                <h1 className="text-xs font-black text-white uppercase tracking-tight leading-none">Guardian OS</h1>
                <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[120px] leading-tight">
                    {pathname}
                </span>
            </div>
        </div>

        {/* Ações Rápidas (Mobile) */}
        <div className="flex items-center gap-1.5 md:hidden">
            <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className="p-1.5 bg-zinc-800 rounded-md text-zinc-400 hover:text-white border border-zinc-700">
                <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="p-1.5 bg-red-500/10 rounded-md text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20">
                <X size={14} />
            </button>
        </div>

        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={onRefresh} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </button>
            <button onClick={toggle} className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <X size={14} />
            </button>
        </div>
      </div>

      {/* Linha Inferior: Navegação (Scroll Horizontal Otimizado) */}
      <div className="w-full overflow-x-auto scrollbar-hide" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex gap-1 w-max">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all whitespace-nowrap border",
                currentView === tab.id 
                    ? "bg-zinc-800 text-white border-zinc-700 shadow-sm" 
                    : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300"
              )}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
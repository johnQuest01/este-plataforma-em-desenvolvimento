// src/components/builder/blocks/master/GuardianHeader.tsx
"use client";

import React from "react";
import { ShieldAlert, RefreshCw, X, Eye, Database, Activity, History, FolderOpen, Link as LinkIcon, Map, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";

export type DashboardView = 'SCANNER' | 'CODE_MAP' | 'CONNECTIONS' | 'FILES' | 'DATABASE' | 'AUDIT' | 'HISTORY';

const DASHBOARD_TABS: { id: DashboardView; icon: React.ElementType; label: string }[] = [
  { id: 'SCANNER', icon: Eye, label: 'Tela' }, // Label encurtada para mobile
  { id: 'CODE_MAP', icon: Map, label: 'Código' },
  { id: 'CONNECTIONS', icon: LinkIcon, label: 'Conexão' },
  { id: 'FILES', icon: FolderOpen, label: 'Arquivos' },
  { id: 'DATABASE', icon: Database, label: 'Dados' },
  { id: 'AUDIT', icon: Activity, label: 'Diag.' },
  { id: 'HISTORY', icon: History, label: 'Hist.' }
];

interface GuardianHeaderProps {
  pathname: string;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onRefresh: () => void;
  loading: boolean;
  onToggleMobileSidebar: () => void; // ✅ Nova prop
}

export function GuardianHeader({ pathname, currentView, onViewChange, onRefresh, loading, onToggleMobileSidebar }: GuardianHeaderProps) {
  const { toggle } = useGuardianStore();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-6 shrink-0 bg-zinc-900/50 p-3 md:p-4 rounded-2xl md:rounded-[2rem] border border-zinc-800/50 backdrop-blur-md gap-3 md:gap-0">
      
      {/* Topo: Logo + Botões de Ação Mobile */}
      <div className="flex items-center justify-between w-full md:w-auto gap-5">
        <div className="flex items-center gap-3 md:gap-5">
            {/* Botão Menu Mobile */}
            <button 
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
            >
                <Menu size={18} />
            </button>

            <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldAlert className="text-white w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
                <h1 className="text-sm md:text-lg font-black text-white uppercase tracking-tight leading-none">Guardian OS</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] md:text-[10px] font-mono text-zinc-400 uppercase tracking-wider truncate max-w-[120px] md:max-w-none">
                    {pathname}
                    </span>
                </div>
            </div>
        </div>

        {/* Botões de Fechar/Refresh (Mobile: ficam no topo direito) */}
        <div className="flex md:hidden items-center gap-2">
             <button onClick={onRefresh} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </button>
            <button onClick={toggle} className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
                <X size={16} />
            </button>
        </div>
      </div>

      {/* Navegação (Scrollable no Mobile) */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
        <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-hide w-full md:w-auto">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase transition-all whitespace-nowrap shrink-0",
                currentView === tab.id ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon size={12} className="md:w-[14px] md:h-[14px]" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botões Desktop (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2">
            <button onClick={onRefresh} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
            <button onClick={toggle} className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <X size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
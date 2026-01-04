// src/components/builder/blocks/master/GuardianHeader.tsx
"use client";

import React from "react";
import { ShieldAlert, RefreshCw, X, Eye, Database, Activity, History, FolderOpen, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";

// Adicionado 'CONNECTIONS' ao tipo
export type DashboardView = 'SCANNER' | 'AUDIT' | 'HISTORY' | 'DATABASE' | 'FILES' | 'CONNECTIONS';

// Adicionado o botão na configuração
const DASHBOARD_TABS: { id: DashboardView; icon: React.ElementType; label: string }[] = [
  { id: 'SCANNER', icon: Eye, label: 'Tela Ativa' },
  { id: 'CONNECTIONS', icon: LinkIcon, label: 'Conexão' }, // ✅ NOVO
  { id: 'FILES', icon: FolderOpen, label: 'Arquivos' },
  { id: 'DATABASE', icon: Database, label: 'Dados' },
  { id: 'AUDIT', icon: Activity, label: 'Diagnóstico' },
  { id: 'HISTORY', icon: History, label: 'Histórico' }
];

interface GuardianHeaderProps {
  pathname: string;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function GuardianHeader({ pathname, currentView, onViewChange, onRefresh, loading }: GuardianHeaderProps) {
  const { toggle } = useGuardianStore();

  return (
    <div className="flex items-center justify-between mb-6 shrink-0 bg-zinc-900/50 p-4 rounded-[2rem] border border-zinc-800/50 backdrop-blur-md">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ShieldAlert className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tight leading-none">Guardian OS</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Monitoring: {pathname}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-800">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                currentView === tab.id ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
          <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
        <button onClick={toggle} className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Code2, 
  Database, 
  Map as MapIcon, 
  RefreshCw, 
  X, 
  LayoutTemplate, 
  Palette,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

import { runFullProjectAuditAction } from "@/app/actions/guardian";
import { DiagnosticIssue } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { cn } from "@/lib/utils";

// Componente de Botão de Filtro
const FilterButton = ({ 
  active, 
  onClick, 
  label, 
  count, 
  colorClass 
}: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  count: number;
  colorClass: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
      active 
        ? `bg-white text-black border-transparent shadow-lg scale-105` 
        : `bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200`
    )}
  >
    <div className={cn("w-2 h-2 rounded-full", colorClass)} />
    {label}
    <span className="ml-1 opacity-60 text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md">{count}</span>
  </button>
);

export function MasterGuardianDashboard() {
  // Agora a Store possui todas as propriedades tipadas corretamente
  const { isOpen, toggle, activeTab, setTab, activeFilter, setFilter, theme } = useGuardianStore();
  const [report, setReport] = useState<DiagnosticIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const performScan = useCallback(async (isInitial: boolean = false) => {
    if (!isInitial) setLoading(true);
    try {
      const data = await runFullProjectAuditAction();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (isOpen) performScan(true); 
  }, [performScan, isOpen]);

  // Filtragem Lógica
  const filteredReport = report.filter(issue => {
    if (activeFilter === 'ALL') return true;
    return issue.layer === activeFilter;
  });

  // Contadores
  const counts = {
    any: report.filter(i => i.layer === 'STRICT_TYPING').length,
    logic: report.filter(i => i.layer === 'BACKEND_LOGIC' || i.layer === 'NAMING_CONVENTION').length,
    ui: report.filter(i => i.layer === 'UI_STYLING').length
  };

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Main Dashboard Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            // Aplicamos a classe 'dark' se o tema for escuro para garantir consistência visual
            className={cn(
              "fixed inset-0 m-auto w-[95vw] h-[85vh] max-w-[1200px] bg-[#09090b] border border-zinc-800 rounded-[2rem] shadow-2xl z-[9999] flex overflow-hidden ring-1 ring-white/10",
              theme === 'dark' ? 'dark' : ''
            )}
          >
            
            {/* 1. Sidebar de Navegação */}
            <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <ShieldAlert className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-white font-black text-lg tracking-tight leading-none">GUARDIAN</h1>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Architect v5.0</span>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button 
                    onClick={() => setTab('AUDIT')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      activeTab === 'AUDIT' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    <Code2 size={18} /> Auditoria de Código
                  </button>
                  <button 
                    onClick={() => setTab('MAP')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      activeTab === 'MAP' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    <MapIcon size={18} /> Mapa do Sistema
                  </button>
                </nav>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Status do Sistema</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  Next.js 16.1.1<br/>Prisma 6.1.0<br/>Strict Mode: ON
                </div>
              </div>
            </div>

            {/* 2. Área Principal de Conteúdo */}
            <div className="flex-1 flex flex-col bg-[#0c0c0e]">
              
              {/* Header da Área Principal */}
              <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-8">
                <div>
                  <h2 className="text-white font-bold text-xl">
                    {activeTab === 'AUDIT' ? 'Relatório de Integridade' : 'Editor Visual & Mapa'}
                  </h2>
                  <p className="text-zinc-500 text-xs">
                    {activeTab === 'AUDIT' ? 'Análise estática em tempo real' : 'Configuração global de componentes'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => performScan(false)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    {loading ? "Escaneando..." : "Executar Scan"}
                  </button>
                  <button onClick={toggle} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo Dinâmico */}
              <div className="flex-1 overflow-hidden relative">
                
                {/* TAB: AUDITORIA */}
                {activeTab === 'AUDIT' && (
                  <div className="h-full flex flex-col">
                    {/* Barra de Filtros */}
                    <div className="px-8 py-4 border-b border-zinc-800 flex gap-3 overflow-x-auto">
                      <FilterButton 
                        active={activeFilter === 'ALL'} 
                        onClick={() => setFilter('ALL')} 
                        label="Todos" 
                        count={report.length} 
                        colorClass="bg-zinc-500" 
                      />
                      <FilterButton 
                        active={activeFilter === 'STRICT_TYPING'} 
                        onClick={() => setFilter('STRICT_TYPING')} 
                        label="Erros de Any" 
                        count={counts.any} 
                        colorClass="bg-red-500" 
                      />
                      <FilterButton 
                        active={activeFilter === 'BACKEND_LOGIC'} 
                        onClick={() => setFilter('BACKEND_LOGIC')} 
                        label="Lógica & Banco" 
                        count={counts.logic} 
                        colorClass="bg-amber-500" 
                      />
                    </div>

                    {/* Lista de Erros */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                      {report.length === 0 && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                          <CheckCircle2 size={64} className="mb-4 text-emerald-500/20" />
                          <p className="text-lg font-medium text-zinc-400">Nenhuma violação detectada.</p>
                        </div>
                      ) : (
                        filteredReport.map((issue) => (
                          <motion.div 
                            layout
                            key={issue.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 p-5 rounded-2xl transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                  issue.severity === 'CRITICAL' ? "bg-red-500/10 text-red-400" :
                                  issue.severity === 'HIGH' ? "bg-orange-500/10 text-orange-400" :
                                  "bg-blue-500/10 text-blue-400"
                                )}>
                                  {issue.layer}
                                </span>
                                {/* Caminho Completo sem Abreviação */}
                                <code className="text-xs text-zinc-500 font-mono break-all">
                                  {issue.file}
                                </code>
                              </div>
                              <span className="text-[10px] text-zinc-600">{new Date(issue.timestamp).toLocaleTimeString()}</span>
                            </div>
                            
                            <h3 className="text-zinc-200 font-bold text-sm mb-2">{issue.message}</h3>
                            
                            <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50 flex gap-3">
                              <span className="text-lg">💡</span>
                              <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
                                {issue.suggestion}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: MAPA & EDITOR */}
                {activeTab === 'MAP' && (
                  <div className="h-full p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      {/* Card de Edição de Botões */}
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                          <LayoutTemplate className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Botões & Inputs</h3>
                        <p className="text-zinc-500 text-xs mb-6">Defina o arredondamento, padding e comportamento de hover global.</p>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-zinc-800 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700">Rounded</button>
                            <button className="flex-1 py-2 bg-zinc-800 rounded-full text-xs text-zinc-300 hover:bg-zinc-700">Pill</button>
                            <button className="flex-1 py-2 bg-zinc-800 rounded-none text-xs text-zinc-300 hover:bg-zinc-700">Sharp</button>
                          </div>
                        </div>
                      </div>

                      {/* Card de Edição de Cards */}
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                          <Database className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Cards & Containers</h3>
                        <p className="text-zinc-500 text-xs mb-6">Ajuste a elevação, sombras e bordas dos cards de produto.</p>
                        <div className="h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-600 text-xs">Preview Area</span>
                        </div>
                      </div>

                      {/* Card de Tipografia e Cores */}
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-600 transition-colors">
                          <Palette className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Cores & Texto</h3>
                        <p className="text-zinc-500 text-xs mb-6">Paleta global e escala tipográfica do sistema.</p>
                        <div className="flex gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 ring-2 ring-white/20 cursor-pointer" />
                          <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer opacity-50" />
                          <div className="w-8 h-8 rounded-full bg-rose-500 cursor-pointer opacity-50" />
                        </div>
                      </div>

                    </div>

                    <div className="mt-8 p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl flex gap-4 items-start">
                      <AlertTriangle className="text-indigo-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-indigo-200 font-bold text-sm">Modo de Edição Ativo</h4>
                        <p className="text-indigo-300/60 text-xs mt-1">
                          As alterações feitas aqui afetam o <code>GuardianConfig</code> no banco de dados e refletem em tempo real para todos os usuários.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
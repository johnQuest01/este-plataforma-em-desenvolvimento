"use client";

import React, { useEffect, useState, useCallback } from "react";
import { runFullProjectAuditAction } from "@/app/actions/guardian";
import { DiagnosticIssue } from "@/schemas/guardian-schema";

/**
 * MASTER GUARDIAN DASHBOARD - v2.1 (React 19 Optimized)
 * Cockpit de auditoria onisciente para desenvolvimento.
 */
export function MasterGuardianDashboard() {
  // Estado inicial já começa como true para evitar o setState síncrono no mount
  const [report, setReport] = useState<DiagnosticIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Memoização da função de scan para evitar recriações desnecessárias
  const performScan = useCallback(async (isInitial: boolean = false) => {
    // Só chamamos setLoading se não for a carga inicial (onde já é true)
    if (!isInitial) setLoading(true);
    
    try {
      const data = await runFullProjectAuditAction();
      setReport(data);
    } catch (error) {
      console.error("Guardian Scan Failure:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito de inicialização limpo
  useEffect(() => {
    // Dispara o scan inicial de forma assíncrona fora do fluxo síncrono do mount
    performScan(true);
  }, [performScan]);

  // Segurança: Não renderiza nada em ambiente de produção
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-6 left-6 w-[420px] max-h-[75vh] bg-zinc-950/95 border border-zinc-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[9999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
      
      {/* Header Estilizado */}
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-white font-black text-sm tracking-widest uppercase flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-300"></span>
            </span>
            Guardian Onisciente
          </h2>
          <p className="text-blue-100 text-[10px] font-medium opacity-80 uppercase tracking-tighter">Stack 2026 - Arquiteto Ativo</p>
        </div>
        <button 
          onClick={() => performScan(false)}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-50 p-3 rounded-2xl transition-all text-white text-[10px] font-bold uppercase tracking-widest border border-white/5"
        >
          {loading ? "Sincronizando..." : "Re-Scan"}
        </button>
      </div>

      {/* Área de Relatórios */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Mapeando Arquivos...</span>
          </div>
        ) : report.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-zinc-500 text-xs font-medium italic">Nenhum problema detectado. Arquitetura Nominal.</p>
          </div>
        ) : (
          report.map((issue) => (
            <div 
              key={issue.id} 
              className={`group p-4 rounded-3xl border transition-all duration-300 ${
                issue.severity === 'CRITICAL' 
                  ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                  issue.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {issue.layer}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono truncate max-w-[150px]">{issue.file}</span>
              </div>
              
              <h3 className="text-xs text-zinc-100 font-bold leading-relaxed">{issue.message}</h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{issue.suggestion}</p>

              {issue.mapGuide && (
                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs">📍</span>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Guia de Alteração</p>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium">
                    <span className="text-blue-400 mr-1 italic">Para {issue.mapGuide.action}:</span>
                    {issue.mapGuide.instruction}
                  </p>
                  <div className="mt-2 text-[9px] font-mono text-zinc-600 bg-black/30 p-2 rounded-lg break-all">
                    {issue.mapGuide.targetFile}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Informativo */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-center">
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          SaaS PWA POS - Monitoramento em Tempo Real
        </p>
      </div>
    </div>
  );
}
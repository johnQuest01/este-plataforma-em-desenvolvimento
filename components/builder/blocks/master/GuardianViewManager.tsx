// src/components/builder/blocks/master/GuardianViewManager.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Smartphone, CheckCircle2, AlertCircle, Database, Server, Cpu, History, FileCode,
  FolderOpen, Box, Layout, Zap, Code, FileJson, Braces, Wrench, Image as ImageIcon, FileText,
  Maximize, AlertTriangle, Link as LinkIcon, Unplug, Layers, Eye, FileEdit, GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GuardianAuditResponse, ProjectFile } from "@/schemas/guardian-schema";
import { ComponentNode } from "@/schemas/guardian-runtime-schema";
import { DashboardView } from "./GuardianHeader";
import { useGuardianStore } from "@/hooks/use-guardian-store";

interface GuardianViewManagerProps {
  view: DashboardView;
  data: GuardianAuditResponse | null;
}

// ✅ Componente Recursivo para Renderizar a Árvore
const ComponentTreeNode = ({ node }: { node: ComponentNode }) => {
  if (!node) return null;
  
  return (
    <div className="ml-4 border-l border-zinc-800 pl-4 py-1">
      <div className="flex items-center gap-2 group">
        <Box size={12} className="text-indigo-500" />
        <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
          {node.name}
        </span>
        {node.file && (
          <span className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-500">
            {node.file.split('/').pop()}
          </span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child, idx) => (
            <ComponentTreeNode key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export function GuardianViewManager({ view, data }: GuardianViewManagerProps) {
  const [fileSearch, setFileSearch] = useState("");
  const { activeRuntimeElements, currentRouteStructure } = useGuardianStore();

  const files = useMemo(() => data?.screenMetadata.projectStructure || [], [data]);
 
  const filteredFiles = useMemo(() => {
    const searchLower = fileSearch.toLowerCase();
    return files.filter(f =>
      f.path.toLowerCase().includes(searchLower) ||
      f.name.toLowerCase().includes(searchLower)
    );
  }, [files, fileSearch]);

  // ... (CONNECTIONS VIEW - Mantém igual) ...
  if (view === 'CONNECTIONS') {
     // ... (Código existente) ...
     const connected = data?.screenMetadata.connectivity.connected || [];
     const disconnected = data?.screenMetadata.connectivity.disconnected || [];
     return (
       <div className="h-full p-8 overflow-y-auto custom-scrollbar">
         <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <LinkIcon size={16} /> Status de Conectividade (Backend)
            </h3>
            <p className="text-xs text-zinc-400 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                O sistema Rex analisa se os componentes desta tela possuem vínculo direto com
                <span className="text-emerald-400 font-bold"> Prisma/Neon</span> ou
                <span className="text-amber-400 font-bold"> Server Actions</span>.
            </p>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={14} /> Conectados ({connected.length})
                        </span>
                    </div>
                    <div className="space-y-2">
                        {connected.map(file => (
                            <div key={file} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                <Database size={14} className="text-emerald-500 shrink-0" />
                                <span className="text-[10px] font-mono text-emerald-200 truncate">{file.split('/').pop()}</span>
                            </div>
                        ))}
                        {connected.length === 0 && <p className="text-[10px] text-zinc-600 italic">Nenhum arquivo conectado detectado.</p>}
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                            <Unplug size={14} /> Desconectados / UI Pura ({disconnected.length})
                        </span>
                    </div>
                    <div className="space-y-2">
                        {disconnected.map(file => (
                            <div key={file} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 group hover:bg-red-500/10 transition-colors cursor-help" title="Este arquivo não possui imports explícitos de dados.">
                                <Box size={14} className="text-red-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-mono text-red-200 truncate block">{file.split('/').pop()}</span>
                                </div>
                                <AlertTriangle size={12} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                         {disconnected.length === 0 && <p className="text-[10px] text-zinc-600 italic">Todos os arquivos parecem conectados.</p>}
                    </div>
                </div>
            </div>
        </div>
       </div>
     );
  }

  // ... (FILES VIEW - Mantém igual) ...
  if (view === 'FILES') {
    return (
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderOpen size={16} /> Explorador Onisciente ({files.length})
          </h3>
          <input
            type="text"
            placeholder="Filtrar por nome ou caminho..."
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-64 placeholder:text-zinc-600"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 gap-2">
            {filteredFiles.map((file) => (
              <FileRow key={file.path} file={file} />
            ))}
            {filteredFiles.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                {files.length === 0
                  ? "Nenhum arquivo indexado. Verifique se o servidor está rodando."
                  : "Nenhum arquivo encontrado com este filtro."}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: SCANNER (ATUALIZADO) ---
  if (view === 'SCANNER') {
    const proportionIssues = data?.issues.filter(i => i.layer === 'UI_PROPORTION') || [];
    
    const activePopups = activeRuntimeElements.filter(el => 
        el.isPopup && 
        el.responsibleFile && 
        !el.responsibleFile.includes("Unknown") && 
        !el.componentName.includes("External Popup")
    );

    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Botões" value={data?.screenMetadata.elements.buttons || 0} />
          <StatCard label="Inputs" value={data?.screenMetadata.elements.inputs || 0} />
          <StatCard label="Logic" value={data?.screenMetadata.elements.logicHooks || 0} icon={Cpu} />
          <StatCard label="Actions" value={data?.screenMetadata.elements.serverActions || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLUNA 1: POPUPS ATIVOS (LIVE) */}
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Layers size={16} /> Camadas Ativas (Popups)
                </h3>
                
                <div className={cn(
                    "p-4 border rounded-2xl transition-all duration-500 min-h-[100px]",
                    activePopups.length > 0
                        ? "bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20"
                        : "bg-zinc-900/50 border-zinc-800"
                )}>
                    {activePopups.length > 0 ? (
                        <div className="space-y-2">
                            {activePopups.map(popup => {
                                const displayName = popup.responsibleFile 
                                    ? popup.responsibleFile.split('/').pop() 
                                    : popup.componentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                return (
                                    <div key={popup.elementId} className="flex flex-col gap-1 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                        <div className="flex items-center gap-2">
                                            <Maximize size={14} className="text-indigo-400" />
                                            <span className="text-xs font-bold text-indigo-100 truncate">{displayName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-6">
                                            <FileEdit size={10} className="text-indigo-400/60" />
                                            <span className="text-[10px] font-mono text-indigo-300/70 truncate">
                                                {popup.responsibleFile || "Arquivo desconhecido"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[10px] text-zinc-600 italic py-2 text-center">Nenhum modal detectado no DOM agora.</p>
                    )}
                </div>
            </div>

            {/* COLUNA 2: ESTRUTURA DA TELA (DEEP SCAN) */}
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                  <GitBranch size={16} /> Estrutura da Tela (Live)
                </h3>
                
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {currentRouteStructure ? (
                        <div className="-ml-4">
                            <ComponentTreeNode node={currentRouteStructure} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                            <Cpu size={24} className="animate-pulse opacity-50" />
                            <p className="text-[10px]">Escaneando árvore de componentes...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* SECTION: PROPORTION ISSUES */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={16} /> Análise de Layout & Proporção
            </h3>
            {proportionIssues.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30 animate-pulse">
                {proportionIssues.length} ERROS DETECTADOS
              </span>
            )}
          </div>

          {proportionIssues.length === 0 ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
              <CheckCircle2 className="text-emerald-500 w-8 h-8" />
              <div>
                <h4 className="text-emerald-400 font-bold text-sm">Layout Responsivo Aprovado</h4>
                <p className="text-emerald-400/60 text-xs">Nenhum problema de largura fixa ou overflow detectado nesta tela.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {proportionIssues.map(issue => (
                <div key={issue.id} className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 group hover:bg-red-500/15 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-red-500">
                    {issue.message.includes("Modal") ? <Maximize size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold text-sm mb-1">{issue.message}</h4>
                    <p className="text-red-300/70 text-xs font-mono mb-3">{issue.file}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sugestão:</span>
                        <p className="text-xs text-zinc-200 bg-black/40 px-2 py-1 rounded border border-white/10 inline-block">
                            {issue.suggestion}
                        </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ... (OUTRAS VIEWS - Mantém igual) ...
  if (view === 'DATABASE') return <div className="p-8 text-zinc-400">Database View...</div>;
  if (view === 'AUDIT') return <div className="p-8 text-zinc-400">Audit View...</div>;
  if (view === 'HISTORY') return <div className="p-8 text-zinc-400">History View...</div>;

  return null;
}

// ... (StatCard e FileRow mantidos) ...
function StatCard({ label, value, icon: Icon }: { label: string, value: number, icon?: React.ElementType }) {
  return (
    <div className="p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center">
      <span className="text-3xl font-black text-white mb-1">{value}</span>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </span>
    </div>
  );
}

const FileRow = React.memo(function FileRow({ file }: { file: ProjectFile }) {
  const getIcon = () => {
    switch (file.type) {
      case 'COMPONENT': return <Box size={14} className="text-blue-400" />;
      case 'PAGE': return <Layout size={14} className="text-purple-400" />;
      case 'ACTION': return <Zap size={14} className="text-amber-400" />;
      case 'HOOK': return <Code size={14} className="text-emerald-400" />;
      case 'PRISMA': return <Database size={14} className="text-cyan-400" />;
      case 'SCHEMA': return <FileJson size={14} className="text-pink-400" />;
      case 'TYPE': return <Braces size={14} className="text-orange-400" />;
      case 'UTIL': return <Wrench size={14} className="text-slate-400" />;
      case 'ASSET': return <ImageIcon size={14} className="text-teal-400" />;
      case 'MARKDOWN': return <FileText size={14} className="text-gray-400" />;
      default: return <FileCode size={14} className="text-zinc-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (file.type) {
      case 'COMPONENT': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'PAGE': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case 'ACTION': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'HOOK': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'TYPE': return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case 'UTIL': return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case 'ASSET': return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case 'MARKDOWN': return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-zinc-800 text-zinc-500 border-zinc-700";
    }
  };

  return (
    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-zinc-800">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{file.name}</p>
          <p className="text-[9px] text-zinc-500 font-mono truncate">{file.path}</p>
        </div>
      </div>
     
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] text-zinc-600 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase w-16 text-center", getBadgeColor())}>
          {file.type}
        </span>
      </div>
    </div>
  );
});
"use client";

import React, { useState, useMemo } from "react";
import {
  Smartphone, CheckCircle2, AlertCircle, Database, Server, Cpu, History, FileCode,
  FolderOpen, Box, Layout, Zap, Code, FileJson, Braces, Wrench, Image as ImageIcon, FileText,
  Maximize, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GuardianAuditResponse, ProjectFile } from "@/schemas/guardian-schema";
import { DashboardView } from "./GuardianHeader";

interface GuardianViewManagerProps {
  view: DashboardView;
  data: GuardianAuditResponse | null;
}

export function GuardianViewManager({ view, data }: GuardianViewManagerProps) {
  const [fileSearch, setFileSearch] = useState("");

  // Hooks no topo
  const files = data?.screenMetadata.projectStructure || [];
  
  const filteredFiles = useMemo(() => {
    const searchLower = fileSearch.toLowerCase();
    return files.filter(f =>
      f.path.toLowerCase().includes(searchLower) ||
      f.name.toLowerCase().includes(searchLower)
    );
  }, [files, fileSearch]);

  // --- VIEW: FILES ---
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

  // --- VIEW: SCANNER (COM DETECÇÃO DE PROPORÇÃO) ---
  if (view === 'SCANNER') {
    const proportionIssues = data?.issues.filter(i => i.layer === 'UI_PROPORTION') || [];

    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Botões" value={data?.screenMetadata.elements.buttons || 0} />
          <StatCard label="Inputs" value={data?.screenMetadata.elements.inputs || 0} />
          <StatCard label="Logic" value={data?.screenMetadata.elements.logicHooks || 0} icon={Cpu} />
          <StatCard label="Actions" value={data?.screenMetadata.elements.serverActions || 0} />
        </div>

        <div className="space-y-4">
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

  // --- VIEW: DATABASE ---
  if (view === 'DATABASE') {
    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database size={16} /> Prisma Schema Map
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Provider: {data?.screenMetadata.database.connection}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data?.screenMetadata.database.models.map((model) => (
            <div key={model} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Server size={16} />
                </div>
                <span className="text-sm font-bold text-zinc-200">{model}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">Model</span>
                <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">Server Actions Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: AUDIT ---
  if (view === 'AUDIT') {
    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar space-y-4">
        {data?.issues.filter(i => i.layer !== 'DISCOVERY' && i.layer !== 'UI_PROPORTION').map((issue) => (
          <div key={issue.id} className="p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all flex gap-5">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              issue.severity === 'CRITICAL' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
            )}>
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">{issue.layer}</span>
                <span className="text-[10px] font-mono text-zinc-600">{issue.file}</span>
              </div>
              <h4 className="text-zinc-200 font-bold text-sm mb-2">{issue.message}</h4>
              <p className="text-xs text-zinc-400 bg-black/20 p-3 rounded-xl border border-white/5">
                💡 {issue.suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VIEW: HISTORY ---
  if (view === 'HISTORY') {
    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <h3 className="text-sm font-bold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
          <History size={16} /> Arquivos Recentes (24h)
        </h3>
        <div className="space-y-3">
          {data?.issues.filter(i => i.layer === 'DISCOVERY').map((discovery) => (
            <div key={discovery.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <FileCode size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{discovery.file.split('/').pop()}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{discovery.file}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">NEW</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// --- SUB-COMPONENTE: Stat Card ---
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

// --- SUB-COMPONENTE: Linha de Arquivo (Otimizado) ---
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
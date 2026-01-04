// path: src/components/builder/blocks/master/GuardianViewManager.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  Cpu,
  History,
  FileCode,
  FolderOpen,
  Box,
  Layout,
  Zap,
  Code,
  FileJson,
  Braces,
  Wrench,
  Image as ImageIcon,
  FileText,
  Maximize,
  AlertTriangle,
  Link as LinkIcon,
  Unplug,
  Layers,
  Eye,
  FileEdit,
  Map,
  MousePointerClick,
  Type,
  LayoutDashboard,
  ScanSearch,
  Scaling,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GuardianAuditResponse, ProjectFile, CodeSnippet } from "@/schemas/guardian-schema";
import { DashboardView } from "./GuardianHeader";
import { useGuardianStore } from "@/hooks/use-guardian-store";

interface GuardianViewManagerProps {
  view: DashboardView;
  data: GuardianAuditResponse | null;
}

/**
 * GuardianViewManager: Orquestrador de visualizações do Guardian OS.
 * Implementa a arquitetura Rex Code X-Ray para auditoria de código vivo.
 */
export function GuardianViewManager({ view, data }: GuardianViewManagerProps) {
  const [fileSearch, setFileSearch] = useState("");
  const { activeRuntimeElements } = useGuardianStore();

  const projectFiles = useMemo(() => data?.screenMetadata.projectStructure || [], [data]);

  const filteredFiles = useMemo(() => {
    const searchLowerCase = fileSearch.toLowerCase();
    return projectFiles.filter((file: ProjectFile) =>
      file.path.toLowerCase().includes(searchLowerCase) ||
      file.name.toLowerCase().includes(searchLowerCase)
    );
  }, [projectFiles, fileSearch]);

  // ✅ VIEW: CODE_MAP (Mapeamento Estrutural do DOM + Código Fonte Real)
  if (view === "CODE_MAP") {
    const mappedElements = activeRuntimeElements.filter((element) => element.metrics);

    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-[#050505]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Map size={24} className="text-indigo-500" /> Rex Code X-Ray
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">
              Mapeamento em tempo real de instâncias e código fonte detectado
            </p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/20 font-black">
            {mappedElements.length} COMPONENTES MAPEADOS
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mappedElements.map((element) => {
            const metrics = element.metrics;
            if (!metrics) return null;

            // ✅ RESOLVIDO: Busca snippets no codeMap usando o arquivo responsável
            const snippets: CodeSnippet[] = data?.screenMetadata.codeMap?.[element.responsibleFile || ""] || [];

            return (
              <div
                key={element.elementId}
                className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all group"
              >
                {/* Header da Instância */}
                <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                      <Braces size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white tracking-tight">
                        {element.componentName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <FileCode size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-500">
                          {element.responsibleFile}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">
                      Dimensões Reais
                    </span>
                    <div className="flex items-center gap-2 text-white font-mono text-xs bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                      <Scaling size={12} className="text-indigo-400" />
                      {Math.round(metrics.width)}x{Math.round(metrics.height)}px
                    </div>
                  </div>
                </div>

                {/* Grid de Métricas de UI */}
                <div className="grid grid-cols-4 gap-px bg-zinc-800/50 border-b border-zinc-800/50">
                  <StatItem
                    icon={MousePointerClick}
                    value={metrics.elementCount.buttons}
                    label="Botões"
                  />
                  <StatItem icon={Type} value={metrics.elementCount.inputs} label="Inputs" />
                  <StatItem icon={ImageIcon} value={metrics.elementCount.images} label="Imagens" />
                  <StatItem
                    icon={LayoutDashboard}
                    value={metrics.elementCount.textNodes}
                    label="Blocos Texto"
                  />
                </div>

                {/* Área de Código Fonte (O Raio-X Real) */}
                <div className="p-6 bg-black/20">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={14} className="text-indigo-500" /> Implementação Detectada no
                      Arquivo
                    </h5>
                    {element.isPopup && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md font-bold border border-purple-500/20">
                        POPUP ENGINE
                      </span>
                    )}
                  </div>

                  {snippets.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {snippets.map((snippet: CodeSnippet, index: number) => (
                        <div
                          key={`${element.elementId}-snippet-${index}`}
                          className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] overflow-hidden group/snippet"
                        >
                          <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  snippet.type === "BUTTON"
                                    ? "bg-blue-500"
                                    : snippet.type === "INPUT"
                                    ? "bg-emerald-500"
                                    : "bg-zinc-600"
                                )}
                              />
                              <span className="text-[9px] font-black text-zinc-300 uppercase">
                                {snippet.type}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-600 group-hover/snippet:text-indigo-400 transition-colors">
                              {snippet.preview}
                            </span>
                          </div>
                          <pre className="p-4 text-[11px] font-mono text-indigo-300/80 overflow-x-auto leading-relaxed selection:bg-indigo-500/30">
                            {snippet.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-[2rem]">
                      <Code size={24} className="mx-auto text-zinc-700 mb-2" />
                      <p className="text-xs text-zinc-600 font-medium">
                        Nenhum snippet JSX detectado neste componente.
                      </p>
                    </div>
                  )}
                </div>

                {metrics.isResponsiveIssue && (
                  <div className="m-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                    <AlertTriangle size={20} className="text-red-500" />
                    <div>
                      <p className="text-xs font-black text-red-200 uppercase">
                        Aviso de Proporção
                      </p>
                      <p className="text-[10px] text-red-400/80 font-medium">
                        Este componente apresenta overflow horizontal. Verifique as larguras fixas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {mappedElements.length === 0 && (
            <div className="text-center py-32 text-zinc-500">
              <ScanSearch size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">Nenhum componente monitorado na tela ativa.</p>
              <p className="text-[10px] uppercase tracking-widest mt-2">
                Certifique-se de usar o HOC withGuardian nos seus arquivos UI.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: CONNECTIONS ---
  if (view === "CONNECTIONS") {
    const connectedFiles = data?.screenMetadata.connectivity.connected || [];
    const disconnectedFiles = data?.screenMetadata.connectivity.disconnected || [];
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
                  <CheckCircle2 size={14} /> Conectados ({connectedFiles.length})
                </span>
              </div>
              <div className="space-y-2">
                {connectedFiles.map((file: string) => (
                  <div
                    key={file}
                    className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                  >
                    <Database size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-mono text-emerald-200 truncate">
                      {file.split("/").pop()}
                    </span>
                  </div>
                ))}
                {connectedFiles.length === 0 && (
                  <p className="text-[10px] text-zinc-600 italic">
                    Nenhum arquivo conectado detectado.
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Unplug size={14} /> Desconectados / UI Pura ({disconnectedFiles.length})
                </span>
              </div>
              <div className="space-y-2">
                {disconnectedFiles.map((file: string) => (
                  <div
                    key={file}
                    className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 group hover:bg-red-500/10 transition-colors cursor-help"
                    title="Este arquivo não possui imports explícitos de dados."
                  >
                    <Box size={14} className="text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-red-200 truncate block">
                        {file.split("/").pop()}
                      </span>
                    </div>
                    <AlertTriangle
                      size={12}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
                {disconnectedFiles.length === 0 && (
                  <p className="text-[10px] text-zinc-600 italic">
                    Todos os arquivos parecem conectados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: FILES ---
  if (view === "FILES") {
    return (
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderOpen size={16} /> Explorador Onisciente ({projectFiles.length})
          </h3>
          <input
            type="text"
            placeholder="Filtrar por nome ou caminho..."
            value={fileSearch}
            onChange={(event) => setFileSearch(event.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-64 placeholder:text-zinc-600"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 gap-2">
            {filteredFiles.map((file: ProjectFile) => (
              <FileRow key={file.path} file={file} />
            ))}
            {filteredFiles.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                {projectFiles.length === 0
                  ? "Nenhum arquivo indexado. Verifique se o servidor está rodando."
                  : "Nenhum arquivo encontrado com este filtro."}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: SCANNER ---
  if (view === "SCANNER") {
    const proportionIssues =
      data?.issues.filter((issue) => issue.layer === "UI_PROPORTION") || [];
    const activePopups = activeRuntimeElements.filter(
      (element) =>
        element.isPopup &&
        element.responsibleFile &&
        !element.responsibleFile.includes("Unknown") &&
        !element.componentName.includes("External Popup")
    );

    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Botões" value={data?.screenMetadata.elements.buttons || 0} />
          <StatCard label="Inputs" value={data?.screenMetadata.elements.inputs || 0} />
          <StatCard
            label="Logic"
            value={data?.screenMetadata.elements.logicHooks || 0}
            icon={Cpu}
          />
          <StatCard label="Actions" value={data?.screenMetadata.elements.serverActions || 0} />
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
            <Layers size={16} /> Camadas Ativas (Runtime)
          </h3>

          <div
            className={cn(
              "p-4 border rounded-2xl transition-all duration-500",
              activePopups.length > 0
                ? "bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20"
                : "bg-zinc-900/50 border-zinc-800"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  activePopups.length > 0 ? "text-indigo-300" : "text-zinc-400"
                )}
              >
                Popups Abertos (Live)
              </span>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1",
                  activePopups.length > 0
                    ? "bg-emerald-500 text-zinc-950 animate-pulse"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {activePopups.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-ping" />
                )}
                {activePopups.length} ATIVOS
              </span>
            </div>

            {activePopups.length > 0 ? (
              <div className="space-y-3">
                {activePopups.map((popup) => {
                  const displayName = popup.responsibleFile
                    ? popup.responsibleFile.split("/").pop()
                    : popup.componentName.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

                  return (
                    <div
                      key={popup.elementId}
                      className="flex flex-col gap-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Maximize size={16} className="text-indigo-400" />
                          <span className="text-sm font-bold text-indigo-100 truncate">
                            {displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileEdit size={12} className="text-indigo-400/60" />
                          <span className="text-[10px] font-mono text-indigo-300/70 truncate max-w-[200px]">
                            {popup.responsibleFile || "Arquivo desconhecido"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 italic py-2">
                {activeRuntimeElements.some((element) => element.isPopup)
                  ? "Popups externos ocultos (sem etiqueta Guardian)."
                  : "Nenhum modal detectado no DOM agora."}
              </p>
            )}
          </div>
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
                <p className="text-emerald-400/60 text-xs">
                  Nenhum problema de largura fixa ou overflow detectado nesta tela.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {proportionIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 group hover:bg-red-500/15 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-red-500">
                    {issue.message.includes("Modal") ? (
                      <Maximize size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold text-sm mb-1">{issue.message}</h4>
                    <p className="text-red-300/70 text-xs font-mono mb-3">{issue.file}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Sugestão:
                      </span>
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
  if (view === "DATABASE") {
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
          {data?.screenMetadata.database.models.map((model: string) => (
            <div
              key={model}
              className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Server size={16} />
                </div>
                <span className="text-sm font-bold text-zinc-200">{model}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                  Model
                </span>
                <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                  Server Actions Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: AUDIT ---
  if (view === "AUDIT") {
    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar space-y-4">
        {data?.issues
          .filter((issue) => issue.layer !== "DISCOVERY" && issue.layer !== "UI_PROPORTION")
          .map((issue) => (
            <div
              key={issue.id}
              className="p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all flex gap-5"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  issue.severity === "CRITICAL"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500"
                )}
              >
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">
                    {issue.layer}
                  </span>
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
  if (view === "HISTORY") {
    return (
      <div className="h-full p-8 overflow-y-auto custom-scrollbar">
        <h3 className="text-sm font-bold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
          <History size={16} /> Arquivos Recentes (24h)
        </h3>
        <div className="space-y-3">
          {data?.issues
            .filter((issue) => issue.layer === "DISCOVERY")
            .map((discovery) => (
              <div
                key={discovery.id}
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">
                      {discovery.file.split("/").pop()}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">{discovery.file}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  NEW
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * StatItem: Componente de métrica para o grid do Code Map.
 */
function StatItem({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-black/20 p-4 flex flex-col items-center justify-center border-r border-zinc-800/50 last:border-r-0 hover:bg-zinc-800/30 transition-colors">
      <Icon size={16} className="text-zinc-400 mb-2" />
      <span className="text-sm font-black text-white">{value}</span>
      <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter mt-1">
        {label}
      </span>
    </div>
  );
}

/**
 * StatCard: Card de estatística para a visão geral do Scanner.
 */
function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon?: React.ElementType;
}) {
  return (
    <div className="p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center">
      <span className="text-3xl font-black text-white mb-1">{value}</span>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </span>
    </div>
  );
}

/**
 * FileRow: Linha de arquivo para o explorador onisciente.
 */
const FileRow = React.memo(function FileRow({ file }: { file: ProjectFile }) {
  const getIcon = () => {
    switch (file.type) {
      case "COMPONENT":
        return <Box size={14} className="text-blue-400" />;
      case "PAGE":
        return <Layout size={14} className="text-purple-400" />;
      case "ACTION":
        return <Zap size={14} className="text-amber-400" />;
      case "HOOK":
        return <Code size={14} className="text-emerald-400" />;
      case "PRISMA":
        return <Database size={14} className="text-cyan-400" />;
      case "SCHEMA":
        return <FileJson size={14} className="text-pink-400" />;
      case "TYPE":
        return <Braces size={14} className="text-orange-400" />;
      case "UTIL":
        return <Wrench size={14} className="text-slate-400" />;
      case "ASSET":
        return <ImageIcon size={14} className="text-teal-400" />;
      case "MARKDOWN":
        return <FileText size={14} className="text-gray-400" />;
      default:
        return <FileCode size={14} className="text-zinc-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (file.type) {
      case "COMPONENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "PAGE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ACTION":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "HOOK":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "TYPE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "UTIL":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "ASSET":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "MARKDOWN":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-zinc-800 text-zinc-500 border-zinc-700";
    }
  };

  return (
    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-zinc-800">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
            {file.name}
          </p>
          <p className="text-[9px] text-zinc-500 font-mono truncate">{file.path}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] text-zinc-600 font-mono">
          {(file.size / 1024).toFixed(1)} KB
        </span>
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase w-16 text-center",
            getBadgeColor()
          )}
        >
          {file.type}
        </span>
      </div>
    </div>
  );
});
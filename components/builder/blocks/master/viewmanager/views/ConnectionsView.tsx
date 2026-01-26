// path: src/components/builder/blocks/master/viewmanager/views/ConnectionsView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  ChevronRight,
  Box,
  Zap,
  Layout,
  Code,
  Database,
  ArrowRight,
  FolderTree,
  Workflow,
  Radio,
  Lightbulb,
  Network,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewProps } from "../types";
import { DependencyLink, AutoDoc } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeTracker } from "@/schemas/guardian-runtime-schema";
import { generateAutoDocAction } from "@/app/actions/guardian";

// --- TIPOS ---

interface FileNode {
  path: string;
  name: string;
  type: string;
  isLive?: boolean;
  hasMetadata?: boolean;
}

// --- HELPER DE ÍCONES ---
const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  if (type.includes("component")) return <Box size={16} className={cn("text-blue-400", className)} />;
  if (type.includes("page") || type.includes("layout")) return <Layout size={16} className={cn("text-purple-400", className)} />;
  if (type.includes("action")) return <Zap size={16} className={cn("text-amber-400", className)} />;
  if (type.includes("hook")) return <Code size={16} className={cn("text-emerald-400", className)} />;
  if (type.includes("prisma")) return <Database size={16} className={cn("text-cyan-400", className)} />;
  return <FileCode size={16} className={cn("text-zinc-500", className)} />;
};

// --- COMPONENTE DO CARD DE ARQUIVO (Compacto) ---
const FileCard = ({
  node,
  isSelected,
  hasChildren,
  onClick
}: {
  node: FileNode,
  isSelected: boolean,
  hasChildren: boolean,
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group relative overflow-hidden mb-1.5",
        isSelected
          ? "bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-900/20"
          : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700"
      )}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
     
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner shrink-0 transition-colors relative",
          isSelected
            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
            : "bg-black/20 border-zinc-800 text-zinc-500 group-hover:text-zinc-300"
        )}>
          <FileIcon type={node.type} />
         
          {node.isLive && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-zinc-900"></span>
            </span>
          )}
        </div>
       
        <div className="min-w-0 flex-1">
          <span className={cn(
            "text-xs font-bold block truncate mb-0.5",
            isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
          )}>
            {node.name}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn(
                "text-[9px] font-mono truncate block",
                isSelected ? "text-indigo-300" : "text-zinc-500"
            )}>
                {node.path}
            </span>
            {node.hasMetadata && (
                <span className="text-[8px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-px rounded border border-amber-500/20 font-bold uppercase tracking-wider">
                    <Lightbulb size={8} /> Info
                </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center transition-colors ml-1",
            isSelected ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
        )}>
            <ChevronRight size={12} />
        </div>
      )}
    </button>
  );
};

// ✅ PAINEL DE INTELIGÊNCIA (Tamanho Médio e Inteligente)
const IntelligencePanel = ({
  element,
  onNavigate
}: {
  element: RuntimeTracker,
  onNavigate: (path: string) => void
}) => {
  const meta = element.semanticMetadata;
 
  // Inicialização Lazy: Define o estado inicial baseado nas props, evitando setState no useEffect
  const [loadingDoc, setLoadingDoc] = useState(() => !meta?.orientationNotes && !!element.responsibleFile);
  const [autoDoc, setAutoDoc] = useState<AutoDoc | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!meta?.orientationNotes && element.responsibleFile) {
        generateAutoDocAction(element.responsibleFile)
            .then((doc: AutoDoc | null) => {
                if (isMounted) {
                    setAutoDoc(doc);
                    setLoadingDoc(false);
                }
            })
            .catch((err) => {
                console.error("Erro ao gerar doc:", err);
                if (isMounted) setLoadingDoc(false);
            });
    }

    return () => {
        isMounted = false;
    };
  }, [element.responsibleFile, meta]);

  if (!meta && !autoDoc && !loadingDoc) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[400px] shrink-0 bg-[#0a0a0a] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-20"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5">
       
        <motion.div
            key={element.responsibleFile}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl shadow-sm flex items-start gap-3 group hover:border-indigo-500/30 transition-colors"
        >
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-center shrink-0 text-indigo-400 group-hover:text-white transition-colors shadow-inner mt-1">
                <FileCode size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Target size={10} className="text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Arquivo em Foco</span>
                </div>
               
                <h3 className="text-sm font-black text-white uppercase tracking-wide break-words leading-tight mb-1">
                    {element.componentName}
                </h3>
               
                <p className="text-[10px] font-mono text-zinc-300 break-all leading-relaxed bg-black/20 p-1.5 rounded border border-white/5">
                    {element.responsibleFile}
                </p>
            </div>
        </motion.div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
               <Lightbulb size={14} className="text-indigo-400" />
            </div>
            <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {meta ? "Orientação Tática (Manual)" : "Rex Auto-Analysis (IA Local)"}
            </h4>
          </div>
          <h2 className="text-xl font-black text-white leading-tight tracking-tight mb-2 break-words">
            {meta?.label || element.componentName}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            {meta?.description || (autoDoc ? "Análise automática gerada pelo Guardian OS." : "Carregando análise...")}
          </p>
        </div>

        {meta?.orientationNotes && (
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-2 text-indigo-300 px-1">
                <FileText size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Nota do Engenheiro</span>
             </div>
             
             <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 shadow-inner relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 rounded-l-xl group-hover:bg-indigo-500 transition-colors" />
               
                <div className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {meta.orientationNotes.trim()}
                </div>
             </div>
          </div>
        )}

        {!meta?.orientationNotes && loadingDoc && (
            <div className="p-4 text-center">
                <span className="text-xs text-zinc-500 animate-pulse">Lendo código fonte...</span>
            </div>
        )}

        {!meta?.orientationNotes && autoDoc && (
             <div className="flex flex-col gap-3">
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3">
                    <p className="text-[11px] text-emerald-200 leading-relaxed">
                        {autoDoc.summary}
                    </p>
                </div>

                {autoDoc.stateVariables.length > 0 && (
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-1 block">Gerenciamento de Estado</span>
                        <div className="flex flex-wrap gap-1.5">
                            {autoDoc.stateVariables.map((st: string) => (
                                <span key={st} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700">
                                    {st}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {autoDoc.renderedComponents.length > 0 && (
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-1 block">Estrutura de UI</span>
                        <div className="flex flex-wrap gap-1.5">
                            {autoDoc.renderedComponents.map((comp: string) => (
                                <span key={comp} className="px-2 py-1 bg-blue-900/20 rounded text-[10px] font-bold text-blue-300 border border-blue-500/20">
                                    {comp}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
             </div>
        )}

        {meta?.connectsTo && meta.connectsTo.length > 0 && (
          <div>
            <h5 className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Network size={12} /> Conexões Lógicas ({meta.connectsTo.length})
            </h5>
            <div className="space-y-2">
              {meta.connectsTo.map((conn, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-2.5 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:border-indigo-500/40 hover:bg-zinc-900/60 transition-all group items-start"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-sm mt-0.5",
                    conn.type === 'ROUTE' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    conn.type === 'DATABASE' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    conn.type === 'EXTERNAL' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  )}>
                      {conn.type === 'DATABASE' ? <Database size={12} /> :
                       conn.type === 'EXTERNAL' ? <Zap size={12} /> :
                       <LinkIcon size={12} />}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                         <p className="text-[11px] font-bold text-zinc-200 break-all leading-snug group-hover:text-white transition-colors">
                           {conn.target}
                         </p>
                         <span className="text-[8px] font-black text-zinc-600 uppercase mt-0.5 block tracking-wider">
                           {conn.type}
                         </span>
                      </div>

                      <button
                        onClick={() => onNavigate(conn.target)}
                        className="p-1 bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white rounded-lg transition-all shrink-0 shadow-md hover:scale-105 active:scale-95"
                        title="Navegar para este arquivo"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>

                    {conn.description && (
                      <p className="text-[9px] text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-800/50 leading-relaxed">
                        {conn.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
     
      <div className="p-5 border-t border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {meta?.tags?.map((tag: string) => (
              <span key={tag} className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 uppercase tracking-wide shadow-sm">
                #{tag}
              </span>
            ))}
            {autoDoc && (
                <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 uppercase tracking-wide shadow-sm">
                    Complexidade: {autoDoc.complexityLevel}
                </span>
            )}
          </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export function ConnectionsView({ data }: ViewProps) {
  const { activeRuntimeElements } = useGuardianStore();

  const { dependencyMap, rootFile } = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!data) return { dependencyMap: map, rootFile: "" };

    data.screenMetadata.dependencies.forEach((dep: DependencyLink) => {
      if (!map.has(dep.source)) map.set(dep.source, []);
      if (!map.get(dep.source)?.includes(dep.target)) {
        map.get(dep.source)?.push(dep.target);
      }
    });

    return {
      dependencyMap: map,
      rootFile: data.screenMetadata.responsibleFile
    };
  }, [data]);

  // ✅ CORREÇÃO: Estado inicializado corretamente
  const [selectedPath, setSelectedPath] = useState<string[]>(() => {
    return rootFile ? [rootFile] : [];
  });

  // ✅ CORREÇÃO: Usa useEffect para atualizar quando rootFile mudar (evita loop infinito)
  useEffect(() => {
    if (rootFile) {
      setSelectedPath((prev) => {
        // Só atualiza se realmente mudou
        if (prev.length === 0 || prev[0] !== rootFile) {
          return [rootFile];
        }
        return prev;
      });
    }
  }, [rootFile]); // ✅ Dependência correta: apenas rootFile

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: "smooth"
          });
      }, 100);
    }
  }, [selectedPath]);

  const lastSelectedPath = selectedPath[selectedPath.length - 1];
  const selectedActiveElement = useMemo(() =>
    activeRuntimeElements.find(el => el.responsibleFile === lastSelectedPath),
  [activeRuntimeElements, lastSelectedPath]);

  const createFileNode = (path: string, isLive: boolean = false): FileNode => {
    const name = path.split('/').pop() || path;
    const type = path.includes("component") ? "component" :
                 path.includes("hook") ? "hook" :
                 path.includes("action") ? "action" : "file";
   
    const hasMetadata = !!activeRuntimeElements.find(el => el.responsibleFile === path)?.semanticMetadata;

    return { path, name, type, isLive, hasMetadata };
  };

  const handleNodeClick = (path: string, level: number) => {
    const newPath = selectedPath.slice(0, level + 1);
    if (newPath[level] !== path) {
        newPath[level] = path;
    }
    setSelectedPath(newPath);
  };

  const handleSmartNavigate = (targetPath: string) => {
    if (selectedPath.includes(targetPath)) {
        const index = selectedPath.indexOf(targetPath);
        setSelectedPath(selectedPath.slice(0, index + 1));
    } else {
        setSelectedPath([...selectedPath, targetPath]);
    }
  };

  if (!data || !rootFile) return null;

  return (
    <div className="h-full flex bg-[#050505] overflow-hidden">
     
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-800/50 bg-zinc-900/20 shrink-0 flex justify-between items-center">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-1">
                <Workflow size={16} className="text-indigo-500" /> Fluxo de Conexão Híbrido
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">
                Combinação de Análise Estática + Inteligência Semântica.
                </p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                <Radio size={14} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase">
                {activeRuntimeElements.length} Elementos Ativos
                </span>
            </div>
        </div>

        <div
            ref={scrollContainerRef}
            className="flex-1 flex overflow-x-auto overflow-y-hidden custom-scrollbar p-8 gap-6 items-start"
        >
            {selectedPath.map((currentParentPath, index) => {
           
            let itemsToShow: { path: string, isLive: boolean }[] = [];
            let columnTitle = "";
            let columnIcon = null;

            if (index === 0) {
                const activePaths = activeRuntimeElements
                    .map(el => el.responsibleFile)
                    .filter(path => path && path !== rootFile);
           
                const uniqueActivePaths = Array.from(new Set(activePaths));

                itemsToShow = [
                    { path: rootFile, isLive: true },
                    ...uniqueActivePaths.map(p => ({ path: p, isLive: true }))
                ];
           
                columnTitle = "Ativos na Tela (Live)";
                columnIcon = <Radio size={14} className="text-emerald-500"/>;
            } else {
                const parentOfThisColumn = selectedPath[index - 1];
                const staticDeps = dependencyMap.get(parentOfThisColumn) || [];
           
                itemsToShow = staticDeps.map(dep => ({
                    path: dep,
                    isLive: activeRuntimeElements.some(el => el.responsibleFile === dep)
                }));

                if (itemsToShow.length === 0) {
                     const parentElement = activeRuntimeElements.find(el => el.responsibleFile === parentOfThisColumn);
                     if (parentElement?.semanticMetadata?.connectsTo) {
                         itemsToShow = parentElement.semanticMetadata.connectsTo.map(conn => ({
                             path: conn.target,
                             isLive: activeRuntimeElements.some(el => el.responsibleFile === conn.target)
                         }));
                     }
                }
           
                columnTitle = "Dependências / Conexões";
                columnIcon = <FolderTree size={14} className="text-zinc-500"/>;
            }

            if (itemsToShow.length === 0) return null;

            return (
                <motion.div
                key={`col-${index}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="w-[380px] shrink-0 flex flex-col h-full max-h-full bg-zinc-900/20 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm"
                >
                <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50 bg-zinc-900/40">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700 shadow-sm">
                    {index + 1}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    {columnIcon} {columnTitle}
                    </span>
                    <span className="ml-auto text-[9px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded-md border border-zinc-800">
                    {itemsToShow.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-10">
                    {itemsToShow.map((item) => {
                    const node = createFileNode(item.path, item.isLive);
                    const isSelected = selectedPath[index] === item.path;
                   
                    const hasChildren = (dependencyMap.get(item.path)?.length || 0) > 0 ||
                                        !!activeRuntimeElements.find(el => el.responsibleFile === item.path)?.semanticMetadata?.connectsTo?.length;

                    return (
                        <FileCard
                        key={item.path}
                        node={node}
                        isSelected={isSelected}
                        hasChildren={hasChildren}
                        onClick={() => handleNodeClick(item.path, index)}
                        />
                    );
                    })}
                </div>
                </motion.div>
            );
            })}

            {(() => {
                const lastSelected = selectedPath[selectedPath.length - 1];
                const children = dependencyMap.get(lastSelected) || [];
           
                if (children.length > 0) {
                    return (
                        <motion.div
                            key={`col-last`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-[380px] shrink-0 flex flex-col h-full max-h-full bg-zinc-900/20 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50 bg-zinc-900/40">
                                <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700 shadow-sm">
                                {selectedPath.length + 1}
                                </span>
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <ArrowRight size={14} /> Próximo Nível
                                </span>
                                <span className="ml-auto text-[9px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded-md border border-zinc-800">
                                {children.length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-10">
                                {children.map(path => {
                                    const isLive = activeRuntimeElements.some(el => el.responsibleFile === path);
                                    const node = createFileNode(path, isLive);
                                    const hasChildren = (dependencyMap.get(path)?.length || 0) > 0;
                                    return (
                                        <FileCard
                                            key={path}
                                            node={node}
                                            isSelected={false}
                                            hasChildren={hasChildren}
                                            onClick={() => {
                                                const newPath = [...selectedPath, path];
                                                setSelectedPath(newPath);
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                }
                return null;
            })()}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedActiveElement?.semanticMetadata && (
          <IntelligencePanel
            key={selectedActiveElement.elementId}
            element={selectedActiveElement}
            onNavigate={handleSmartNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
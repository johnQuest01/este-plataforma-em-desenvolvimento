// path: src/components/builder/blocks/master/viewmanager/views/ConnectionsView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
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
  Info,
  Network,
  Link as LinkIcon,
  ExternalLink // ✅ Adicionado para o botão de navegar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewProps } from "../types";
import { DependencyLink } from "@/schemas/guardian-schema";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeTracker } from "@/schemas/guardian-runtime-schema";

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

// --- COMPONENTE DO CARD DE ARQUIVO ---
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
        "w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all group relative overflow-hidden mb-2",
        isSelected
          ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20"
          : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700"
      )}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
     
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner shrink-0 transition-colors relative",
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
            "text-sm font-bold block truncate mb-0.5",
            isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
          )}>
            {node.name}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn(
                "text-[10px] font-mono truncate block",
                isSelected ? "text-indigo-300" : "text-zinc-500"
            )}>
                {node.path}
            </span>
            {node.hasMetadata && (
                <span className="text-[9px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <Lightbulb size={8} /> Info
                </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            isSelected ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
        )}>
            <ChevronRight size={14} />
        </div>
      )}
    </button>
  );
};

// ✅ PAINEL DE INTELIGÊNCIA ATUALIZADO (LARGURA E TEXTO)
const IntelligencePanel = ({ 
  element, 
  onNavigate 
}: { 
  element: RuntimeTracker, 
  onNavigate: (path: string) => void 
}) => {
  const meta = element.semanticMetadata;
  if (!meta) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      // ✅ CORREÇÃO 1: Aumentado para w-[420px] para caber nomes longos
      className="w-[420px] shrink-0 bg-zinc-900/80 border-l border-zinc-800/50 p-6 flex flex-col gap-6 overflow-y-auto backdrop-blur-xl"
    >
      <div>
        <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <Lightbulb size={14} /> Orientação Tática
        </h4>
        <h2 className="text-xl font-bold text-white leading-tight">
          {meta.label || element.componentName}
        </h2>
        {meta.description && (
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {meta.description}
          </p>
        )}
      </div>

      {meta.orientationNotes && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase">Nota do Engenheiro</span>
          </div>
          <p className="text-xs text-indigo-100 font-mono whitespace-pre-wrap leading-relaxed">
            {meta.orientationNotes}
          </p>
        </div>
      )}

      {meta.connectsTo && meta.connectsTo.length > 0 && (
        <div>
          <h5 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <Network size={12} /> Conexões Lógicas
          </h5>
          <div className="space-y-2">
            {meta.connectsTo.map((conn, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800 group hover:border-indigo-500/30 transition-colors">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  conn.type === 'ROUTE' ? "bg-purple-500/20 text-purple-400" :
                  conn.type === 'DATABASE' ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-500/20 text-blue-400"
                )}>
                    <LinkIcon size={10} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    {/* ✅ CORREÇÃO 2: break-words para não vazar */}
                    <p className="text-xs font-bold text-zinc-200 break-words" title={conn.target}>
                      {conn.target.split('/').pop()}
                    </p>
                    
                    {/* Botão de Navegação */}
                    <button 
                      onClick={() => onNavigate(conn.target)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all shrink-0"
                      title="Focar neste arquivo"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                  
                  {/* ✅ CORREÇÃO 3: break-all para caminhos longos */}
                  <p className="text-[9px] text-zinc-500 font-mono break-all mb-1 leading-tight">
                    {conn.target}
                  </p>

                  {conn.description && (
                    <p className="text-[10px] text-zinc-400 mt-1 border-t border-zinc-800/50 pt-1">
                      {conn.description}
                    </p>
                  )}
                  <span className="text-[8px] font-mono text-zinc-600 uppercase mt-1 block">
                    {conn.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {meta.tags && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800">
          {meta.tags.map(tag => (
            <span key={tag} className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700 font-mono">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export function ConnectionsView({ data }: ViewProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (rootFile && selectedPath.length === 0) {
      setSelectedPath([rootFile]);
    }
  }, [rootFile]);

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

  // ✅ Função de Navegação Inteligente
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
        {/* Header */}
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

        {/* Área de Colunas */}
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

                // ✅ Se não houver dependências estáticas, verifica se há conexões semânticas (Inteligência)
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

            {/* Coluna Fantasma */}
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

      {/* ✅ Painel Lateral de Inteligência */}
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
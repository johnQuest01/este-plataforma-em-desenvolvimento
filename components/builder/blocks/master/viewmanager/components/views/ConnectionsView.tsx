import React from "react";
import { Link as LinkIcon, GitCommit, ArrowDownRight, FileCode, Unplug } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewProps } from "components/builder/blocks/master/viewmanager/types"
;
import { DependencyLink } from "@/schemas/guardian-schema";

export function ConnectionsView({ data }: ViewProps) {
  const dependencies = data?.screenMetadata.dependencies || [];
  const responsibleFile = data?.screenMetadata.responsibleFile;

  // Agrupar dependências por arquivo de origem (Source)
  const groupedDependencies = dependencies.reduce((acc, link) => {
      if (!acc[link.source]) acc[link.source] = [];
      acc[link.source].push(link);
      return acc;
  }, {} as Record<string, DependencyLink[]>);

  return (
    <div className="h-full p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <LinkIcon size={16} /> Mapa de Conexões Inteligente
        </h3>
        <p className="text-xs text-zinc-400 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          O sistema Rex analisou os <span className="text-indigo-400 font-bold">imports</span> dos arquivos desta rota.
          Abaixo estão listadas as conexões diretas detectadas entre os componentes e suas dependências.
        </p>

        <div className="space-y-8">
          {Object.entries(groupedDependencies).map(([source, links]) => {
              const isMainFile = source === responsibleFile;
              
              return (
                  <div key={source} className="relative pl-4 border-l-2 border-zinc-800 hover:border-indigo-500/50 transition-colors">
                      {/* Nó Principal (Quem Importa) */}
                      <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
                              isMainFile ? "bg-indigo-600 text-white border-indigo-400" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          )}>
                              <GitCommit size={16} />
                          </div>
                          <div>
                              <p className={cn("text-xs font-bold", isMainFile ? "text-white" : "text-zinc-300")}>
                                  {source.split('/').pop()}
                              </p>
                              <p className="text-[9px] font-mono text-zinc-500">{source}</p>
                          </div>
                          {isMainFile && (
                              <span className="ml-2 text-[8px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase font-bold">
                                  Root
                              </span>
                          )}
                      </div>

                      {/* Lista de Conexões (Quem é Importado) */}
                      <div className="space-y-2 pl-6">
                          {links.map((link, idx) => (
                              <div key={`${source}-${link.target}-${idx}`} className="flex items-center gap-3 group">
                                  <ArrowDownRight size={14} className="text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                                  
                                  <div className="flex-1 p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center justify-between hover:bg-zinc-800 hover:border-zinc-700 transition-all">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <FileCode size={12} className="text-zinc-500 shrink-0" />
                                          <span className="text-[10px] font-mono text-zinc-300 truncate">
                                              {link.target}
                                          </span>
                                      </div>
                                      
                                      {/* Badge do Tipo de Arquivo (Inferido) */}
                                      <span className={cn(
                                          "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                                          link.target.includes("type") ? "bg-orange-500/10 text-orange-400" :
                                          link.target.includes("component") ? "bg-blue-500/10 text-blue-400" :
                                          link.target.includes("hook") ? "bg-emerald-500/10 text-emerald-400" :
                                          "bg-zinc-800 text-zinc-500"
                                      )}>
                                          {link.target.includes("type") ? "TYPE" : 
                                           link.target.includes("component") ? "COMP" : 
                                           link.target.includes("hook") ? "HOOK" : "FILE"}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          })}

          {dependencies.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                  <Unplug size={32} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-xs text-zinc-500 font-bold">Nenhuma conexão de importação detectada.</p>
                  <p className="text-[9px] text-zinc-600 mt-1">Verifique se os arquivos estão dentro de /src ou /app.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
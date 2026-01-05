import React, { useState } from "react";
import { Map, ScanSearch, Filter, ScanSearch as ScanSearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { CodeMapFilter, CodeMapViewProps } from "../types";
import { ProjectFile } from "@/schemas/guardian-schema";

// ✅ Imports corrigidos para relativos
import { CodeMapCard } from "../components/CodeMapCard";
import { FileRow } from "../components/FileRow";

export function CodeMapView({ data, filteredFiles }: CodeMapViewProps) {
  const [codeMapFilter, setCodeMapFilter] = useState<CodeMapFilter>('LIVE_TRACKED');
  const { activeRuntimeElements } = useGuardianStore();

  const mappedElements = activeRuntimeElements.filter((element) => element.metrics);

  const sortedElements = [...mappedElements].sort((a, b) => {
      const responsibleFile = data?.screenMetadata.responsibleFile;
      if (a.responsibleFile === responsibleFile) return -1;
      if (b.responsibleFile === responsibleFile) return 1;
      if (a.isPopup && !b.isPopup) return -1;
      if (!a.isPopup && b.isPopup) return 1;
      return 0;
  });

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
       
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setCodeMapFilter('LIVE_TRACKED')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
              codeMapFilter === 'LIVE_TRACKED'
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <ScanSearch size={14} />
            Arquivos com Rastreio (Live)
          </button>
          <button
            onClick={() => setCodeMapFilter('ALL_SCANNED')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
              codeMapFilter === 'ALL_SCANNED'
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Filter size={14} />
            Todos (Estático)
          </button>
        </div>
      </div>

      {codeMapFilter === 'LIVE_TRACKED' ? (
        <div className="grid grid-cols-1 gap-6">
          {sortedElements.map((element) => {
            const metrics = element.metrics;
            if (!metrics) return null;

            const snippets = data?.screenMetadata.codeMap?.[element.responsibleFile || ""] || [];
            const isMainFile = element.responsibleFile === data?.screenMetadata.responsibleFile;

            return (
              <CodeMapCard
                key={element.elementId}
                element={element}
                metrics={metrics}
                snippets={snippets}
                isMainFile={isMainFile}
              />
            );
          })}

          {mappedElements.length === 0 && (
            <div className="text-center py-32 text-zinc-500">
              <ScanSearchIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">Nenhum componente monitorado na tela ativa.</p>
              <p className="text-[10px] uppercase tracking-widest mt-2">
                Certifique-se de usar o HOC withGuardian nos seus arquivos UI.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
           {filteredFiles.map((file: ProjectFile) => (
             <FileRow key={file.path} file={file} />
           ))}
           {filteredFiles.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              {data?.screenMetadata.projectStructure.length === 0
                ? "Nenhum arquivo indexado. Verifique se o servidor está rodando."
                : "Nenhum arquivo encontrado com este filtro."}
            </div>
          )}
         </div>
      )}
    </div>
  );
}
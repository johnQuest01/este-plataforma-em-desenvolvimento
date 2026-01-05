import React from "react";
import { Layers, Maximize, FileEdit, ArrowRight, Smartphone, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { ViewProps } from "../types";
import { StatCard } from "../components/StatCard";

export function ScannerView({ data }: ViewProps) {
  const { activeRuntimeElements, setTab } = useGuardianStore();

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
                    onClick={() => setTab('CODE_MAP')} // ✅ AGORA CLICÁVEL
                    className="flex flex-col gap-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-indigo-500/20 transition-all"
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
                        <ArrowRight size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
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
import React from "react";
import {
  Star,
  Braces,
  FileCode,
  Scaling,
  MousePointerClick,
  Type,
  Image as ImageIcon,
  LayoutDashboard,
  Terminal,
  Code,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RuntimeTracker, UIMetrics } from "@/schemas/guardian-runtime-schema";
import { CodeSnippet } from "@/schemas/guardian-schema";
import { StatItem } from "./StatItem";

interface CodeMapCardProps {
  element: RuntimeTracker;
  metrics: UIMetrics;
  snippets: CodeSnippet[];
  isMainFile: boolean;
}

export function CodeMapCard({ element, metrics, snippets, isMainFile }: CodeMapCardProps) {
  // 🧠 INTELIGÊNCIA HÍBRIDA:
  const staticButtonCount = snippets.filter(s => s.type === 'BUTTON').length;
  const staticInputCount = snippets.filter(s => s.type === 'INPUT').length;
  const staticTextCount = snippets.filter(s => s.type === 'TEXT').length;
 
  const displayButtons = staticButtonCount > 0 ? staticButtonCount : metrics.elementCount.buttons;
  const displayInputs = staticInputCount > 0 ? staticInputCount : metrics.elementCount.inputs;
  const displayText = staticTextCount > 0 ? staticTextCount : metrics.elementCount.textNodes;

  return (
    <div
      className={cn(
        "bg-zinc-900/40 border rounded-[2.5rem] overflow-hidden transition-all group",
        isMainFile ? "border-indigo-500/50 shadow-lg shadow-indigo-900/10" : "border-zinc-800/50 hover:border-indigo-500/30"
      )}
    >
      <div className={cn(
          "p-6 border-b flex justify-between items-center",
          isMainFile ? "bg-indigo-900/10 border-indigo-500/20" : "bg-zinc-900/20 border-zinc-800/50"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border",
              isMainFile ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20" : "bg-zinc-800/50 text-zinc-500 border-zinc-700"
          )}>
            {isMainFile ? <Star size={20} fill="currentColor" /> : <Braces size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white tracking-tight">
                {element.componentName}
                </h4>
                {isMainFile && (
                    <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Main Controller
                    </span>
                )}
            </div>
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
            {metrics.width}x{metrics.height}px
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-zinc-800/50 border-b border-zinc-800/50">
        <StatItem
          icon={MousePointerClick}
          value={displayButtons}
          label="Botões (Total)"
        />
        <StatItem icon={Type} value={displayInputs} label="Inputs (Total)" />
        <StatItem icon={ImageIcon} value={metrics.elementCount.images} label="Imagens (Visíveis)" />
        <StatItem
          icon={LayoutDashboard}
          value={displayText}
          label="Blocos Texto"
        />
      </div>

      <div className="p-6 bg-black/20">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Terminal size={14} className="text-indigo-500" /> Implementação Detectada
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
                          : snippet.type === "TEXT"
                          ? "bg-gray-500"
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
}
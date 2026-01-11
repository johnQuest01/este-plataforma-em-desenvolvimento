"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatabaseStatus } from "@/schemas/blocks/database-status-schema";
import { getDatabaseHealthAction } from "@/app/actions/db-health";
import { BlockComponentProps } from "@/types/builder";
import { Activity, X, Server, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HealthMonitorBlock (Versão Global Overlay)
 * - Position Fixed: Flutua sobre a janela inteira do navegador.
 * - Drag & Drop: Permite arrastar para qualquer lugar.
 */
export function HealthMonitorBlock({ config }: Partial<BlockComponentProps>): React.JSX.Element {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Definição interna para evitar dependências externas e loops de renderização
    const checkHealth = async () => {
      try {
        const result = await getDatabaseHealthAction();
        // Garante que o componente ainda está montado antes de atualizar o estado
        if (isMounted) {
          setStatus(result);
        }
      } catch (error) {
        console.error("Health Check Failed:", error);
      }
    };

    // Execução imediata
    void checkHealth();

    // Configuração do intervalo
    const interval = setInterval(checkHealth, 30000);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Configuração de estilo padrão
  const bgColor = config?.style?.bgColor ?? 'rgba(15, 23, 42, 0.95)';
  const borderColor = config?.style?.borderColor ?? 'rgba(30, 41, 59, 1)';

  return (
    // ✅ MUDANÇA CRÍTICA: 'fixed' em vez de 'absolute'
    // Isso solta o elemento do fluxo da página e o prende à tela do usuário.
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="fixed top-4 left-4 z-[9999] flex flex-col items-start cursor-grab touch-none"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // --- MODO COLAPSADO (BOTÃO) ---
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl hover:bg-slate-800 transition-colors group relative"
            title="Abrir Monitoramento (Arraste para mover)"
          >
            <div className="relative">
              <Activity size={18} className={cn("text-slate-400 group-hover:text-emerald-400 transition-colors", status?.isOnline && "text-emerald-500")} />
              {status?.isOnline && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </div>
          </motion.button>
        ) : (
          // --- MODO EXPANDIDO (BARRA DE STATUS) ---
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, originX: 0, originY: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 pr-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-4 min-w-[280px] relative group"
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor
            }}
          >
            {/* Handle Visual de Arrasto */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-600/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Botão Fechar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            {/* Indicador Visual */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
              <Server size={16} className={status?.isOnline ? "text-emerald-400" : "text-red-400"} />
              {status?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
           
            {/* Informações de Texto */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight flex items-center gap-1">
                System Status <GripVertical size={8} className="opacity-30" />
              </span>
              <span className="text-xs font-mono text-slate-200 font-medium truncate">
                {status?.provider.toUpperCase() ?? "CONNECTING..."}
                <span className="ml-1.5 text-slate-500 text-[10px]">@{status?.region}</span>
              </span>
            </div>
           
            {/* Latência */}
            {status && (
              <div className="text-right pl-3 border-l border-slate-800 shrink-0">
                <div className="text-[9px] text-slate-500 font-mono leading-none mb-0.5">PING</div>
                <div className={cn(
                  "text-sm font-mono font-bold",
                  status.latencyMs < 200 ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {status.latencyMs}ms
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
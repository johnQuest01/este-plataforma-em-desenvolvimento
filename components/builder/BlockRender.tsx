// components/builder/BlockRender.tsx
'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BlockConfig, BlockComponentProps } from '@/types/builder';
import { COMPONENT_MAP } from './BlockRegistry';

// Animação suave ao entrar para blocos normais (não afeta o Popup pois ele usa Portal)
const animProps = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" as const }
};

// Interface estendida para aceitar propriedades de contexto (callbacks do Popup)
interface BlockRendererProps extends BlockComponentProps {
  // Define um objeto genérico aceito pelo ESLint, substituindo 'any'
  contextProps?: Record<string, unknown>; 
}

export const BlockRenderer = memo(({ config, onAction, contextProps }: BlockRendererProps) => {
  // Se não estiver visível, retorna null imediatamente
  if (!config.isVisible) return null;

  // 1. Busca o componente no Mapa (Registry Pattern)
  const ComponentToRender = COMPONENT_MAP[config.type];

  // 2. Fallback de Segurança (Modo Desenvolvimento)
  if (!ComponentToRender) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Lego] Componente não encontrado: ${config.type}`);
      return (
        <div className="p-4 border-2 border-dashed border-red-300 bg-red-50 text-red-500 rounded-lg text-xs font-mono">
          Bloco desconhecido: <strong>{config.type}</strong>
          <br />
          <span className="text-[10px] text-red-400">Verifique se foi adicionado ao BlockRegistry.tsx</span>
        </div>
      );
    }
    return null;
  }

  // 3. Renderização "Lego"
  // O componente recebe 'config', 'onAction' e 'contextProps'
  return (
    <motion.div
      layout="position" // Otimização: Anima suavemente se a posição na lista mudar
      {...animProps}
      className="relative w-full will-change-transform"
      style={{ contentVisibility: 'auto' } as React.CSSProperties}
    >
      <ComponentToRender
        config={config}
        onAction={onAction}
        // Repassa propriedades extras (essencial para onClosePopup/onConfirmDistribution)
        {...contextProps} 
      />
    </motion.div>
  );
}, (prev, next) => {
  // Otimização (React.memo): Só re-renderiza se os dados relevantes mudarem
  
  // 1. Se a visibilidade mudou, precisa renderizar
  if (prev.config.isVisible !== next.config.isVisible) return false;

  // 2. Se o ID ou Tipo mudou, precisa renderizar
  if (prev.config.id !== next.config.id) return false;
  if (prev.config.type !== next.config.type) return false;

  // 3. Verifica mudanças nos dados e estilo
  const dataChanged = prev.config.data === next.config.data;
  const styleChanged = prev.config.style === next.config.style;
  
  // 4. Verifica se as funções de contexto mudaram
  const contextChanged = prev.contextProps === next.contextProps;

  return dataChanged && styleChanged && contextChanged;
});

BlockRenderer.displayName = 'BlockRenderer';
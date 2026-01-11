'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { COMPONENT_MAP } from './BlockRegistry';
import { RexRuntimePixel } from './blocks/master/RexRuntimePixel';
import { withGuardian } from "@/components/guardian/GuardianBeacon";

/**
 * Definição das propriedades de animação seguindo o padrão visual do sistema.
 */
const animationProperties = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" as const }
};

interface BlockRendererProperties extends BlockComponentProps {
  contextualProperties?: Record<string, unknown>;
}

/**
 * BlockRendererBase
 * Responsável por instanciar dinamicamente componentes baseados no JSON de layout.
 * Implementa Memoization rigorosa para evitar re-renders desnecessários em árvores complexas.
 */
const BlockRendererBase = memo(({
  config: configuration,
  onAction: onExecuteAction,
  contextualProperties
}: BlockRendererProperties): React.JSX.Element | null => {
 
  // Validação de visibilidade via JSON
  if (!configuration.isVisible) return null;

  const ComponentToRender = COMPONENT_MAP[configuration.type as keyof typeof COMPONENT_MAP];

  // Fallback para desenvolvimento: Identifica blocos não registrados
  if (!ComponentToRender) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="p-4 border-2 border-dashed border-red-500/50 bg-red-500/10 text-red-500 rounded-xl text-xs font-mono my-2">
          <p className="font-bold uppercase tracking-tighter">Erro de Arquitetura: Bloco Não Encontrado</p>
          <span>Tipo: <strong>{configuration.type}</strong></span>
          <p className="mt-2 text-[10px] opacity-70">Adicione este tipo ao COMPONENT_MAP no BlockRegistry.ts</p>
        </div>
      );
    }
    return null;
  }

  const isPopupElement = configuration.type.toLowerCase().includes('modal') ||
                        configuration.type.toLowerCase().includes('popup');

  return (
    <RexRuntimePixel
      elementId={configuration.id}
      componentName={configuration.type}
      isPopup={isPopupElement}
    >
      <motion.div
        layout="position"
        {...animationProperties}
        className="relative w-full will-change-transform"
        style={{ contentVisibility: 'auto' } as React.CSSProperties}
      >
        <ComponentToRender
          config={configuration}
          onAction={onExecuteAction}
          {...contextualProperties}
        />
      </motion.div>
    </RexRuntimePixel>
  );
}, (previousProperties, nextProperties) => {
  // Lógica de comparação profunda para otimização de performance
  if (previousProperties.config.isVisible !== nextProperties.config.isVisible) return false;
  if (previousProperties.config.id !== nextProperties.config.id) return false;
  if (previousProperties.config.type !== nextProperties.config.type) return false;

  const dataHasNotChanged = JSON.stringify(previousProperties.config.data) === JSON.stringify(nextProperties.config.data);
  const styleHasNotChanged = JSON.stringify(previousProperties.config.style) === JSON.stringify(nextProperties.config.style);
  const contextHasNotChanged = previousProperties.contextualProperties === nextProperties.contextualProperties;

  return dataHasNotChanged && styleHasNotChanged && contextHasNotChanged;
});

BlockRendererBase.displayName = 'BlockRendererBase';

/**
 * Exportação com HOC Guardian para monitoramento do Neural Map.
 */
export const BlockRenderer = withGuardian(
  BlockRendererBase,
  "components/builder/BlockRender.tsx",
  "UI_COMPONENT"
);
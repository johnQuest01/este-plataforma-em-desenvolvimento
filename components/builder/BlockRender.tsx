// path: src/components/builder/BlockRender.tsx
'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BlockConfig, BlockComponentProps } from '@/types/builder';
import { COMPONENT_MAP } from './BlockRegistry';
import { RexRuntimePixel } from './blocks/master/RexRuntimePixel';

// ✅ ATUALIZAÇÃO: Importação do HOC Guardian para o Neural Map
import { withGuardian } from "@/components/guardian/GuardianBeacon";

const animationProperties = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" as const }
};

interface BlockRendererProperties extends BlockComponentProps {
  contextualProperties?: Record<string, unknown>;
}

// ✅ 1. Definimos o componente base (Memoized)
const BlockRendererBase = memo(({
  config: configuration,
  onAction: onExecuteAction,
  contextualProperties
}: BlockRendererProperties) => {
 
  if (!configuration.isVisible) return null;

  const ComponentToRender = COMPONENT_MAP[configuration.type];

  if (!ComponentToRender) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="p-4 border-2 border-dashed border-red-300 bg-red-50 text-red-500 rounded-lg text-xs font-mono">
          Bloco desconhecido: <strong>{configuration.type}</strong>
          <br />
          <span className="text-[10px] text-red-400">Verifique se foi adicionado ao BlockRegistry.tsx</span>
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
      // O Pixel infere o arquivo baseado no tipo, mas o withGuardian abaixo rastreia o Renderizador em si.
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
  if (previousProperties.config.isVisible !== nextProperties.config.isVisible) return false;
  if (previousProperties.config.id !== nextProperties.config.id) return false;
  if (previousProperties.config.type !== nextProperties.config.type) return false;

  const dataHasNotChanged = previousProperties.config.data === nextProperties.config.data;
  const styleHasNotChanged = previousProperties.config.style === nextProperties.config.style;
  const contextHasNotChanged = previousProperties.contextualProperties === nextProperties.contextualProperties;

  return dataHasNotChanged && styleHasNotChanged && contextHasNotChanged;
});

BlockRendererBase.displayName = 'BlockRendererBase';

// ✅ 2. Exportamos o componente com a etiqueta inteligente
// Isso fará o arquivo "components/builder/BlockRender.tsx" brilhar no mapa de conexões quando ativo.
export const BlockRenderer = withGuardian(
  BlockRendererBase,
  "components/builder/BlockRender.tsx",
  "UI_COMPONENT"
);
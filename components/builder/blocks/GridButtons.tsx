// path: src/components/builder/blocks/GridButtons.tsx
'use client';

import React from 'react';
import { BlockConfig, SimpleButton } from '@/types/builder';
import { cn } from '@/lib/utils';

// 📚 Rex Intelligence: Importação do HOC para monitoramento e auditoria X-Ray
import { withGuardian } from "@/components/guardian/GuardianBeacon";

/**
 * GridButtonsBlockProps: Interface rigorosa seguindo o padrão LegoComponent.
 * onAction é opcional para suportar estados de visualização pura.
 */
interface GridButtonsBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

/**
 * GridButtonsBlockBase: Implementação pura do bloco de botões em grade.
 * Este componente é otimizado para renderização de alta performance em listas densas.
 */
const GridButtonsBlockBase = ({ config, onAction }: GridButtonsBlockProps) => {
  // Extração segura dos dados da configuração
  const buttons = (config.data.buttons as SimpleButton[]) || [];

  /**
   * handleButtonClick: Gerenciador de eventos de clique.
   * Valida a existência da ação antes de disparar o evento para o BlockRenderer.
   */
  const handleButtonClick = (actionIdentifier?: string) => {
    if (actionIdentifier && onAction) {
      onAction(actionIdentifier);
    }
  };

  return (
    <div
      className="w-full px-4 py-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {/* 
          Grade Responsiva: O Rex Intelligence monitora este container 
          para detectar problemas de overflow ou proporção.
      */}
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button.action)}
            className={cn(
              "relative flex items-center justify-center min-h-[64px] py-4 px-3",
              "bg-white border border-gray-300 rounded-xl shadow-sm",
              "active:scale-95 transition-all duration-200 active:bg-gray-50",
              "text-gray-900"
            )}
          >
            <span className="text-[13px] sm:text-sm uppercase tracking-wide font-extrabold text-center leading-tight">
              {button.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * ✅ EXPORTAÇÃO COM GUARDIAN OS (REX INTELLIGENCE)
 * 
 * Parâmetros de Auditoria:
 * 1. Componente Base: GridButtonsBlockBase
 * 2. Caminho Físico: Utilizado pelo Rex X-Ray para ler o código JSX real no disco.
 * 3. Tipo de Bloco: UI_COMPONENT (Ajuda na categorização do painel de controle).
 */
export const GridButtonsBlock = withGuardian(
  GridButtonsBlockBase, 
  "components/builder/blocks/GridButtons.tsx", 
  "UI_COMPONENT"
);
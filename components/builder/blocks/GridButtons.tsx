'use client';

import React from 'react';
import { BlockConfig, SimpleButton } from '@/types/builder';
import { cn } from '@/lib/utils';

// CORREÇÃO: Atualizamos a interface para bater com o padrão 'LegoComponent'
// 1. onAction agora é opcional (?)
// 2. A assinatura aceita 'payload' (unknown) para compatibilidade genérica
interface GridButtonsBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const GridButtonsBlock = ({ config, onAction }: GridButtonsBlockProps) => {
  const buttons = (config.data.buttons as SimpleButton[]) || [];

  const handleButtonClick = (action?: string) => {
    // Verificamos se a ação existe no botão E se a função onAction foi passada pelo pai
    if (action && onAction) {
      onAction(action);
    }
  };

  return (
    <div
      className="w-full px-4 py-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleButtonClick(btn.action)}
            className={cn(
              "relative flex items-center justify-center min-h-[64px] py-4 px-3",
              "bg-white border border-gray-300 rounded-xl shadow-sm",
              "active:scale-95 transition-all duration-200 active:bg-gray-50",
              "text-gray-900"
            )}
          >
            <span className="text-[13px] sm:text-sm uppercase tracking-wide font-extrabold text-center leading-tight">
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
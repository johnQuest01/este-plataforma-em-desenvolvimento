'use client';

import React from 'react';
import { BlockConfig, SimpleButton } from '@/types/builder';
import { cn } from '@/lib/utils';

// Adicionamos onAction aqui na interface e nas props
export const ActionButtonsBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string) => void }) => {
  const buttons = (config.data.buttons as SimpleButton[]) || [];

  return (
    <div 
      className="w-full px-4 py-2 pb-6"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            // AQUI ESTÁ A CORREÇÃO: Dispara a ação se ela existir no JSON
            onClick={() => {
              if (btn.action && onAction) {
                onAction(btn.action);
              }
            }}
            className={cn(
              "relative rounded-lg py-3 px-2 shadow-md active:scale-95 transition-transform flex items-center justify-center border border-black/10",
            )}
            style={{ 
              backgroundColor: btn.bgColor || '#5874f6',
            }}
          >
            {/* Badge de Notificação */}
            {btn.badge && (
              <div className="absolute -top-2 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {btn.badge}
              </div>
            )}

            <span 
              className="text-sm font-bold text-center leading-tight"
              style={{ color: btn.textColor || '#ffffff' }}
            >
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { BlockComponentProps, SimpleButton } from '@/types/builder';
import { cn } from '@/lib/utils';

/**
 * ActionButtonsBlockProps: Interface rigorosa seguindo o padrão LegoComponent.
 * onAction é opcional para suportar estados de visualização pura.
 */
interface ActionButtonsBlockProps extends BlockComponentProps {}

/**
 * ActionButtonsBlockBase: Implementação pura do bloco de botões de ação.
 * Renderiza botões abaixo do bloco Box Maryland na tela de inventário.
 */
const ActionButtonsBlockBase = ({ config, onAction }: ActionButtonsBlockProps) => {
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

  // Validação: Se não houver botões, não renderiza nada
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full px-4 py-2 pb-6"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((button) => {
          if (!button || !button.id || !button.label) {
            return null;
          }
          return (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button.action)}
              className={cn(
                "relative rounded-lg py-3 px-2 shadow-md active:scale-95 transition-transform flex items-center justify-center border border-black/10",
              )}
              style={{ 
                backgroundColor: button.bgColor || '#5874f6',
              }}
            >
              {/* Badge de Notificação */}
              {button.badge && (
                <div className="absolute -top-2 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {button.badge}
                </div>
              )}

              <span 
                className="text-sm font-bold text-center leading-tight"
                style={{ color: button.textColor || '#ffffff' }}
              >
                {button.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Exportação do componente
 */
export const ActionButtonsBlock = ActionButtonsBlockBase;
import React from 'react';
import { BlockConfig, SimpleButton } from '@/types/builder';
import { cn } from '@/lib/utils';
import { Settings2 } from 'lucide-react';

export const StockFilterButtonsBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string) => void }) => {
  const buttons = (config.data.buttons as SimpleButton[]) || [];

  // Separamos os botões: os 3 primeiros (Esgotar, Regular, Cheio)
  const topButtons = buttons.slice(0, 3);
  // O botão "Defina"
  const bottomButton = buttons[3];

  return (
    <div
      className="w-full px-4 py-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="flex flex-col gap-3">

        {/* LINHA 1: Filtros Coloridos */}
        <div className="grid grid-cols-3 gap-2">
          {topButtons.map((btn, idx) => (
            <button
              key={idx}
              className={cn(
                "relative flex items-center justify-center py-3 px-1 rounded-xl shadow-sm",
                // Borda muito sutil apenas para definição, sem ser pesada
                "border border-black/5", 
                "active:scale-95 transition-all duration-200"
              )}
              style={{
                backgroundColor: btn.bgColor || '#ffffff',
                color: btn.textColor || '#000000'
              }}
            >
              <span className="text-[13px] font-bold tracking-tight leading-none">
                {btn.label}
              </span>

              {/* Pílula Indicadora Colorida (Estilo moderno) */}
              {btn.indicatorColor && (
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: btn.indicatorColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* LINHA 2: Botão "Defina" (Estilo Inventário: Clean e Sombra Suave) */}
        {bottomButton && (
          <div className="flex justify-center">
            <button
              onClick={() => onAction && onAction('openDefinePopup')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full shadow-sm",
                "bg-white border border-gray-200", // Borda cinza clara, não preta
                "active:scale-95 transition-all duration-200 group hover:border-gray-300"
              )}
            >
              <Settings2 size={16} className="text-gray-500 group-hover:text-gray-800 transition-colors" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {bottomButton.label}
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
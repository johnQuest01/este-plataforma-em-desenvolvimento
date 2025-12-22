// components/builder/blocks/order/OrderVariantSelectorBlock.tsx
'use client';

import React from 'react';
import { BlockConfig, VariantOption } from '@/types/builder';
import { useOrder } from '@/components/builder/context/OrderContext';
import { cn } from '@/lib/utils';

export const OrderVariantSelectorBlock = ({ config }: { config: BlockConfig }) => {
  const { title, variantOptions } = config.data;
  const variants = (variantOptions as VariantOption[]) || [];

  // Identifica qual grupo este bloco controla (ex: 'color', 'size', 'model')
  const groupType = variants[0]?.type || 'default';

  const { selections, setSelection, checkOptionAvailability } = useOrder();

  const handleSelect = (label: string, isDisabled: boolean) => {
    if (isDisabled) return; // Impede seleção de item esgotado
    
    const currentVal = selections[groupType];
    // Lógica Toggle: se já está selecionado, desmarca. Se não, marca.
    setSelection(groupType, currentVal === label ? null : label);
  };

  return (
    <div
      className="w-full px-5 py-3 flex flex-col gap-2.5 border-b border-gray-50 last:border-0"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <h4
        className="font-bold text-sm text-gray-800 capitalize tracking-wider pl-1"
        style={{ color: config.style.textColor || '#000000' }}
      >
        {title as string}
      </h4>

      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant, idx) => {
          // Verifica se este item está selecionado
          const isSelected = selections[groupType] === variant.label;

          // --- CONSULTA ESTOQUE INTELIGENTE ---
          // Pergunta ao contexto: "Se eu selecionar isso, quanto estoque tem?"
          // Isso considera as seleções já feitas nos outros blocos (ex: Cor Vermelha já selecionada)
          const { available, qty } = checkOptionAvailability(groupType, variant.label);
          
          const isDisabled = !available;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(variant.label, isDisabled)}
              disabled={isDisabled}
              className={cn(
                "relative flex flex-col items-start justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 group h-auto min-h-[54px]",
                isSelected
                  ? "bg-gray-900 border-gray-900 text-white shadow-md active:scale-95"
                  : isDisabled
                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-95"
              )}
            >
              <span className="text-sm font-bold text-left leading-tight break-words w-full">
                {variant.label}
              </span>

              <div className="w-full flex items-center justify-between mt-auto pt-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wide",
                  isSelected 
                    ? "text-gray-300" 
                    : isDisabled 
                      ? "text-red-300" 
                      : "text-[#00c853]"
                )}>
                  {isDisabled ? 'Esgotado' : `${qty} un.`}
                </span>
                
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-in zoom-in" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
// components/builder/blocks/StockDistributionPopup.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, Check, User, Package } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlockConfig, SaleswomanData } from '@/types/builder';

// Utilitário para combinar classes Tailwind (Padrão Shadcn UI)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StockDistributionPopupProps {
  block: BlockConfig;
  onClose?: () => void; // Função para fechar o popup
  onConfirm?: (distribution: Record<string, number>) => void; // Função ao confirmar
}

export const StockDistributionPopup: React.FC<StockDistributionPopupProps> = ({ 
  block, 
  onClose,
  onConfirm 
}) => {
  const { data, style, isVisible } = block;
  
  // CORREÇÃO: Inicialização Lazy do State
  // O estado é calculado apenas uma vez na montagem, evitando o useEffect e o render duplo.
  const [distribution, setDistribution] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (data.saleswomen) {
      data.saleswomen.forEach((s: SaleswomanData) => {
        initial[s.id] = 0;
      });
    }
    return initial;
  });

  // Se não estiver visível, não renderiza nada no DOM
  if (!isVisible) return null;

  // Lógica para incrementar (+1)
  const handleIncrement = (id: string) => {
    setDistribution((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  // Lógica para decrementar (-1), impedindo números negativos
  const handleDecrement = (id: string) => {
    setDistribution((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));
  };

  // Cálculos de totais
  const totalDistributed = Object.values(distribution).reduce((acc, curr) => acc + curr, 0);
  const remaining = (data.totalStock || 0) - totalDistributed;

  // Define cor de alerta se distribuir mais que o estoque
  const isOverStock = remaining < 0;

  return (
    // Overlay Escuro (Fundo)
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Card Principal */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-white shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 sm:rounded-2xl rounded-t-2xl",
          style?.borderRadius
        )}
        style={{ backgroundColor: style?.bgColor || '#ffffff' }}
      >
        {/* Header do Popup */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white rounded-t-2xl z-10">
          <div>
            <h3 
              className="text-lg font-bold text-gray-900"
              style={{ color: style?.textColor }}
            >
              {data.title || 'Distribuir Estoque'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Package size={14} />
              <span className="truncate max-w-[200px]">
                {data.productName || 'Produto Selecionado'}
              </span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Barra de Resumo (Sticky top) */}
        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center text-sm font-medium border-b border-gray-100 sticky top-0">
          <span className="text-gray-600">
            {data.labels?.distributedLabel || 'Total Distribuído'}: 
            <span className="ml-2 text-gray-900 font-bold">{totalDistributed}</span>
          </span>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold transition-colors",
            isOverStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          )}>
            {data.labels?.remainingLabel || 'Restante'}: {remaining}
          </span>
        </div>

        {/* Lista de Vendedoras (Área de Scroll) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {data.saleswomen?.map((person: SaleswomanData) => (
            <div 
              key={person.id} 
              className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:border-gray-200 transition-colors"
            >
              {/* Informações da Vendedora */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                  {person.avatarUrl ? (
                    <Image 
                      src={person.avatarUrl} 
                      alt={person.name} 
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm line-clamp-1">
                    {person.name}
                  </span>
                  {distribution[person.id] > 0 && (
                     <span className="text-xs text-green-600 font-medium">
                       Recebe {distribution[person.id]} un.
                     </span>
                  )}
                </div>
              </div>

              {/* Controles (+ / -) */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button 
                  onClick={() => handleDecrement(person.id)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-400 hover:text-gray-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!distribution[person.id] || distribution[person.id] === 0}
                >
                  <Minus size={16} />
                </button>
                
                <div className="w-8 text-center font-bold text-gray-900 tabular-nums">
                  {distribution[person.id] || 0}
                </div>

                <button 
                  onClick={() => handleIncrement(person.id)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-white active:scale-95 transition-all shadow-sm"
                  style={{ backgroundColor: style?.accentColor || '#10b981' }} 
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Espaço extra no final para não cortar conteúdo no mobile */}
          <div className="h-4" />
        </div>

        {/* Rodapé de Ações */}
        <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 pb-8 sm:pb-5">
          <button
            onClick={onClose}
            className="flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent transition-all"
          >
            {data.labels?.cancelButton || 'Cancelar'}
          </button>
          
          <button
            onClick={() => onConfirm && onConfirm(distribution)}
            disabled={isOverStock} // Impede confirmar se estoque estourou
            className={cn(
               "flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all gap-2",
               isOverStock ? "opacity-50 cursor-not-allowed grayscale" : ""
            )}
            style={{ backgroundColor: isOverStock ? '#9ca3af' : (style?.accentColor || '#10b981') }}
          >
            <Check size={18} />
            {data.labels?.confirmButton || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { BlockComponentProps } from '@/types/builder';

export const HistoryLinksBlock = ({ config, onAction }: BlockComponentProps) => {
  
  // "Clientes" removido da lista
  const buttons = [
    { label: 'Vendas Totais', action: 'view_total_sales' },
    { label: 'Vendedoras', action: 'view_sellers' },
  ];

  return (
    <div 
      className="w-full px-6 pb-8 flex flex-col items-center gap-6"
      style={{ backgroundColor: config.style?.bgColor || '#ffffff' }}
    >
       {/* Divisória Horizontal */}
       <div className="w-full h-px bg-black opacity-100" />

       {/* Título da Seção */}
       <h3 className="text-lg font-bold text-black text-center -mt-2">
         Histórico de vendas
       </h3>

       {/* Lista de Botões (Agora apenas com 2 itens) */}
       <div className="w-full flex flex-col gap-4 max-w-[320px]">
         {buttons.map((btn, idx) => (
           <button
             key={idx}
             onClick={() => onAction?.(btn.action)}
             className="w-full h-12 bg-white border-2 border-black rounded-lg text-black font-bold text-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
           >
             {btn.label}
           </button>
         ))}
       </div>
    </div>
  );
};
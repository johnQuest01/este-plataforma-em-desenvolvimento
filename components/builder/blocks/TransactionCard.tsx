'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TransactionCardBlock = ({ config }: { config: BlockConfig }) => {
  // Extrai os dados do JSON
  const title = config.data.title as string;
  const date = config.data.transactionDate as string;
  const value = config.data.transactionValue as string;
  const type = config.data.transactionType as 'in' | 'out'; // 'in' (entrada) ou 'out' (saída)
  const valueColor = config.data.valueColor as string;

  // Define ícone e cor baseada no tipo se não for especificado
  const isIncoming = type === 'in';
  
  return (
    <div 
      className="w-full px-4 mb-3"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.99] transition-transform">
        
        {/* Lado Esquerdo: Ícone e Texto */}
        <div className="flex items-center gap-3">
          {/* Ícone Redondo */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
            isIncoming ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {isIncoming ? (
              <ArrowDownLeft size={24} strokeWidth={2.5} />
            ) : (
              <ArrowUpRight size={24} strokeWidth={2.5} />
            )}
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {title || 'Transação'}
            </span>
            <span className="text-xs font-medium text-gray-400 mt-0.5">
              {date || 'Hoje'}
            </span>
          </div>
        </div>

        {/* Lado Direito: Valor */}
        <div className="text-right">
          <span 
            className="font-black text-base tracking-tight block"
            style={{ color: valueColor || (isIncoming ? '#16a34a' : '#ef4444') }}
          >
            {value || 'R$ 0,00'}
          </span>
        </div>

      </div>
    </div>
  );
};
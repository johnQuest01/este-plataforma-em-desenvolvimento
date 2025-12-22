// components/builder/blocks/order/OrderProductInfoBlock.tsx
'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { CheckCircle2 } from 'lucide-react';

export const OrderProductInfoBlock = ({ config }: { config: BlockConfig }) => {
  const { productName, productImage } = config.data;

  return (
    <div 
      className="w-full px-5 py-6 flex gap-5 border-b border-gray-100 items-stretch"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {/* FOTO - Mantida Grande (w-[140px]) */}
      <div className="w-[140px] aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200 shadow-md shrink-0 bg-gray-50">
        <img 
          src={(productImage as string) || 'https://placehold.co/400x500'} 
          alt="Product" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* INFO */}
      <div className="flex-1 flex flex-col justify-center gap-3 min-w-0 py-1">
        {/* Título Grande */}
        <h3 className="text-2xl font-black text-gray-900 leading-[1.1] line-clamp-3 tracking-tight">
          {(productName as string) || 'Produto'}
        </h3>
        
        {/* Bloco Vendedora */}
        <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-500 font-medium">
               <span>Vendedora Autorizada:</span>
               
               {/* Nome e Ícone agrupados para ficarem juntos */}
               <div className="flex items-center gap-1.5">
                   <span className="text-[#5874f6] font-black text-lg tracking-tight">
                     Mayra
                   </span>
                   {/* Logo Verificado ao lado do nome */}
                   <CheckCircle2 size={18} strokeWidth={3} className="text-[#5874f6]" />
               </div>
            </div>
            
            <div className="inline-flex self-start">
                {/* Badge Verde */}
                <span className="bg-green-50 text-green-700 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border border-green-100 shadow-sm flex items-center gap-1">
                    Em Estoque
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};
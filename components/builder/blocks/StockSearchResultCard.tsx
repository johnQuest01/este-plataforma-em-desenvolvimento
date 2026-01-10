// components/builder/blocks/StockSearchResultCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { BlockConfig } from '@/types/builder';
import { Package, Palette, Ruler, Tag } from 'lucide-react';

// CORREÇÃO: 'any' substituído por 'React.ElementType'
const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600">
      <Icon size={14} className="shrink-0 text-gray-400" />
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
};

export const StockSearchResultCardBlock = ({ config }: { config: BlockConfig }) => {
  const {
    productName,
    productImage,
    productSize,
    productVariation,
    productColor,
    availableStock
  } = config.data;

  return (
    <div className="w-full px-4 mb-3">
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start relative overflow-hidden transition-all hover:shadow-md">
        
        {/* --- LADO ESQUERDO: MINI PREVIEW DA FOTO --- */}
        <div className="relative w-24 h-24 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
           {productImage ? (
             <Image 
               src={productImage as string} 
               alt={productName as string}
               fill
               className="object-cover"
               sizes="96px"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={28} />
             </div>
           )}
        </div>

        {/* --- LADO DIREITO: DETALHES DO PRODUTO --- */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-24">
          {/* Nome do Produto */}
          <h3 className="font-black text-gray-900 text-base leading-tight truncate mb-2">
            {productName as string}
          </h3>

          {/* Grid de Detalhes */}
          <div className="flex flex-col gap-1">
             <DetailRow icon={Ruler} label="Tam" value={productSize as string} />
             <DetailRow icon={Palette} label="Cor" value={productColor as string} />
             <DetailRow icon={Tag} label="Var" value={productVariation as string} />
          </div>

          {/* Badge de Estoque (Posicionado no canto superior direito) */}
          <div className="absolute top-3 right-3 flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estoque</span>
            <div className="text-blue-600 font-black text-lg leading-none">
              {availableStock as number}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
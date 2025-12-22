// components/builder/blocks/StockPopupCard.tsx
'use client';

import React from 'react';
import { BlockConfig, ProductVariationData } from '@/types/builder';

export const StockPopupCardBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string, payload?: unknown) => void }) => {
  const {
    productName,
    productImage,
    price,
    detailedVariations = [] 
  } = config.data;

  // Casting seguro para uso na renderização
  const variations = detailedVariations as ProductVariationData[];

  return (
    <div className="w-full px-4 mb-3">
      {/* CARD PRINCIPAL */}
      <div 
        onClick={() => onAction && onAction('open_product_details', config.id)}
        className="bg-white border border-black rounded-lg p-3 flex gap-3 items-stretch shadow-sm h-full cursor-pointer active:scale-[0.99] transition-transform"
      >
        
        {/* LADO ESQUERDO: Imagem */}
        <div className="w-28 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative">
           <img 
             src={productImage as string || 'https://placehold.co/300x400'} 
             alt={productName as string}
             className="w-full h-full object-cover"
           />
        </div>

        {/* LADO DIREITO: Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          
          {/* Título do Produto */}
          <h3 className="font-bold text-black text-[14px] leading-tight mb-2 truncate">
            {productName as string}
          </h3>

          {/* CAIXA DE DETALHES (Borda Preta) */}
          <div className="border border-black rounded-md p-2 flex-1 mb-2 bg-white overflow-hidden flex flex-col gap-1 pointer-events-none">
             
             {/* Lista as variações formatadas */}
             <div className="overflow-y-auto scrollbar-hide flex flex-col gap-2 max-h-[80px]">
               {variations.length > 0 ? (
                 variations.map((v, idx) => (
                   <div key={idx} className="flex flex-col border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                     {/* Linha 1: Atributos */}
                     <span className="text-[11px] font-bold text-black leading-tight">
                       Cor: {v.color} <span className="mx-0.5">|</span> Tam: {v.size}
                       {v.variation && (
                         <span className="block mt-0.5 text-gray-600 font-medium">
                           Tipo: {v.variation}
                         </span>
                       )}
                     </span>
                     {/* Linha 2: Quantidade Específica */}
                     <span className="text-[11px] font-bold text-[#00c853] mt-0.5">
                       Estoque: {v.quantity} un.
                     </span>
                   </div>
                 ))
               ) : (
                 <span className="text-[10px] text-gray-400 font-medium">
                   Sem variações cadastradas.
                 </span>
               )}
             </div>

          </div>

          {/* RODAPÉ: Preço e Botão */}
          <div className="flex items-center justify-between mt-auto pt-1">
             <span className="font-black text-sm text-black">
                {price as string || 'R$ 0,00'}
             </span>

             <button className="bg-[#00c853] text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-[4px] shadow-sm hover:bg-[#00b34a] transition-colors">
                Ver Detalhes
             </button>
          </div>

        </div>

      </div>
    </div>
  );
};
// components/builder/blocks/StockPopupCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
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
    <div className="w-full px-2 md:px-4 mb-3">
      {/* CARD PRINCIPAL */}
      <div 
        onClick={() => onAction && onAction('open_product_details', config.id)}
        className="bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer active:scale-[0.98] group overflow-hidden"
      >
        {/* Layout Horizontal para Mobile e Desktop */}
        <div className="flex flex-row gap-3 md:gap-4 p-3 md:p-4">
          
          {/* IMAGEM: Esquerda (Mobile e Desktop) */}
          <div className="relative w-24 md:w-28 h-24 md:h-28 shrink-0 bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-100 group-hover:border-blue-200 transition-colors">
             {productImage ? (
               <Image 
                 src={productImage as string} 
                 alt={productName as string}
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 96px, 112px"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                 <span className="text-gray-400 text-[10px] md:text-xs font-bold">Sem Foto</span>
               </div>
             )}
          </div>

          {/* CONTEÚDO: Mobile (embaixo) | Desktop (direita) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 md:gap-2">
            
            {/* Título e Preço */}
            <div className="flex flex-col gap-1.5">
              <h3 className="font-black text-gray-900 text-[13px] md:text-base leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {productName as string}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-black text-[15px] md:text-lg text-blue-600">
                  {price as string || 'R$ 0,00'}
                </span>
              </div>
            </div>

            {/* CAIXA DE DETALHES - Mobile: Compacta | Desktop: Expandida */}
            <div className="border border-gray-200 rounded-lg p-2 md:p-2.5 bg-gray-50 overflow-hidden flex flex-col gap-1.5 pointer-events-none">
               
               {/* Lista as variações formatadas */}
               <div className="overflow-y-auto scrollbar-hide flex flex-col gap-1 md:gap-1.5 max-h-[80px] md:max-h-[100px]">
                 {variations.length > 0 ? (
                   variations.map((v, idx) => (
                     <div key={idx} className="flex flex-col gap-0.5 p-1.5 bg-white rounded border border-gray-100">
                       {/* Linha 1: Atributos - Mobile: Vertical | Desktop: Horizontal */}
                       <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 md:flex-wrap">
                         <span className="text-[10px] md:text-[11px] font-bold text-gray-700">
                           <span className="text-gray-500">Cor:</span> {v.color}
                         </span>
                         <span className="hidden md:inline text-gray-300">|</span>
                         <span className="text-[10px] md:text-[11px] font-bold text-gray-700">
                           <span className="text-gray-500">Tam:</span> {v.size}
                         </span>
                         {v.variation && (
                           <>
                             <span className="hidden md:inline text-gray-300">|</span>
                             <span className="text-[10px] md:text-[11px] font-medium text-gray-600">
                               {v.variation}
                             </span>
                           </>
                         )}
                       </div>
                       {/* Linha 2: Quantidade Específica */}
                       <div className="flex items-center gap-1 mt-0.5">
                         <span className="text-[10px] md:text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                           Estoque: {v.quantity} un.
                         </span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <span className="text-[10px] md:text-[11px] text-gray-400 font-medium text-center py-2">
                     Sem variações cadastradas
                   </span>
                 )}
               </div>

            </div>

            {/* RODAPÉ: Botão - Mobile: Full Width | Desktop: Alinhado à Direita */}
            <div className="flex items-center justify-stretch md:justify-end pt-1">
               <button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[11px] md:text-xs font-black uppercase px-3 md:px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2">
                  Ver Detalhes
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
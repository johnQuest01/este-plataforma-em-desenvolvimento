'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RegisteredProductResult } from '@/schemas/jeans-registration-schema';

interface JeansResultCardProps {
  product: RegisteredProductResult;
}

export const JeansResultCard = ({ product }: JeansResultCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="w-full bg-white border border-black rounded-lg p-3 flex gap-3 items-stretch shadow-sm mb-3 shrink-0"
  >
    {/* LADO ESQUERDO: Imagem */}
    <div className="w-28 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative group">
       <Image
         src={product.imageUrl || 'https://placehold.co/300x400?text=Sem+Imagem'}
         alt={product.name}
         fill
         className="object-cover transition-transform duration-500 group-hover:scale-110"
         unoptimized
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
       />
       
       {!product.imageUrl && (
         <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 text-center font-bold p-1 z-10">
           Aguardando img...
         </div>
       )}
    </div>

    {/* LADO DIREITO: Conteúdo */}
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <h3 className="font-bold text-black text-[14px] leading-tight mb-2 truncate">
        {product.name}
      </h3>

      {/* CAIXA DE DETALHES */}
      <div className="border border-black rounded-md p-2 flex-1 mb-2 bg-white overflow-hidden flex flex-col gap-1">
         <div className="flex flex-col gap-1">
           <span className="text-[11px] font-bold text-black leading-tight bg-gray-100 px-1 rounded w-fit">
             Ref: {product.reference}
           </span>
           
           {/* Lista de Variações com Scroll */}
           <div className="max-h-[60px] overflow-y-auto scrollbar-hide">
            {product.variations.map((v, idx) => {
              // LÓGICA DE FORMATAÇÃO: Remove redundâncias
              const cleanSize = v.size.replace(/tam|tamanho|size|:/gi, '').trim();
             
              return (
                <div key={idx} className="flex justify-between items-center border-t border-gray-100 pt-1 mt-1 first:border-0 first:pt-0 first:mt-0">
                    <span className="text-[11px] font-bold text-black">
                      Tam: {cleanSize}
                    </span>
                    <span className="text-[11px] font-bold text-[#00c853]">
                      + {v.qty} un.
                    </span>
                </div>
              );
            })}
           </div>
         </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
         <span className="font-black text-sm text-black">
            Total: {product.totalQty} un
         </span>
         <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-[#00c853] w-2 h-2 rounded-full shadow-[0_0_5px_#00c853]"
         />
      </div>
    </div>
  </motion.div>
);
'use client';


import React from 'react';
import { BlockConfig, ProductVariationData } from '@/types/builder';
import { Package, ChevronRight, Layers } from 'lucide-react'; // <--- Adicionado Layers


// CORREÇÃO: trocado 'payload?: any' por 'payload?: unknown'
export const StockDetailedProductCardBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string, payload?: unknown) => void }) => {
  const {
    productName,
    productImage,
    detailedVariations = [] // Array de variações (Ex: [{size: 'P', color: 'Azul', qty: 10}, ...])
  } = config.data;


  // Casting para garantir o tipo correto (caso o TypeScript reclame)
  const variationsList = detailedVariations as ProductVariationData[];


  // Calcula o estoque total somando as quantidades de todas as variações
  const totalStock = variationsList.reduce((acc, curr) => acc + curr.quantity, 0);


  return (
    <div className="w-full px-4 mb-3">
      {/* Card Container - Clicável */}
      <div
        onClick={() => onAction && onAction('open_product_details', config.id)}
        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md active:scale-[0.99] cursor-pointer"
      >
        <div className="flex gap-4 items-stretch">
            {/* --- LADO ESQUERDO: MINI PREVIEW DA FOTO --- */}
            <div className="w-28 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative flex items-center justify-center">
            {productImage ? (
                <img
                src={productImage as string}
                alt={productName as string}
                className="w-full h-full object-cover"
                />
            ) : (
                <Package size={32} className="text-gray-300" />
            )}
           
            {/* Badge de Estoque Total sobre a Imagem */}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1 text-center">
                <span className="text-[10px] text-white/80 font-medium uppercase block leading-none">Total</span>
                <span className="text-white font-bold text-sm leading-none">{totalStock}</span>
            </div>
            </div>


            {/* --- LADO DIREITO: LISTA DE VARIAÇÕES --- */}
            <div className="flex-1 min-w-0 flex flex-col">
           
            {/* Cabeçalho: Nome do Produto */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-gray-900 text-[15px] leading-tight line-clamp-2">
                {productName as string}
                </h3>
                <ChevronRight size={18} className="text-gray-300 mt-0.5 shrink-0" />
            </div>


            {/* Grid/Lista de Variações */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1 flex flex-col gap-1.5 max-h-[120px]">
                {variationsList.length > 0 ? (
                variationsList.map((variation, index) => (
                    // Linha de Variação (Ex: G | Azul Marinho --- 12 un)
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100 text-xs">
                   
                    {/* Detalhes da Variação */}
                    <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-black bg-white border border-gray-200 px-1.5 rounded-sm min-w-[24px] text-center">
                        {variation.size}
                        </span>
                        <div className="flex flex-col leading-none truncate">
                            <span className="text-gray-600 truncate">
                                {variation.color}
                                {variation.variation && <span className="text-gray-400"> • {variation.variation}</span>}
                            </span>
                        </div>
                    </div>


                    {/* Quantidade */}
                    <div className="flex items-baseline gap-1 pl-2 shrink-0">
                        <span className={`font-black text-sm ${variation.quantity > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {variation.quantity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">un.</span>
                    </div>
                    </div>
                ))
                ) : (
                <div className="text-xs text-gray-400 italic py-2">Nenhuma variação cadastrada.</div>
                )}
            </div>
            </div>
        </div>


        {/* --- BOTÃO DE AÇÃO (Recolocado) --- */}
        <button
            onClick={(e) => {
                e.stopPropagation();
                alert(`Separando estoque para vendedoras: ${productName}`);
            }}
            className="w-full h-10 bg-white border-2 border-[#5874f6] text-[#5874f6] rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
        >
            <Layers size={16} strokeWidth={2.5} />
            Separar para cada vendedora
        </button>


      </div>
    </div>
  );
};

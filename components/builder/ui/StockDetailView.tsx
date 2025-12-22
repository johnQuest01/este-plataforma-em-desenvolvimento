// components/builder/ui/StockDetailView.tsx
'use client';

import React from 'react';
import { ChevronLeft, Box, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { ProductVariationData } from '@/types/builder';
import { cn } from '@/lib/utils';

// Definimos a interface do produto que esta tela espera receber
interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: string;
    variations: ProductVariationData[];
  };
  onBack: () => void;
}

export const StockDetailView = ({ product, onBack }: ProductDetailViewProps) => {
  // Calcula o estoque total somando as quantidades de todas as variações
  const totalStock = product.variations.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] animate-in slide-in-from-right duration-300">
      
      {/* 1. CABEÇALHO */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 shadow-sm shrink-0 z-10">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consulta de Estoque</span>
          <h2 className="text-sm font-black text-gray-900 leading-none truncate max-w-[200px]">
            {product.name}
          </h2>
        </div>
      </div>

      {/* 2. CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        
        {/* Bloco da Imagem e Resumo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex gap-4">
          <div className="w-24 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center flex-1 gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Box size={14} />
              <span>Estoque Total</span>
            </div>
            <span className="text-4xl font-black text-[#5874f6] tracking-tight leading-none">
              {totalStock}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md w-fit border border-gray-100">
              {product.variations.length} variações cadastradas
            </span>
          </div>
        </div>

        {/* Lista Detalhada de Variações */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide ml-1 flex items-center gap-1.5">
            <Layers size={14} className="text-gray-400"/> Detalhamento por Item
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {product.variations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {product.variations.map((variant, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    
                    {/* Lado Esquerdo: Atributos */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {/* Badge de Cor */}
                        <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="text-[11px] font-bold text-gray-700 uppercase">{variant.color}</span>
                        </div>
                        {/* Badge de Tamanho */}
                        <div className="w-7 h-6 flex items-center justify-center bg-black text-white text-[10px] font-black rounded-md shadow-sm">
                          {variant.size}
                        </div>
                      </div>
                      
                      {/* Tipo/Variação Extra */}
                      {variant.variation && (
                        <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 w-fit">
                          <Sparkles size={10} className="text-purple-500" />
                          <span className="text-[10px] font-bold text-purple-700 uppercase">{variant.variation}</span>
                        </div>
                      )}
                    </div>

                    {/* Lado Direito: Quantidade */}
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Qtd.</span>
                      <span className={cn(
                        "text-lg font-black leading-none",
                        variant.quantity > 0 ? "text-[#00c853]" : "text-red-500"
                      )}>
                        {variant.quantity}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center opacity-60">
                <AlertCircle size={32} className="text-gray-300 mb-2"/>
                <p className="text-xs font-bold text-gray-400">Nenhuma variação registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RODAPÉ FIXO (BOTÃO + AVISO) */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0 pb-safe-bottom flex flex-col gap-4">
        
        {/* Botão de Ação (Topo do Rodapé) */}
        <button
          onClick={() => alert(`Separando estoque para vendedoras: ${product.name}`)}
          className="w-full h-12 bg-white border-2 border-[#5874f6] text-[#5874f6] rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
        >
          <Layers size={18} strokeWidth={2.5} />
          SEPARAR PARA CADA VENDEDORA
        </button>

        {/* Aviso Informativo (Abaixo do botão, estilo original restaurado) */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
            <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
              Esta é uma tela de consulta. As quantidades exibidas refletem o estoque atual disponível para venda na loja virtual.
            </p>
        </div>

      </div>

    </div>
  );
};
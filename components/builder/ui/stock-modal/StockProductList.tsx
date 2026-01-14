'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { ProductData } from '@/app/actions/product';
import { mapToDisplayVariations } from './types';
import { formatCurrencyBRL } from '@/lib/utils/currency';

interface StockProductListProps {
  searchQuery: string;
  contentBlocks: BlockConfig[];
  filteredProducts: ProductData[];
  dbProducts: ProductData[];
  onAction: (action: string, payload?: unknown) => void;
}

export const StockProductList = ({ 
  searchQuery, 
  contentBlocks, 
  filteredProducts, 
  dbProducts, 
  onAction 
}: StockProductListProps) => {
  
  return (
    <div className="w-full h-full">
      {/* 1. Static Content Blocks (Filters, etc.) */}
      {searchQuery.length === 0 && (
        <div className="mb-2">
          {contentBlocks.map((block) => (
            <BlockRenderer key={block.id} config={block} onAction={onAction} />
          ))}
        </div>
      )}

      {/* 2. Dynamic Product Grid */}
      {searchQuery.length > 0 ? (
        // SEARCH MODE
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-3 md:mb-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider px-2 md:px-0">
            Resultados da Busca ({filteredProducts.length})
          </div>
          {filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-3">
              {filteredProducts.map(prod => {
                const formattedPrice = formatCurrencyBRL(prod.price ?? 0);
                const blockData = {
                  productName: prod.name,
                  productImage: prod.imageUrl ?? undefined, 
                  price: formattedPrice,
                  detailedVariations: mapToDisplayVariations(prod.variants)
                };
                return (
                  <BlockRenderer
                    key={prod.id}
                    config={{
                      id: `card_${prod.id}`,
                      type: 'stock-popup-card',
                      isVisible: true,
                      style: {},
                      data: blockData as BlockConfig['data']
                    }}
                    onAction={onAction}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 font-bold text-xs md:text-sm px-2">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      ) : (
        // DEFAULT LIST MODE
        <div className="px-4 mt-2 animate-in fade-in duration-300">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Produtos Cadastrados
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {dbProducts.length} itens
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {dbProducts.map((prod) => {
              const variants = prod.variants || [];
              const totalQty = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
              
              return (
                <BlockRenderer
                  key={prod.id}
                  config={{
                    id: `card_${prod.id}`,
                    type: 'stock-simple-card',
                    isVisible: true,
                    style: {},
                    data: {
                      productName: prod.name,
                      qty: totalQty,
                      // FIX: Convert null to undefined strictly
                      productImage: prod.imageUrl ?? undefined 
                    }
                  }}
                  onAction={onAction}
                />
              );
            })}
          </div>

          {dbProducts.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-xs font-medium border-2 border-dashed border-gray-200 rounded-xl mt-2">
              Nenhum produto cadastrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
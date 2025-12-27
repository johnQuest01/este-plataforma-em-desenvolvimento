'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BlockConfig } from '@/types/builder';
import { Heart, Send, PackageX, MapPin } from 'lucide-react';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { PRODUCT_UPDATE_EVENT } from '@/components/builder/blocks/ProductGrid';

// Interface atualizada para receber onAction
interface CategoryProductListBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const CategoryProductListBlock = ({ config, onAction }: CategoryProductListBlockProps) => {
  const targetCategory = (config.data.targetCategory as string) || '';
  const targetStock = (config.data.targetStock as string) || '';

  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const dbProducts = await getProductsAction();
      setProducts(dbProducts);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const handleUpdate = () => fetchProducts();
    if (typeof window !== 'undefined') {
      window.addEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
      }
    };
  }, [fetchProducts]);

  // Filtra produtos pela categoria E pelo estoque
  const filteredProducts = products.filter(p =>
    p.variations.some(v => {
      const matchCategory = v.category.toLowerCase().trim() === targetCategory.toLowerCase().trim();
      const matchStock = targetStock ? v.stockLocations?.includes(targetStock) : true;
      return matchCategory && matchStock;
    })
  );

  return (
    <div
      className="w-full px-4 pt-4 pb-24"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {filteredProducts.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
          <PackageX size={48} className="text-gray-300"/>
          <p className="text-gray-400 font-bold text-sm">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const mainImage = product.mainImage || product.variations[0]?.images[0] || '';
            const price = product.price && product.price !== 'R$ 0,00' ? product.price : null;
            const stockName = targetStock || product.variations[0]?.stockLocations?.[0] || 'Estoque Geral';

            return (
              <div
                key={product.id}
                // --- CORREÇÃO DE INTERAÇÃO ---
                // Adicionamos o onClick para disparar o evento 'openProductOrder'
                // passando o objeto do produto completo como payload.
                onClick={() => {
                    if (onAction) {
                        onAction('openProductOrder', product);
                    }
                }}
                className="bg-white border border-black rounded-2xl p-3 flex flex-col gap-2 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden cursor-pointer"
              >
                {/* --- HEADER DO ESTOQUE --- */}
                <div className="flex items-center gap-1.5 pb-1.5 mb-0.5 border-b border-gray-100">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase truncate tracking-wide max-w-full">
                    {stockName}
                  </span>
                </div>

                {/* Imagem */}
                <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative pointer-events-none">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <span className="text-xs font-bold">Sem Foto</span>
                    </div>
                  )}
                </div>

                {/* Info do Produto */}
                <div className="flex flex-col gap-0.5 pointer-events-none">
                  <h3 className="text-lg font-black text-black leading-tight line-clamp-2 min-h-[2.2em] tracking-wide mt-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-black text-black">
                      {price}
                    </span>

                    <div className="flex gap-2 text-black">
                      <Send size={18} strokeWidth={1.5} className="-rotate-12" />
                      <Heart size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Botão Disponível */}
                <button className="w-full py-2 bg-[#00c853] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-transform border border-green-600 hover:bg-[#00b34a] pointer-events-none">
                  DISPONÍVEL
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
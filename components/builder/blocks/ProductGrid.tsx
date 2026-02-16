'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, PackageX } from 'lucide-react';
// ✅ CORREÇÃO: Removido 'ProductItem' que não estava sendo usado
import { BlockConfig } from '@/types/builder';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { useRouter } from 'next/navigation';
import { formatCurrencyBRL } from '@/lib/utils/currency';
import Image from 'next/image';

export const PRODUCT_UPDATE_EVENT = 'product_db_updated';

interface ProductGridBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void; // 🧱 NOVO: Suporte para ações
}

export const ProductGridBlock = ({ config, onAction }: ProductGridBlockProps) => {
  const router = useRouter();
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

    const interval = setInterval(fetchProducts, 10000); // Polling de 10s

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
      }
      clearInterval(interval);
    };
  }, [fetchProducts]);

  const hasDbProducts = products.length > 0;
  // Cast seguro pois ProductData é compatível com a estrutura esperada, mas priorizamos DB
  const displayProducts = hasDbProducts ? products : (config.data.products as unknown as ProductData[] || []);
  const title = config.data.title as string;

  const handleProductClick = (product: ProductData) => {
    // 🧱 NOVO: Usa modal se onAction estiver disponível, senão navega
    if (onAction) {
      onAction('open_product_details', product.id);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  return (
    <div
      className="w-full py-6 flex flex-col gap-4 relative min-h-[200px]"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {title && (
        <div className="px-4 flex items-center justify-between">
          <h3 className="font-bold text-lg tracking-tight" style={{ color: config.style.textColor || '#000000' }}>
            {title}
          </h3>
          <div className="flex items-center text-xs font-medium text-gray-400 gap-1 cursor-pointer hover:text-blue-600 transition-colors">
            Ver tudo <ArrowRight size={12} />
          </div>
        </div>
      )}

      {displayProducts.length === 0 && !isLoading ? (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 mx-4 rounded-xl bg-gray-50">
          <PackageX size={32} className="mb-2 opacity-50"/>
          <span className="text-xs font-bold uppercase tracking-wide">Sem produtos</span>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
          {displayProducts.map((item, index) => {
            const name = item.name;
            const price = item.price; // String ISO ou formatada

            // Lógica de imagem prioritária
            let imageUrl = item.imageUrl;
            if (!imageUrl && item.variants && item.variants.length > 0) {
               imageUrl = item.variants[0].images?.[0];
            }
            if (!imageUrl) {
               imageUrl = `https://placehold.co/800x800/e2e8f0/white?text=${name.substring(0,3)}`;
            }

            // Key única garantida (ID ou fallback para index)
            const uniqueKey = item.id ? `prod-${item.id}` : `prod-idx-${index}`;

            // 🎯 NETFLIX UX: Largura FIXA de 150px para TODOS os cards
            // Garante uniformidade total independente da quantidade
            const cardWidth = '150px';

            return (
              <div
                key={uniqueKey}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white relative flex flex-col shadow-sm snap-start shrink-0 cursor-pointer active:scale-[0.98] transition-transform duration-200"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth
                }}
                onClick={() => handleProductClick(item)}
              >
                <div className="text-center py-1 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  {item.id ? 'Novo' : (item.tag || 'Oferta')}
                </div>

                <div className="relative aspect-3/4 bg-gray-100 group overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 170px, 200px"
                  />
                </div>

                <div className="p-3 text-left border-t border-gray-100 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight h-9">
                      {name}
                    </p>
                    {price && (
                      <p className="font-black text-gray-900 text-base mt-1">
                        {formatCurrencyBRL(price)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
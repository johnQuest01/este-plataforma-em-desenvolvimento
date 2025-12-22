// components/builder/blocks/ProductGrid.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, PackageX } from 'lucide-react';
import { BlockConfig, ProductItem } from '@/types/builder';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { useRouter } from 'next/navigation';

export const PRODUCT_UPDATE_EVENT = 'product_db_updated';

export const ProductGridBlock = ({ config }: { config: BlockConfig }) => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca produtos do Server Action
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

    const handleUpdate = () => {
      console.log("⚡ Atualizando Grid com novos produtos...");
      fetchProducts();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
    }

    // Polling de segurança a cada 3s
    const interval = setInterval(fetchProducts, 3000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
      }
      clearInterval(interval);
    };
  }, [fetchProducts]);

  // Se tiver produtos no banco, usa eles. Senão, usa os do JSON (config)
  const hasDbProducts = products.length > 0;
  const displayProducts = hasDbProducts ? products : (config.data.products as ProductItem[] || []);
  const title = config.data.title as string;

  const handleProductClick = (product: ProductData) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      className="w-full py-6 flex flex-col gap-4 relative min-h-[200px]"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {/* Cabeçalho */}
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

      {/* GRID HORIZONTAL */}
      {displayProducts.length === 0 && !isLoading ? (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 mx-4 rounded-xl bg-gray-50">
          <PackageX size={32} className="mb-2 opacity-50"/>
          <span className="text-xs font-bold uppercase tracking-wide">Sem produtos</span>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory touch-pan-x">
          {displayProducts.map((item, idx) => {
            // Tipagem híbrida (pode ser do Banco ou do JSON)
            const prod = item as ProductData & ProductItem;
            const isDbProduct = !!prod.id;
            const name = prod.name;
            const price = prod.price;

            // --- LÓGICA DE IMAGEM CORRIGIDA ---
            let imageUrl = '';
            
            if (isDbProduct) {
               // Prioridade 1: Imagem principal (Base64 real)
               if (prod.mainImage) {
                 imageUrl = prod.mainImage;
               } 
               // Prioridade 2: Primeira variação com imagem
               else if (prod.variations && prod.variations.length > 0 && prod.variations[0].images?.[0]) {
                 imageUrl = prod.variations[0].images[0];
               }
               // Fallback: Placeholder
               else {
                 imageUrl = `https://placehold.co/800x800/e2e8f0/white?text=${name.substring(0,3)}`;
               }
            } else {
               // Produtos do JSON (Estáticos)
               imageUrl = prod.imageUrl || `https://placehold.co/800x800/${prod.imageColor || 'e2e8f0'}/white?text=Oferta`;
            }

            return (
              <div
                key={prod.id || idx}
                className="min-w-[170px] max-w-[170px] border border-gray-200 rounded-xl overflow-hidden bg-white relative flex flex-col shadow-sm snap-start shrink-0 cursor-pointer active:scale-[0.98] transition-transform duration-200"
                onClick={() => {
                  if (isDbProduct) handleProductClick(prod);
                }}
              >
                {/* Tag */}
                <div className="text-center py-1 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  {isDbProduct ? 'Novo' : (prod.tag || 'Oferta')}
                </div>

                {/* Imagem */}
                <div className="relative aspect-[3/4] bg-gray-100 group overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-3 text-left border-t border-gray-100 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight h-9">
                      {name}
                    </p>
                    {price && (
                      <p className="font-black text-gray-900 text-base mt-1">{price}</p>
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
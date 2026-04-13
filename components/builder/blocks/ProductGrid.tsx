'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, PackageX } from 'lucide-react';
import { BlockConfig } from '@/types/builder';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { SellerEcosystemProductDTO } from '@/app/actions/seller-store-actions';
import { useSellerContext } from '@/lib/seller-context';
import { useRouter } from 'next/navigation';
import { formatCurrencyBRL } from '@/lib/utils/currency';
import Image from 'next/image';

export const PRODUCT_UPDATE_EVENT = 'product_db_updated';

interface ProductGridBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const ProductGridBlock = ({ config, onAction }: ProductGridBlockProps): React.JSX.Element => {
  const router = useRouter();
  const { isSellerMode, sellerSlug, sellerProducts } = useSellerContext();

  // Em modo vendedor, usa os produtos do contexto DIRETAMENTE (sem estado intermediário).
  // Isso elimina o "flash" de produtos Maryland que acontecia durante o useEffect de sync.
  const [mdProducts, setMdProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(!isSellerMode);

  const fetchMdProducts = useCallback(async () => {
    try {
      const dbProducts = await getProductsAction();
      setMdProducts(dbProducts);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Em modo vendedor não precisamos buscar os produtos do catálogo Maryland
    if (isSellerMode) {
      setIsLoading(false);
      return;
    }

    fetchMdProducts();

    const handleUpdate = () => fetchMdProducts();
    if (typeof window !== 'undefined') {
      window.addEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
    }
    const interval = setInterval(fetchMdProducts, 10000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PRODUCT_UPDATE_EVENT, handleUpdate);
      }
      clearInterval(interval);
    };
  }, [fetchMdProducts, isSellerMode]);

  // Em modo vendedor: usa DIRETAMENTE o contexto (sem hop de estado)
  // Em modo normal: usa os produtos do DB, com fallback nos dados estáticos do config
  const displayProducts = isSellerMode
    ? sellerProducts
    : (mdProducts.length > 0 ? mdProducts : (config.data.products as unknown as ProductData[] || []));
  const title = (isSellerMode ? '🛍️ Produtos da Loja' : config.data.title) as string;

  const handleProductClick = (product: ProductData | SellerEcosystemProductDTO) => {
    // Slug do contexto (funciona tanto para visitante quanto para vendedora logada)
    const sellerParam = isSellerMode && sellerSlug ? `?seller=${sellerSlug}` : '';
    if (onAction) {
      // Passa o sufixo via pipe para o DashboardPage redirecionar corretamente
      onAction('open_product_details', sellerParam ? `${product.id}|${sellerParam}` : product.id);
    } else {
      router.push(`/product/${product.id}${sellerParam}`);
    }
  };

  return (
    <div
      className="w-full py-2 flex flex-col gap-1.5 relative min-h-[100px]"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {title && (
        <div className="px-4 flex items-center justify-between pt-1">
          <h3 className="font-bold text-sm tracking-tight" style={{ color: config.style.textColor || '#000000' }}>
            {title}
          </h3>
          <div className="flex items-center text-[10px] font-medium text-gray-400 gap-1 cursor-pointer hover:text-blue-600 transition-colors">
            Ver tudo <ArrowRight size={10} />
          </div>
        </div>
      )}

      {displayProducts.length === 0 && !isLoading ? (
        <div className="px-4 py-2 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 mx-4 rounded-md bg-gray-50">
          <PackageX size={16} className="mb-1 opacity-50"/>
          <span className="text-[8px] font-bold uppercase tracking-wide">Sem produtos</span>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto px-4 pb-1.5 scrollbar-hide snap-x snap-mandatory">
          {displayProducts.map((item, index) => {
            const name = item.name;
            const price = item.price;
            const stockQty = 'stock' in item ? item.stock : 0;

            let imageUrl = item.imageUrl ?? null;
            if (!imageUrl && 'variants' in item && Array.isArray(item.variants) && item.variants.length > 0) {
              const v = item.variants[0] as { images?: string[] };
              imageUrl = v.images?.[0] ?? null;
            }
            if (!imageUrl) {
              imageUrl = `https://placehold.co/800x800/e2e8f0/white?text=${name.substring(0, 3)}`;
            }

            const uniqueKey = item.id ? `prod-${item.id}` : `prod-idx-${index}`;

            const cardWidth = '120px';

            return (
              <div
                key={uniqueKey}
                className="border border-gray-200 rounded-md overflow-hidden bg-white relative flex flex-col shadow-sm snap-start shrink-0 cursor-pointer active:scale-[0.98] transition-transform duration-200"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth
                }}
                onClick={() => handleProductClick(item)}
              >
                <div className="text-center py-[2px] text-[7px] leading-none uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  {item.id ? 'Novo' : (item.tag || 'Oferta')}
                </div>

                <div className="relative aspect-3/4 bg-gray-100 group overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 120px, 140px"
                  />
                </div>

                <div className="p-2 text-left border-t border-gray-100 flex flex-col gap-2" style={{ minHeight: '80px' }}>
                  <p className="font-medium text-gray-800 text-[10px] line-clamp-3 leading-tight">
                    {name}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    {price && (
                      <p className="font-black text-gray-900 text-[11px] leading-none truncate pr-1">
                        {formatCurrencyBRL(price)}
                      </p>
                    )}

                    {stockQty <= 0 && (
                      <div className="bg-orange-500 rounded-[2px] px-1.5 py-[2px] shrink-0 shadow-sm">
                        <span className="text-white text-[7px] font-bold uppercase leading-none block tracking-wider">
                          Vendido
                        </span>
                      </div>
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
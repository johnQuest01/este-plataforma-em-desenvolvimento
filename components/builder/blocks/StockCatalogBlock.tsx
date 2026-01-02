'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BlockConfig, CatalogItem, CatalogTag } from '@/types/builder';
import { cn } from '@/lib/utils';
import { MapPin, Package } from 'lucide-react';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { PRODUCT_UPDATE_EVENT } from '@/components/builder/blocks/ProductGrid';

interface StockCatalogBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const StockCatalogBlock = ({ config, onAction }: StockCatalogBlockProps) => {
  const items = (config.data.catalogItems as CatalogItem[]) || [];
  const title = (config.data.title as string) || "Nome da peça ou modelo";
  const buttonLabel = (config.data.buttonLabel as string) || "Buscar";

  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const dbProducts = await getProductsAction();
      // Garante que dbProducts seja um array mesmo se a action falhar
      setProducts(Array.isArray(dbProducts) ? dbProducts : []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);
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

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(term);
    
    // Verificação segura de variants (Prisma usa 'variants', não 'variations')
    // Mas o tipo ProductData pode ter mapeado para 'variants'
    const variants = p.variants || [];
    
    // Verifica se alguma variação tem local de estoque que bate com a busca
    // Nota: O schema atual do Prisma não tem 'stockLocations' na variante, 
    // então essa busca pode precisar de ajuste se você não adicionou esse campo.
    // Assumindo que não tem, buscamos apenas pelo nome por enquanto.
    return nameMatch;
  });

  const isUsingDb = products.length > 0;
  const displayList = isUsingDb ? filteredProducts : filteredItemsMock(items, searchTerm);

  function filteredItemsMock(mockItems: CatalogItem[], term: string) {
    return mockItems.filter(item => item.title.toLowerCase().includes(term.toLowerCase()));
  }

  const getTagColor = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-[#fb923c] text-white border-orange-400';
      case 'blue': return 'bg-[#5874f6] text-white border-blue-500';
      default: return 'bg-gray-200 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string | number) => {
    if (typeof status === 'number') {
        if (status === 0) return 'bg-gray-300 text-gray-600';
        if (status < 5) return 'bg-[#ef4444] text-white shadow-red-200';
        return 'bg-[#22c55e] text-white shadow-green-200';
    }
    switch (status) {
      case 'low': return 'bg-[#ef4444] text-white shadow-red-200';
      case 'available': return 'bg-[#22c55e] text-white shadow-green-200';
      case 'regular': return 'bg-[#f59e0b] text-white shadow-orange-200';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div 
      className="w-full px-4 py-6 flex flex-col gap-6"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="flex flex-col gap-3 items-center">
        <label className="text-center font-black text-gray-900 text-base tracking-tight opacity-90">
          {title}
        </label>
        
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm h-12 border-2 border-black rounded-xl px-4 text-center font-bold text-base outline-none focus:border-[#5874f6] transition-colors bg-white shadow-sm placeholder:font-normal"
          placeholder="Digite para buscar..."
        />

        <div className="flex justify-center mt-1">
          <button className="bg-[#5874f6] text-white font-bold text-sm px-10 py-2.5 rounded-xl shadow-md shadow-blue-500/30 active:scale-95 transition-transform uppercase tracking-wider">
            {buttonLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-20">
        {displayList.map((item, idx) => {
            let id, title, image, tags: CatalogTag[], status, statusLabel, stockName, categoryToOpen;

            if (isUsingDb) {
                const p = item as ProductData;
                id = p.id;
                title = p.name;
                
                // CORREÇÃO CRÍTICA: Acesso seguro a variants e imagens
                const variants = p.variants || [];
                const firstVar = variants.length > 0 ? variants[0] : null;
                
                // Tenta pegar imagem do produto, ou da primeira variação, ou undefined
                image = p.imageUrl || (firstVar && firstVar.images && firstVar.images.length > 0 ? firstVar.images[0] : undefined);
                
                // Fallback seguro para categoria
                categoryToOpen = 'Geral'; // Schema não tem categoria no produto, usando padrão
                
                // Fallback seguro para nome do estoque
                stockName = 'Loja Principal'; 

                tags = [
                    { label: categoryToOpen, color: 'orange' },
                    { label: 'Novo', color: 'blue' }
                ] as CatalogTag[];
                
                // Soma segura do estoque
                const totalQty = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                status = totalQty;
                statusLabel = totalQty > 0 ? `${totalQty} un` : 'Esgotado';

            } else {
                const m = item as CatalogItem;
                id = m.id;
                title = m.title;
                image = m.image;
                tags = m.tags;
                status = m.status;
                statusLabel = m.statusLabel;
                stockName = 'Loja Principal';
                categoryToOpen = 'Exemplo';
            }

            return (
                <div 
                    key={id || idx}
                    onClick={() => {
                      if (onAction) {
                        onAction('openCategory', { category: categoryToOpen, stock: stockName });
                      }
                    }}
                    className="bg-white border-[1.5px] border-black rounded-2xl p-3 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer active:scale-[0.98]"
                >
                    <div className="flex items-center gap-1.5 pb-1.5 mb-0.5 border-b border-gray-100">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase truncate tracking-wide">
                            {stockName}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-[48%] aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            {image ? (
                                <img 
                                    src={image} 
                                    alt={title} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 justify-center">
                            <h3 className="text-[13px] font-black text-gray-900 leading-tight mb-2 line-clamp-2">
                                {title}
                            </h3>
                            
                            <div className="flex flex-col gap-1.5">
                                {tags?.map((tag, i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "text-[10px] font-bold text-center py-1 px-1 rounded-md uppercase tracking-wide border shadow-sm truncate",
                                            getTagColor(tag.color)
                                        )}
                                    >
                                        {tag.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-1">
                        <button className={cn(
                            "w-full py-2 rounded-lg text-xs font-black uppercase tracking-wide shadow-md transition-transform",
                            getStatusColor(status)
                        )}>
                            {statusLabel || 'Indisponível'}
                        </button>
                    </div>
                </div>
            );
        })}

        {displayList.length === 0 && !isLoading && (
          <div className="col-span-2 text-center py-10 opacity-50">
            <p className="font-bold text-gray-400">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
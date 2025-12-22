// components/builder/ui/StockModal.tsx
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BlockConfig, ProductVariationData } from '@/types/builder';
import { StockRegisterView } from '@/components/builder/ui/StockRegisterView';
import { StockVariationsPopup, VariationItem } from '@/components/builder/ui/StockVariationsPopup';
import { StockDefinePopup } from '@/components/builder/ui/StockDefinePopup';
import { StockDetailView } from '@/components/builder/ui/StockDetailView'; 
import { cn } from '@/lib/utils';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { ProductData, getProductsAction } from '@/app/actions/product';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockConfig[]; 
  onProductRegister?: (data: { image?: string }) => void;
}

type ModalViewMode = 'list' | 'register' | 'details';

const modalVariants: Variants = {
  hidden: { scale: 0.96, opacity: 0, y: 15 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", damping: 30, stiffness: 400 } },
  exit: { scale: 0.98, opacity: 0, y: 10, transition: { duration: 0.15 } }
};

const mapToDisplayVariations = (items: VariationItem[]): ProductVariationData[] => {
  return items.map(item => ({
    size: item.size,
    color: item.color,
    variation: item.variation || item.type, 
    quantity: item.qty 
  }));
};

export const StockModal = ({ isOpen, onClose, blocks, onProductRegister }: StockModalProps) => {
  const [isDefineOpen, setIsDefineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ModalViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbProducts, setDbProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  // Busca produtos reais ao abrir
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const loadData = async () => {
        try {
          const data = await getProductsAction();
          if (isMounted) setDbProducts(data);
        } catch (error) {
          console.error("Erro ao buscar estoque:", error);
        }
      };
      loadData();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  // Separação de Blocos
  const fixedBlocks = useMemo(() => blocks.filter(b => b.type === 'stock-header' || b.type === 'stock-search'), [blocks]);
  
  // FILTRO: Ignoramos a grid de categorias antiga, pois vamos renderizar a grid de produtos dinâmica
  const contentBlocks = useMemo(() => blocks.filter(b => 
    b.type !== 'stock-header' && 
    b.type !== 'stock-search' && 
    b.type !== 'stock-category-grid' 
  ), [blocks]);

  // Filtro de Busca
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return dbProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, dbProducts]);

  const handleCloseFull = useCallback(() => {
    onClose();
    setTimeout(() => {
      setViewMode('list');
      setSearchQuery(''); 
      setSelectedProduct(null);
    }, 200);
  }, [onClose]);

  const handleAction = useCallback((action: string, payload?: unknown) => {
    if (action === 'openDefinePopup') setIsDefineOpen(true);
    if (action === 'closeModal') handleCloseFull();
    if (action === 'openRegister') setViewMode('register');
    
    if (action === 'live_search' && typeof payload === 'string') {
      setSearchQuery(payload);
    }

    if (action === 'open_product_details') {
      const configId = payload as string; 
      const realId = configId.replace('card_', ''); 
      const product = dbProducts.find(p => p.id === realId);
      
      if (product) {
        setSelectedProduct(product);
        setViewMode('details');
      }
    }
  }, [handleCloseFull, dbProducts]);

  const handleRegisterSuccess = async (data: { image?: string }) => {
    const newData = await getProductsAction();
    setDbProducts(newData);
    if (onProductRegister) onProductRegister(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
            onClick={handleCloseFull}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden" animate="visible" exit="exit"
            className={cn(
              "relative bg-[#eeeeee] w-full max-w-[360px]",
              "h-[85%] max-h-[85%] flex flex-col",
              "rounded-3xl shadow-2xl overflow-hidden border border-gray-200",
              "will-change-transform"
            )}
          >
            <div className="flex-1 relative overflow-hidden bg-[#eeeeee] w-full h-full">
              
              {viewMode === 'list' && (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain py-0 relative">
                    
                    {/* Topo Fixo */}
                    <div className="sticky top-0 z-20 bg-[#eeeeee]">
                        {fixedBlocks.map((block) => (
                        <BlockRenderer key={block.id} config={block} onAction={handleAction} />
                        ))}
                    </div>

                    <div className="pb-24 px-0">
                        {/* 1. Blocos de Conteúdo (Botões de Filtro: Esgotar, Regular...) */}
                        {searchQuery.length === 0 && (
                          <div className="mb-2">
                             {contentBlocks.map((block) => (
                                 <BlockRenderer key={block.id} config={block} onAction={handleAction} />
                             ))}
                          </div>
                        )}

                        {/* --- LÓGICA DE EXIBIÇÃO DUPLA --- */}
                        
                        {searchQuery.length > 0 ? (
                            // MODO BUSCA: Usa o CARD DETALHADO (StockPopupCard)
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 px-0">
                                <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                  Resultados da Busca
                                </div>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(prod => (
                                        <BlockRenderer
                                            key={prod.id}
                                            config={{
                                                id: `card_${prod.id}`,
                                                type: 'stock-popup-card', // <--- CARD DETALHADO (VISUAL APROVADO)
                                                isVisible: true,
                                                style: {},
                                                data: {
                                                    productName: prod.name,
                                                    productImage: prod.mainImage,
                                                    price: prod.price,
                                                    detailedVariations: mapToDisplayVariations(prod.variations)
                                                }
                                            }}
                                            onAction={handleAction}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 font-bold text-sm">
                                        Nenhum produto encontrado.
                                    </div>
                                )}
                            </div>
                        ) : (
                            // MODO PADRÃO: Lista de Produtos Simples (Substitui categorias)
                            <div className="px-4 mt-2 animate-in fade-in duration-300">
                               <div className="mb-2 flex items-center justify-between">
                                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                     Produtos Cadastrados
                                  </span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                     {dbProducts.length} itens
                                  </span>
                               </div>
                               
                               {/* GRADE DE 2 COLUNAS DE CARDS SIMPLES */}
                               <div className="grid grid-cols-2 gap-3">
                                  {dbProducts.map((prod) => {
                                      const totalQty = prod.variations.reduce((acc, v) => acc + v.qty, 0);
                                      return (
                                        <BlockRenderer
                                            key={prod.id}
                                            config={{
                                                id: `card_${prod.id}`,
                                                type: 'stock-simple-card', // <--- NOVO CARD SIMPLES
                                                isVisible: true,
                                                style: {},
                                                data: {
                                                    productName: prod.name,
                                                    qty: totalQty 
                                                }
                                            }}
                                            onAction={handleAction}
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

                  </div>
                </div>
              )}

              {viewMode === 'register' && (
                <StockRegisterView
                  onBack={() => setViewMode('list')}
                  onRegister={handleRegisterSuccess} 
                />
              )}

              {viewMode === 'details' && selectedProduct && (
                <StockDetailView 
                  product={{
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    image: selectedProduct.mainImage,
                    price: selectedProduct.price,
                    variations: mapToDisplayVariations(selectedProduct.variations)
                  }}
                  onBack={() => setViewMode('list')}
                />
              )}

            </div>

            <AnimatePresence>
              {isDefineOpen && (
                <StockDefinePopup isOpen={isDefineOpen} onClose={() => setIsDefineOpen(false)} />
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
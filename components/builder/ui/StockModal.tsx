'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StockRegisterView } from '@/components/builder/ui/StockRegisterView';
import { StockDefinePopup } from '@/components/builder/ui/StockDefinePopup';
import { StockDetailView } from '@/components/builder/ui/StockDetailView'; 
import { ProductData, getProductsAction } from '@/app/actions/product';
import { withGuardian } from "@/components/guardian/GuardianBeacon";



// Imported Sub-components
import { StockModalProps, ModalViewMode, mapToDisplayVariations } from './stock-modal/types';
import { StockModalContainer } from './stock-modal/StockModalContainer';
import { StockModalHeader } from './stock-modal/StockModalHeader';
import { StockProductList } from './stock-modal/StockProductList';

export const StockModal = ({ isOpen, onClose, blocks, onProductRegister }: StockModalProps) => {
  const [isDefineOpen, setIsDefineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ModalViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbProducts, setDbProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  // Data Fetching
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const loadData = async () => {
        try {
          const data = await getProductsAction();
          if (isMounted) setDbProducts(data || []);
        } catch (error) {
          console.error("Erro ao buscar estoque:", error);
          if (isMounted) setDbProducts([]);
        }
      };
      loadData();
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  // Block Separation
  const fixedBlocks = useMemo(() => blocks.filter(b => b.type === 'stock-header' || b.type === 'stock-search'), [blocks]);
  
  const contentBlocks = useMemo(() => blocks.filter(b => 
    b.type !== 'stock-header' && 
    b.type !== 'stock-search' && 
    b.type !== 'stock-category-grid' 
  ), [blocks]);

  // Search Logic
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return dbProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, dbProducts]);

  // Handlers
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
    setDbProducts(newData || []);
    if (onProductRegister) onProductRegister(data);
  };

  return (
    <StockModalContainer isOpen={isOpen} onClose={handleCloseFull}>
      
      {viewMode === 'list' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain py-0 relative">
            
            <StockModalHeader 
              blocks={fixedBlocks} 
              onAction={handleAction} 
            />

            <StockProductList 
              searchQuery={searchQuery}
              contentBlocks={contentBlocks}
              filteredProducts={filteredProducts}
              dbProducts={dbProducts}
              onAction={handleAction}
            />

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
            // FIX: Handle null -> undefined/string conversion
            image: selectedProduct.imageUrl ?? '', 
            price: selectedProduct.price,
            variations: mapToDisplayVariations(selectedProduct.variants)
          }}
          onBack={() => setViewMode('list')}
        />
      )}

      <AnimatePresence>
        {isDefineOpen && (
          <StockDefinePopup isOpen={isDefineOpen} onClose={() => setIsDefineOpen(false)} />
        )}
      </AnimatePresence>

    </StockModalContainer>
  );
};
export const StockModalBase = withGuardian(
  StockModal,                        // O Componente
  "components/ui/StockModal.tsx",        // O Caminho Exato (aparecerá no Card)
  "UI_COMPONENT"                          // O Tipo (Define o ícone e a cor)
);

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';

// 🛡️ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { cn } from '@/lib/utils';
import { BlockConfig, SelectedCategoryData } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { ProductOrderModal } from './ProductOrderModal';
import { ProductData } from '@/app/actions/product';

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryData?: SelectedCategoryData | null;
  category?: string;
}

const CategoryProductsModalBase = ({ isOpen, onClose, categoryData, category }: CategoryProductsModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  const categoryName = categoryData?.category || category || 'Produtos';
  const stockName = categoryData?.stock || '';

  const handleProductClick = (action: string, product: unknown) => {
    if (action === 'openProductOrder' && product && typeof product === 'object' && product !== null) {
      // Type guard: verifica se product tem as propriedades esperadas de ProductData
      const data = product as Record<string, unknown>;
      if (typeof data.id === 'string' && typeof data.name === 'string') {
        setSelectedProduct(product as ProductData);
      }
    }
  };

  // Configuração estática do bloco de lista
  const categoryConfig: BlockConfig = {
    id: 'cat_prod_list',
    type: 'category-product-list',
    isVisible: true,
    style: { bgColor: 'transparent' },
    data: {
      targetCategory: categoryName,
      targetStock: stockName
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 pointer-events-none">
            {/* Backdrop do Modal de Categoria.
               Mantemos um blur leve aqui pois é o nível 1 de sobreposição.
            */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: "10%" }}
              animate={{ scale: 1, opacity: 1, x: "0%" }}
              exit={{ scale: 0.95, opacity: 0, x: "10%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className={cn(
                "pointer-events-auto relative bg-[#eeeeee] w-full",
                "max-w-[360px] h-[85%] max-h-[750px]",
                "flex flex-col",
                "rounded-[2rem] shadow-2xl overflow-hidden border-2 border-gray-900"
              )}
            >
              <div className="bg-[#5874f6] shrink-0 p-4 pt-5 relative z-50 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-1 rounded-full transition-colors active:scale-90 flex items-center shrink-0"
                  >
                    <ChevronLeft size={24} strokeWidth={3} />
                  </button>
                  <div className="flex flex-col leading-tight overflow-hidden">
                    {stockName && (
                      <h2 className="text-xs font-bold text-white/80 uppercase tracking-wider truncate">
                        {stockName}
                      </h2>
                    )}
                    <span className={cn(
                      "font-black uppercase tracking-wider truncate",
                      stockName ? "text-lg text-white" : "text-xl text-white"
                    )}>
                      {categoryName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#5874f6] transition-colors active:scale-90 backdrop-blur-sm shrink-0"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#eeeeee] relative">
                <div className="relative z-10 pt-2 px-0 pb-4 h-full">
                  <BlockRenderer
                    config={categoryConfig}
                    onAction={handleProductClick}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* O Modal de Pedido (Maryland Autorizada) vive aqui fora.
         Isso permite que ele sobreponha o modal de categoria sem conflitos de Z-Index ou AnimatePresence aninhado complexo.
      */}
      <ProductOrderModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </>
  );
};

// 🛡️ GUARDIAN: Exportação com metadados
export const CategoryProductsModal = withGuardian(
  CategoryProductsModalBase,
  "components/builder/ui/CategoryProductsModal.tsx",
  "POPUP",
  {
    label: "Modal de Produtos por Categoria",
    description: "Modal secundário que exibe produtos filtrados de uma categoria específica.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Z-Index**: z-220 (sobrepõe CatalogModal z-200)
- **Dependências**: BlockRenderer, ProductOrderModal
- **UX**: Animação de entrada lateral (slide-in)
- **Fluxo**: Invocado pelo CatalogModal, abre ProductOrderModal ao clicar em produto
    `.trim(),
    connectsTo: [
      {
        target: "components/builder/ui/ProductOrderModal.tsx",
        type: "COMPONENT",
        description: "Modal filho para fazer pedido do produto"
      },
      {
        target: "components/builder/ui/CatalogModal.tsx",
        type: "COMPONENT",
        description: "Modal pai que invoca este componente"
      },
      {
        target: "components/builder/BlockRender.tsx",
        type: "COMPONENT",
        description: "Renderiza lista de produtos da categoria"
      }
    ]
  }
);
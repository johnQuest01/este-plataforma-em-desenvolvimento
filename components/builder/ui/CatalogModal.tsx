'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
// Importa SelectedCategoryData daqui agora
import { BlockConfig, SelectedCategoryData } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { CategoryProductsModal } from './CategoryProductsModal';

const DYNAMIC_CATALOG_CONFIG: BlockConfig[] = [
  {
    id: 'cat_block_main',
    type: 'stock-catalog', 
    isVisible: true,
    style: { bgColor: 'transparent' },
    data: {
      title: 'Todos os Produtos',
      buttonLabel: 'Buscar',
      catalogItems: [] 
    }
  }
];

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface removida daqui pois agora vem do @/types/builder

export const CatalogModal = ({ isOpen, onClose }: CatalogModalProps) => {
  const [selectedData, setSelectedData] = useState<SelectedCategoryData | null>(null);

  const handleBlockAction = (action: string, payload?: unknown) => {
    if (action === 'openCategory' && payload && typeof payload === 'object') {
      setSelectedData(payload as SelectedCategoryData);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className={cn(
                "relative bg-[#eeeeee] w-full",
                "max-w-[390px] h-[90%] max-h-[850px]", 
                "flex flex-col",
                "rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200"
              )}
            >
              <div className="bg-[#5874f6] shrink-0 p-5 relative z-50 flex items-center justify-between shadow-md">
                <div className="flex flex-col text-white">
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
                    Catálogo
                  </span>
                  <h2 className="text-xl font-black tracking-tight leading-none">
                    Fazer Pedido
                  </h2>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#5874f6] transition-colors active:scale-90 backdrop-blur-sm">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#eeeeee] pb-32 relative">
                 <div className="relative z-10">
                    {DYNAMIC_CATALOG_CONFIG.map(block => (
                      <BlockRenderer 
                        key={block.id} 
                        config={block} 
                        onAction={handleBlockAction} 
                      />
                    ))}
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 p-4 pb-safe-bottom">
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col pl-2">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Estimado</span>
                         <span className="text-xl font-black text-gray-900 leading-none">R$ 0,00</span>
                      </div>
                      <button onClick={onClose} className="h-12 px-6 bg-[#5874f6] text-white rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex items-center gap-2 hover:bg-blue-600">
                         <span className="font-bold text-sm uppercase tracking-wide">Ver Sacola</span>
                         <div className="bg-white/20 p-1 rounded-md"><ShoppingBag size={16} strokeWidth={2.5} /></div>
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CategoryProductsModal 
        isOpen={!!selectedData} 
        onClose={() => setSelectedData(null)} 
        categoryData={selectedData} 
      />
    </>
  );
};
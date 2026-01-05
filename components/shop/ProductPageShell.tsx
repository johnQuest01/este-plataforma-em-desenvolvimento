// path: src/components/shop/ProductPageShell.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductDetailContent } from '@/components/shop/ProductDetailContent';
import { FooterBlock } from '@/components/builder/blocks/Footer';
import { BlockConfig } from '@/types/builder';
import { ProductData } from '@/app/actions/product'; // Importe o tipo correto
// ✅ Importação do Guardian

interface ProductPageShellProps {
  product: ProductData | null;
  footerBlock?: BlockConfig;
}

// 1. Componente Base (Visual)
function ProductPageShellBase({ product, footerBlock }: ProductPageShellProps) {
  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      <div className={cn(
        "w-full h-full bg-white flex flex-col relative overflow-hidden",
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto"
      )}>
        
        {product ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative bg-white h-full pb-24 break-words">
             <ProductDetailContent product={product} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
               <span className="text-3xl">🤔</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">Produto não encontrado</h2>
            <p className="text-gray-500 mb-8 text-sm">O produto que você tentou acessar não existe ou foi removido do catálogo.</p>
            
            <Link 
              href="/"
              className="px-6 py-4 bg-[#5874f6] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 transition-transform"
            >
              <ChevronLeft size={20} strokeWidth={3} />
              Voltar para Loja
            </Link>
          </div>
        )}

        {footerBlock && footerBlock.isVisible && (
          <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom bg-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <FooterBlock config={footerBlock} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// ✅ 2. Exportação com Rastreamento

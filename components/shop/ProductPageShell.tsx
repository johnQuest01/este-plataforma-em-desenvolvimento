// path: src/components/shop/ProductPageShell.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductDetailContent } from '@/components/shop/ProductDetailContent';
import { ProductData } from '@/app/actions/product'; 

// ✅ Importação do Guardian
import { withGuardian } from "@/components/guardian/GuardianBeacon";

interface ProductPageShellProps {
  product: ProductData | null;
}

// 1. Componente Base (Visual)
function ProductPageShellBase({ product }: ProductPageShellProps) {
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

        {/* ✅ Footer removido - Agora é gerenciado globalmente pelo RootLayoutShell.tsx */}

      </div>
    </main>
  );
}

// ✅ 2. Exportação com Rastreamento (Correção do Erro)
export const ProductPageShell = withGuardian(
  ProductPageShellBase,
  "components/shop/ProductPageShell.tsx",
  "UI_COMPONENT",
  {
    label: "Shell da Página de Produto",
    description: "Container principal da PDP (Product Detail Page). Gerencia o layout responsivo e o estado de 'Produto não encontrado'.",
    orientationNotes: "Este componente é o 'Client Boundary' da página de produto. Ele recebe os dados do servidor e hidrata a interface.",
    connectsTo: [
      { 
        target: "components/shop/ProductDetailContent.tsx", 
        type: "COMPONENT", 
        description: "Renderiza os detalhes internos (fotos, preço, botão comprar)" 
      },
      { 
        target: "components/layouts/RootLayoutShell.tsx", 
        type: "COMPONENT", 
        description: "Footer global gerenciado pelo shell principal" 
      }
    ],
    tags: ["PDP", "Shell", "Layout"]
  }
);
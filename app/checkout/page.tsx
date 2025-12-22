// app/checkout/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig, FooterItem } from '@/types/builder';

// --- CONFIGURAÇÃO DA TELA (LEGO) ---
const CHECKOUT_LAYOUT: BlockConfig[] = [
  {
    id: 'checkout_header',
    type: 'order-header', 
    isVisible: true,
    style: { bgColor: 'transparent', padding: '10px 0' },
    data: { title: 'Recebimento de Lotes', address: 'Itens enviados pela Produção' }
  },
  // O bloco que renderiza a lista de itens prontos
  {
    id: 'ready_stock_list',
    type: 'ready-stock-list',
    isVisible: true,
    style: { bgColor: 'transparent' },
    data: {} 
  }
];

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/' },
  { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
];

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <main className="w-full h-dvh-real bg-white flex flex-col overflow-hidden">
      
      <div className={cn(
        "w-full h-full bg-[#f8f9fa] flex flex-col relative overflow-hidden",
        "lg:w-full lg:h-full lg:max-w-none lg:rounded-none lg:border-0 lg:shadow-none",
        "overscroll-none"
      )}>
        
        {/* HEADER */}
        <div className="shrink-0 z-[60] bg-[#5874f6] relative border-b border-blue-600/20 shadow-md">
           <StoreHeader 
             showBack={true} 
             onBack={() => router.push('/')} 
             data={{ title: 'ESTOQUE/CAIXA', address: 'Conferência de Entrada' }} 
             style={{ bgColor: '#5874f6', textColor: '#ffffff' }} 
           />
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 relative overflow-hidden w-full bg-[#f8f9fa]">
           <div className="absolute inset-0 overflow-y-auto scrollbar-hide overscroll-contain pb-24">
              <div className="flex flex-col pt-2 min-h-full w-full max-w-5xl mx-auto px-0 lg:px-4">
                 {CHECKOUT_LAYOUT.map(block => (
                   <BlockRenderer key={block.id} config={block} />
                 ))}
              </div>
           </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom pointer-events-none">
          <div className="pointer-events-auto w-full max-w-5xl mx-auto">
            <ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: '#5874f6' }} />
          </div>
        </div>

      </div>
    </main>
  );
}
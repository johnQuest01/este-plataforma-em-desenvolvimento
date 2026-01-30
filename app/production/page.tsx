'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';


// --- CONFIGURAÇÃO DA TELA (LEGO) ---
// Define a ordem visual dos componentes
const PRODUCTION_LAYOUT: BlockConfig[] = [
  // 1. Título e Info (Topo da lista)
  {
    id: 'prod_info_header',
    type: 'order-header',
    isVisible: true,
    style: { bgColor: 'transparent', padding: '10px 0' },
    data: { title: 'Fila de Processamento' }
  },
  // 2. A Lista de Produção (Esteira Dinâmica)
  {
    id: 'prod_main_list',
    type: 'production-list',
    isVisible: true,
    style: { bgColor: 'transparent' },
    data: {} 
  }
];

export default function ProductionPage() {
  const router = useRouter();

  return (
    <main className="w-full h-dvh-real bg-white flex flex-col overflow-hidden">
      
      {/* APP SHELL MOBILE */}
      <div className={cn(
        "w-full h-full bg-[#f8f9fa] flex flex-col relative overflow-hidden",
        "lg:w-full lg:h-full lg:max-w-none lg:rounded-none lg:border-0 lg:shadow-none",
        "overscroll-none"
      )}>

        {/* HEADER FIXO */}
        <div className="shrink-0 z-[60] bg-[#5874f6] relative border-b border-blue-600/20 shadow-md">
          <StoreHeader 
            showBack={true} 
            onBack={() => router.push('/')}
            data={{ title: 'CONFECÇÃO', address: 'Controle de Lotes e Produção' }}
            style={{ bgColor: '#5874f6', textColor: '#ffffff' }}
          />
        </div>

        {/* ÁREA DE CONTEÚDO (SCROLL) */}
        <div className="flex-1 relative overflow-hidden w-full bg-[#f8f9fa]">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide overscroll-contain pb-24">
            <div className="flex flex-col pt-2 min-h-full w-full max-w-5xl mx-auto px-0 lg:px-4">
              {/* RENDERIZADOR LEGO */}
              {PRODUCTION_LAYOUT.map(block => (
                <BlockRenderer key={block.id} config={block} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
// app/favorites/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { Heart, ShoppingBag } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      
      {/* APP SHELL (O Celular) */}
      <div className={cn(
        "w-full h-full bg-gray-50 flex flex-col relative overflow-hidden", // bg-gray-50 para consistência com a Home
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto"
      )}>

        {/* 1. HEADER (Fixo no topo, Azul e com Menu) */}
        <div className="shrink-0 z-[60] bg-[#5874f6] relative border-b border-blue-600/20">
            {/* Notch Fake (Apenas Desktop) */}
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl pointer-events-none z-50"></div>
            
            <StoreHeader 
                data={{ 
                    title: '', 
                    address: 'Favoritos Maryland' 
                }}
                style={{ 
                    bgColor: '#5874f6', // Fundo Azul
                    textColor: '#ffffff' // Texto Branco
                }}
            />
        </div>

        {/* 2. ÁREA DE ROLAGEM (Conteúdo) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full relative">
            
            {/* LISTA VAZIA (Placeholder) */}
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center shadow-sm z-10 relative">
                        <Heart size={48} className="text-[#5874f6] fill-[#5874f6]/10" strokeWidth={1.5} />
                    </div>
                    {/* Elemento decorativo atrás */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center animate-bounce delay-700">
                        <ShoppingBag size={14} className="text-pink-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                    Sua lista está vazia
                </h2>
                <p className="text-sm text-gray-400 max-w-[220px] leading-relaxed mb-8">
                    Você ainda não curtiu nenhum produto. Explore a loja e marque o que gostar!
                </p>
                
                <button 
                    onClick={() => router.push('/')}
                    className="px-8 py-3.5 bg-[#5874f6] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform border border-white/20"
                >
                    Explorar Loja
                </button>
            </div>

            {/* Espaço extra no final para o footer não cobrir conteúdo se a lista encher */}
            <div className="h-32" />
        </div>

      </div>
    </main>
  );
}

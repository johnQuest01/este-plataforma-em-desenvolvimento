'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';
import { ShoppingCart } from 'lucide-react';
import { FooterItem } from '@/types/builder';

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/' },
  { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
];

export default function CartPage() {
  const router = useRouter();
  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      <div className={cn("w-full h-full bg-gray-50 flex flex-col relative overflow-hidden", "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px] lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl max-w-[100vw] lg:mx-auto")}>
        <div className="shrink-0 z-[60] bg-[#5874f6] relative border-b border-blue-600/20">
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl pointer-events-none z-50"></div>
            <StoreHeader showBack={true} onBack={() => router.push('/')} data={{ title: 'Carrinho', address: 'Seus produtos' }} style={{ bgColor: '#5874f6', textColor: '#ffffff' }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm"><ShoppingCart size={48} className="text-[#5874f6]" /></div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-sm text-gray-400 max-w-[200px] mb-8">Adicione produtos para finalizar sua compra.</p>
            <button onClick={() => router.push('/')} className="px-8 py-3 bg-[#5874f6] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">Ir às Compras</button>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom pointer-events-none"><div className="pointer-events-auto"><ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: '#5874f6' }} /></div></div>
      </div>
    </main>
  );
}
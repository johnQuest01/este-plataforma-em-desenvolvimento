'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';
import { LocalDB } from '@/lib/local-db';

import { BlockConfig, CategoryItem } from '@/types/builder';
import { INITIAL_BLOCKS as CLOTHING } from '@/data/initial-state';
import { BARBER_TEMPLATE as BARBER } from '@/data/templates/barber';
import { FUTURISTIC_TEMPLATE as TECH } from '@/data/templates/futuristic';
import { CHRISTMAS_TEMPLATE as XMAS } from '@/data/templates/christmas';
import { FooterBlock } from '@/components/builder/blocks/Footer';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { ReelsModal } from '@/components/builder/ui/ReelsModal';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';
import { FooterItem } from '@/types/builder';
// REMOVIDO: import { HealthMonitorBlock } ... (Já está no RootLayoutShell)

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
  { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
];

export default function DashboardPage() {
  const router = useRouter();

  // Estado inicial carrega apenas os blocos de conteúdo
  const [blocks, setBlocks] = useState<BlockConfig[]>(CLOTHING);
  const [currentTheme, setCurrentTheme] = useState('clothing');
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeReelsItem, setActiveReelsItem] = useState<CategoryItem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = LocalDB.getUser();
      if (!user) {
        router.replace('/');
      } else {
        setIsReady(true);
      }
    };
    checkAuth();
  }, [router]);

  /**
   * Troca de Temas
   */
  const switchTheme = (theme: string) => {
    setCurrentTheme(theme);
    let newBlocks: BlockConfig[] = [];

    if (theme === 'clothing') newBlocks = CLOTHING;
    if (theme === 'barber') newBlocks = BARBER;
    if (theme === 'tech') newBlocks = TECH;
    if (theme === 'xmas') newBlocks = XMAS;

    setBlocks(newBlocks);
    setShowAdmin(false);
  };

  const getAppBg = () => {
    if (currentTheme === 'tech') return 'bg-[#050505]';
    if (currentTheme === 'barber') return 'bg-[#F5F5DC]';
    if (currentTheme === 'xmas') return 'bg-[#F0FDF4]';
    return 'bg-gray-50';
  };

  // Memoização da filtragem para performance (React 19)
  const layout = useMemo(() => {
    return {
      header: blocks.find(b => b.type === 'header'),
      footer: blocks.find(b => b.type === 'footer'),
      content: blocks.filter(b => b.type !== 'footer' && b.type !== 'header')
    };
  }, [blocks]);

  const handleBlockAction = (action: string, payload?: unknown) => {
    if (action === 'openReels' && payload) {
      setActiveReelsItem(payload as CategoryItem);
    }
  };

  const handleOpenGlobalAdmin = () => {
    window.dispatchEvent(new Event('toggle_admin_menu'));
    setShowAdmin(false);
  };

  if (!isReady) return null;

  return (
    <main className="w-full h-dvh-real bg-gray-900 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden relative">
     
      {/* Botão Flutuante de Admin (Canto Superior Direito) */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-col items-end gap-2">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="bg-white text-black p-3 rounded-full shadow-xl hover:scale-110 transition-transform border-2 border-purple-500"
        >
          <Wand2 size={24} className="text-purple-600" />
        </button>
       
        {showAdmin && (
          <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[140px] animate-in fade-in slide-in-from-top-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Opções</span>
            <button
              onClick={handleOpenGlobalAdmin}
              className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-purple-600 border border-purple-100 bg-purple-50 mb-1"
            >
              ⚙️ Painel Admin
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Temas</span>
            <button onClick={() => switchTheme('clothing')} className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-blue-600">👕 Loja Roupas</button>
            <button onClick={() => switchTheme('barber')} className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-yellow-700">💈 Barbearia</button>
            <button onClick={() => switchTheme('tech')} className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-cyan-600">🤖 Cyberpunk</button>
            <button onClick={() => switchTheme('xmas')} className="text-left px-3 py-2 hover:bg-red-50 rounded-lg text-xs font-bold text-red-600">🎅 Natal</button>
          </div>
        )}
      </div>

      {/* Frame do Dispositivo (Mobile Viewport) */}
      <div className={cn(
        "w-full h-full flex flex-col relative overflow-hidden transition-colors duration-500",
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-800 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto",
        getAppBg()
      )}>
       
        {/* 
            REMOVIDO: <HealthMonitorBlock /> 
            Motivo: Agora ele é injetado globalmente no RootLayoutShell.tsx
        */}

        {currentTheme === 'tech' && (
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        )}

        {/* Header Fixo */}
        <div className={cn(
          "shrink-0 z-[60] relative transition-colors duration-300",
          currentTheme === 'tech' ? 'bg-[#050505]' : currentTheme === 'barber' ? 'bg-[#F5F5DC]' : currentTheme === 'xmas' ? 'bg-[#D42426]' : 'bg-white'
        )}>
          <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl pointer-events-none z-50" />
          {layout.header && (
            <StoreHeader
              style={layout.header.style}
              data={{
                address: layout.header.data.address as string,
                title: 'Maryland SaaS'
              }}
            />
          )}
        </div>

        {/* Área de Scroll com Blocos Dinâmicos */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-transparent relative w-full pb-32 z-10">
          <div className="flex flex-col min-h-full p-4 gap-4">
            <AnimatePresence mode='wait'>
              <div key={currentTheme} className="animate-in fade-in zoom-in-95 duration-500 flex flex-col gap-4">
                {layout.content.map((block) => (
                  <BlockRenderer key={block.id} config={block} onAction={handleBlockAction} />
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: '#5874f6' }} />
          </div>
        </div>

        <ReelsModal isOpen={!!activeReelsItem} item={activeReelsItem} onClose={() => setActiveReelsItem(null)} />
      </div>
    </main>
  );
}
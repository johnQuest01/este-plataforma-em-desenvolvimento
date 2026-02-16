'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Wand2, GripVertical } from 'lucide-react';
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
import { getHomeLayoutAction } from '@/app/actions/ui-config'; // 🧱 CMS DINÂMICO
// REMOVIDO: Imports de modal - Agora navega para página /product/[id]
// REMOVIDO: import { HealthMonitorBlock ... (Já está no RootLayoutShell)

export default function DashboardPage() {
  const router = useRouter();

  // 🧱 CMS DINÂMICO: Estado inicial será carregado do banco
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('clothing');
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeReelsItem, setActiveReelsItem] = useState<CategoryItem | null>(null);
  const [isReady, setIsReady] = useState(false);
  // REMOVIDO: Estados de modal de produto - Agora usa navegação

  // 🧱 CMS DINÂMICO: Carrega layout do banco de dados
  useEffect(() => {
    const loadDynamicLayout = async () => {
      try {
        setIsLoadingLayout(true);
        const layout = await getHomeLayoutAction();
        setBlocks(layout);
        console.log('🏠 [Dashboard] Layout carregado:', layout.length, 'blocos');
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao carregar layout:', error);
        // Fallback para template inicial
        setBlocks(CLOTHING);
      } finally {
        setIsLoadingLayout(false);
      }
    };

    loadDynamicLayout();
  }, []); // Executa apenas uma vez no mount

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
  const switchTheme = async (theme: string) => {
    setCurrentTheme(theme);
    let newBlocks: BlockConfig[] = [];

    if (theme === 'clothing') {
      // 🧱 CMS DINÂMICO: Recarrega layout do banco quando volta para clothing
      try {
        newBlocks = await getHomeLayoutAction();
        console.log('🔄 [Dashboard] Layout dinâmico recarregado');
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao recarregar:', error);
        newBlocks = CLOTHING;
      }
    } else {
      // Templates estáticos
      if (theme === 'barber') newBlocks = BARBER;
      if (theme === 'tech') newBlocks = TECH;
      if (theme === 'xmas') newBlocks = XMAS;
    }

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

  // 🎯 DND: Estado local para reordenação
  const [reorderableContent, setReorderableContent] = useState<BlockConfig[]>([]);

  // Sincroniza conteúdo reordenável quando layout.content muda
  useEffect(() => {
    setReorderableContent(layout.content);
  }, [layout.content]);

  // 🎯 DND: Handler de reordenação
  const handleReorder = (newOrder: BlockConfig[]) => {
    setReorderableContent(newOrder);
    console.log('🎯 [DND] Blocos reordenados:', newOrder.map(b => b.type));
  };

  const handleBlockAction = (action: string, payload?: unknown) => {
    if (action === 'openReels' && payload) {
      setActiveReelsItem(payload as CategoryItem);
    }
    
    // 🧱 NOVO: Handler para navegar para página de produto
    if (action === 'open_product_details' && payload) {
      const productId = payload as string;
      handleOpenProductDetails(productId);
    }
  };

  // 🧱 NOVO: Função para navegar para página de produto
  const handleOpenProductDetails = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleOpenGlobalAdmin = () => {
    window.dispatchEvent(new Event('toggle_admin_menu'));
    setShowAdmin(false);
  };

  if (!isReady || isLoadingLayout) {
    return (
      <main className="w-full h-dvh-real bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm">Carregando...</p>
        </div>
      </main>
    );
  }

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
            <button
              onClick={() => router.push('/admin/database')}
              className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-red-600 border border-red-100 bg-red-50"
            >
              🗑️ Gerenciar Dados
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

        {/* 🎯 DND: Área de Scroll com Blocos REORDENÁVEIS */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-transparent relative w-full pb-32 z-10">
          <div className="flex flex-col min-h-full p-4">
            <AnimatePresence mode='wait'>
              <Reorder.Group
                key={currentTheme}
                axis="y"
                values={reorderableContent}
                onReorder={handleReorder}
                className="flex flex-col gap-4"
              >
                {reorderableContent.map((block) => (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className="relative group touch-none"
                    dragListener={false}
                    dragControls={undefined}
                  >
                    {/* 🎯 Handle de Arraste (Visível no hover) */}
                    <div
                      className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        // O Reorder.Item vai capturar o drag automaticamente
                      }}
                    >
                      <GripVertical size={20} />
                    </div>

                    {/* Bloco Original */}
                    <BlockRenderer 
                      config={block} 
                      onAction={handleBlockAction}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </AnimatePresence>
          </div>
        </div>

        <ReelsModal isOpen={!!activeReelsItem} item={activeReelsItem} onClose={() => setActiveReelsItem(null)} />
        
        {/* REMOVIDO: Modal de produto - Agora usa navegação para /product/[id] */}
      </div>
    </main>
  );
}

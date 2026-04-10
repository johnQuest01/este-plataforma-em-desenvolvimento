'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, Reorder, motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Wand2, GripVertical, Lock, Unlock, X, Eye, EyeOff } from 'lucide-react';
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
import { getHomeLayoutAction } from '@/app/actions/ui-config';
import { verifyAdminPasswordAction, getAdminAccessStatusAction, updateAdminButtonPositionAction } from '@/app/actions/admin-access';
import { updateLayoutOrderAction } from '@/app/actions/layout-order';

// 🛡️ TYPE GUARD 1: Validação de CategoryItem
const isCategoryItem = (payload: unknown): payload is CategoryItem => {
  return typeof payload === 'object' && payload !== null && !Array.isArray(payload);
};

// 🛡️ TYPE GUARD 2: Validação estrita de Objetos
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export default function DashboardPage() {
  const router = useRouter();

  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const[currentTheme, setCurrentTheme] = useState('clothing');
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeReelsItem, setActiveReelsItem] = useState<CategoryItem | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentUserFirstName, setCurrentUserFirstName] = useState<string>('Maryland');
  
  const[isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [buttonPosition, setButtonPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);

  const[viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadDynamicLayout = async () => {
      try {
        setIsLoadingLayout(true);
        const layout = await getHomeLayoutAction();
        
        // 🛡️ ARQUITETURA DE AUTO-CURA (Self-Healing)
        const dbBlockIds = new Set(layout.map(b => b.id));
        const missingBlocks = CLOTHING.filter(b => !dbBlockIds.has(b.id));
        
        let finalLayout = layout;
        if (missingBlocks.length > 0) {
          console.log('🔧 [Dashboard] Auto-Cura: Injetando blocos novos não encontrados no DB:', missingBlocks.map(b => b.id));
          finalLayout = CLOTHING.map(initialBlock => {
            const existingDbBlock = layout.find(b => b.id === initialBlock.id);
            return existingDbBlock || initialBlock;
          });
        }

        setBlocks(finalLayout);
        console.log('🏠 [Dashboard] Layout carregado:', finalLayout.length, 'blocos');
      } catch (error) {
        console.error('❌[Dashboard] Erro ao carregar layout:', error);
        setBlocks(CLOTHING);
      } finally {
        setIsLoadingLayout(false);
      }
    };

    loadDynamicLayout();
  },[]);

  useEffect(() => {
    const checkAuth = () => {
      const user = LocalDB.getUser();
      if (!user) {
        router.replace('/login');
      } else {
        const firstName = user.name?.trim().split(/\s+/)[0] ?? 'Maryland';
        setCurrentUserFirstName(firstName.length > 0 ? firstName : 'Maryland');
        setIsReady(true);
      }
    };
    checkAuth();
    
    const loadButtonPosition = async () => {
      const status = await getAdminAccessStatusAction();
      if (status.success && status.buttonPosition) {
        setButtonPosition(status.buttonPosition);
      }
    };
    loadButtonPosition();
  }, [router]);

  useEffect(() => {
    if (!isPasswordModalOpen) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(handleResize, 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    handleResize();

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.visualViewport?.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPasswordModalOpen]);

  const switchTheme = async (theme: string) => {
    setCurrentTheme(theme);
    let newBlocks: BlockConfig[] =[];

    if (theme === 'clothing') {
      try {
        const layout = await getHomeLayoutAction();
        
        const dbBlockIds = new Set(layout.map(b => b.id));
        const missingBlocks = CLOTHING.filter(b => !dbBlockIds.has(b.id));
        
        if (missingBlocks.length > 0) {
          newBlocks = CLOTHING.map(initialBlock => {
            const existingDbBlock = layout.find(b => b.id === initialBlock.id);
            return existingDbBlock || initialBlock;
          });
        } else {
          newBlocks = layout;
        }
        console.log('🔄 [Dashboard] Layout dinâmico recarregado com Auto-Cura');
      } catch (error) {
        console.error('❌[Dashboard] Erro ao recarregar:', error);
        newBlocks = CLOTHING;
      }
    } else {
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

  // 🧠 CÉREBRO DA LOJA: INJEÇÃO FORÇADA NO LAYOUT.CONTENT
  const layout = useMemo(() => {
    const header = blocks.find(b => b.type === 'header');
    const footer = blocks.find(b => b.type === 'footer');
    const content = blocks.filter(b => b.type !== 'footer' && b.type !== 'header');

    // 🛡️ INJEÇÃO FORÇADA: Garantir que a modelo caminhando exista
    const hasWalkingModel = content.some(b => b.type === 'walking-model');
    
    if (!hasWalkingModel) {
      const walkingModelBlock: BlockConfig = {
        id: 'blk_walking_models_main_forced',
        type: 'walking-model',
        isVisible: true,
        data: {
          walkingModelImages:[
            '/models/modelo.1.png',
            '/models/modelo.2.png',
            '/models/modelo.3.png',
            '/models/modelo.4.png',
            '/models/modelo.5.png',
            '/models/modelo.6.png'
          ],
          animationDurationSeconds: 12
        },
        style: { bgColor: 'transparent' }
      };

      // Encontra o índice do bloco de categorias (Reels)
      const categoriesIndex = content.findIndex(b => b.type === 'categories');
      
      if (categoriesIndex !== -1) {
        // Insere cirurgicamente logo após as categorias
        content.splice(categoriesIndex + 1, 0, walkingModelBlock);
        console.log('💉[Injeção Forçada] Modelo inserida após as categorias.');
      } else {
        // Se não houver categorias, insere no topo do conteúdo
        content.unshift(walkingModelBlock);
        console.log('💉[Injeção Forçada] Modelo inserida no topo do conteúdo.');
      }
    }

    return { header, footer, content };
  }, [blocks]);

  const [reorderableContent, setReorderableContent] = useState<BlockConfig[]>([]);
  const [isBannerLocked, setIsBannerLocked] = useState<boolean>(true);

  useEffect(() => {
    setReorderableContent(layout.content);
  },[layout.content]);

  const handleBlockDragEnd = async () => {
    const currentOrder = reorderableContent.map(block => block.id);
    console.log('🖱️[DND] Drag finalizado. Salvando ordem no banco:', currentOrder);
    
    const result = await updateLayoutOrderAction('home', currentOrder);
    if (!result.success) {
      console.error('❌ Erro ao salvar a nova ordem:', result.error);
    }
  };

  const toggleBannerLock = async () => {
    const newLockedState = !isBannerLocked;
    setIsBannerLocked(newLockedState);
    
    if (newLockedState) {
      const currentOrder = reorderableContent.map(block => block.id);
      console.log('🔒[DND] Bloqueando e garantindo salvamento no banco:', currentOrder);
      await updateLayoutOrderAction('home', currentOrder);
    }
  };

  const handleBlockAction = (action: string, payload?: unknown) => {
    if (action === 'openReels' && isCategoryItem(payload)) {
      setActiveReelsItem(payload);
    }
    
    if (action === 'open_product_details' && typeof payload === 'string') {
      handleOpenProductDetails(payload);
    }
  };

  const handleOpenProductDetails = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleOpenGlobalAdmin = () => {
    window.dispatchEvent(new Event('toggle_admin_menu'));
    setShowAdmin(false);
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setIsVerifying(true);

    const result = await verifyAdminPasswordAction(password);

    if (result.success) {
      setIsPasswordModalOpen(false);
      setPassword('');
      setShowAdmin(true);
    } else {
      setPasswordError('Senha errada');
      setPassword('');
      setTimeout(() => setPasswordError(''), 4000);
    }

    setIsVerifying(false);
  };

  const handleWandClick = () => {
    if (!isDragging) {
      setIsPasswordModalOpen(true);
    }
  };

  const handleButtonDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, info.point.x - 24)),
      y: Math.max(0, Math.min(window.innerHeight - 60, info.point.y - 24))
    };
    setButtonPosition(newPosition);
    await updateAdminButtonPositionAction(newPosition);
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
     
      {isPasswordModalOpen && (
        <div 
          className="fixed top-0 left-0 w-full z-[10000] flex items-center justify-center p-4 overscroll-none transition-all duration-100 ease-out"
          style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPasswordModalOpen(false)}
            style={{ touchAction: 'none' }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-full"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Lock size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Acesso Admin</h2>
                    <p className="text-sm text-purple-100">Digite a senha para continuar</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyPassword} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Senha de Acesso
                </label>
                <motion.div 
                  className="relative"
                  animate={passwordError ? {
                    x:[0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.5 }
                  } : {}}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    autoFocus
                    className={cn(
                      "w-full h-12 px-4 pr-12 bg-gray-50 border-2 rounded-xl",
                      "text-base font-bold outline-none transition-all",
                      passwordError
                        ? "border-red-500 focus:border-red-600 bg-red-50"
                        : "border-gray-200 focus:border-purple-500 focus:bg-white"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-500" />
                    )}
                  </button>
                </motion.div>
                
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        x: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }
                    }}
                    className="bg-red-50 border-2 border-red-500 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">❌</span>
                    <div className="flex-1">
                      <p className="text-sm font-black text-red-700 uppercase tracking-wide">
                        Senha Errada
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Tente novamente
                      </p>
                    </div>
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 h-12 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !password}
                  className={cn(
                    "flex-1 h-12 bg-purple-500 text-white font-bold rounded-xl",
                    "hover:bg-purple-600 transition-all shadow-lg",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isVerifying && "animate-pulse"
                  )}
                >
                  {isVerifying ? 'Verificando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
     
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleButtonDragEnd}
        initial={{ scale: 1, opacity: 1, x: buttonPosition.x, y: buttonPosition.y }}
        animate={{ x: buttonPosition.x, y: buttonPosition.y }}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        className="fixed z-[9999] touch-none"
        style={{
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        <button
          onClick={handleWandClick}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "p-3 rounded-full shadow-xl border-2 border-purple-500",
            "bg-white text-black",
            "hover:scale-110 transition-all cursor-pointer",
            "relative group"
          )}
        >
          <Wand2 size={24} className="text-purple-600" />
          
          {!isDragging && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </motion.div>
     
      {showAdmin && (
        <div 
          className="fixed z-[9998] bg-white p-2 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[140px] animate-in fade-in slide-in-from-top-2"
          style={{
            top: Math.min(buttonPosition.y + 60, window.innerHeight - 300),
            right: Math.max(16, window.innerWidth - buttonPosition.x - 156)
          }}
        >
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Opções</span>
            <button
              onClick={handleOpenGlobalAdmin}
              className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-purple-600 border border-purple-100 bg-purple-50 mb-1"
            >
              ⚙️ Painel Admin
            </button>
            <button
              onClick={() => router.push('/admin/manage')}
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

      <div className={cn(
        "w-full h-full flex flex-col relative overflow-hidden transition-colors duration-500",
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-800 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto",
        getAppBg()
      )}>
       
        {currentTheme === 'tech' && (
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        )}

        <div className={cn(
          "shrink-0 z-[60] relative transition-colors duration-300",
          currentTheme === 'tech' ? 'bg-[#050505]' : currentTheme === 'barber' ? 'bg-[#F5F5DC]' : currentTheme === 'xmas' ? 'bg-[#D42426]' : 'bg-white'
        )}>
          <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl pointer-events-none z-50" />
          {layout.header && (
            <StoreHeader
              style={layout.header.style}
              data={{
                address: isRecord(layout.header.data) && typeof layout.header.data.address === 'string' 
                  ? layout.header.data.address
                  : '',
                title: `${currentUserFirstName} SaaS`
              }}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide ios-scroll-enabled bg-transparent relative w-full pb-32 z-10">
          <div className="flex flex-col min-h-full py-4">
            <Reorder.Group
              axis="y"
              values={reorderableContent}
              onReorder={setReorderableContent}
              className="flex flex-col gap-1"
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {reorderableContent.map((block) => {
                const isBanner = block.type === 'banner';
                const isLocked = isBanner ? isBannerLocked : false;
                const canDrag = isBanner && !isLocked;
                
                return (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className={cn("relative group", canDrag && "ios-drag-enabled")}
                    dragListener={canDrag}
                    dragControls={undefined}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={canDrag ? handleBlockDragEnd : undefined}
                    whileDrag={{
                      scale: 1,
                      boxShadow: 'none',
                      zIndex: canDrag ? 100 : 'auto',
                      opacity: canDrag ? 0.9 : 1,
                      cursor: 'grabbing'
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 600,
                      damping: 40,
                      mass: 0.3
                    }}
                    layout
                    layoutId={block.id}
                    style={{ 
                      touchAction: canDrag ? 'none' : 'auto',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {isBanner && (
                      <button
                        onClick={toggleBannerLock}
                        className={cn(
                          "absolute -right-2 -top-2 z-50 p-2 rounded-lg shadow-lg transition-all",
                          "hover:scale-110 active:scale-95",
                          isLocked 
                            ? "bg-red-500 text-white hover:bg-red-600" 
                            : "bg-green-500 text-white hover:bg-green-600"
                        )}
                        title={isLocked ? "Clique para desbloquear e arrastar o Banner" : "Clique para travar o Banner"}
                      >
                        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    )}

                    {isBanner && !isLocked && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-50">
                        <div 
                          className="bg-blue-500 text-white p-3 rounded-lg shadow-lg cursor-grab active:cursor-grabbing touch-none"
                          style={{
                            touchAction: 'none',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none'
                          }}
                        >
                          <GripVertical size={24} strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {isBanner && isLocked && (
                      <div className="absolute inset-0 bg-gray-900/5 border-2 border-red-500/20 rounded-lg pointer-events-none" />
                    )}
                    
                    {isBanner && !isLocked && (
                      <div className="absolute inset-0 bg-green-500/5 border-2 border-green-500/30 rounded-lg pointer-events-none animate-pulse" />
                    )}

                    <BlockRenderer key={block.id} config={block} onAction={handleBlockAction} />
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        </div>

        <ReelsModal isOpen={!!activeReelsItem} item={activeReelsItem} onClose={() => setActiveReelsItem(null)} />
        
      </div>
    </main>
  );
}
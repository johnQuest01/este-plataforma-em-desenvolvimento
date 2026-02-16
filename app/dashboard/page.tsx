'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
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
import { getHomeLayoutAction } from '@/app/actions/ui-config'; // 🧱 CMS DINÂMICO
import { verifyAdminPasswordAction, getAdminAccessStatusAction, updateAdminButtonPositionAction } from '@/app/actions/admin-access';
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
  
  // 🔒 Estados do modal de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 🎯 Estados de drag do botão
  const [buttonPosition, setButtonPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
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
    
    // 🎯 Carrega posição salva do botão
    const loadButtonPosition = async () => {
      const status = await getAdminAccessStatusAction();
      if (status.success && status.buttonPosition) {
        setButtonPosition(status.buttonPosition);
      }
    };
    loadButtonPosition();
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

  // 🎯 DND: Estado local para reordenação usando Framer Motion
  const [reorderableContent, setReorderableContent] = useState<BlockConfig[]>([]);
  
  // 🔒 DND: Estado de lock APENAS para o Banner
  const [isBannerLocked, setIsBannerLocked] = useState<boolean>(true);

  // Sincroniza conteúdo reordenável quando layout.content muda
  useEffect(() => {
    setReorderableContent(layout.content);
  }, [layout.content]);

  // 🔒 Toggle lock/unlock APENAS do Banner
  const toggleBannerLock = () => {
    setIsBannerLocked(prev => !prev);
    console.log('🔒 [DND] Toggle Banner lock:', !isBannerLocked);
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

  // 🔒 Função para verificar senha
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
      // ❌ Senha errada - mostra erro
      setPasswordError('Senha errada');
      setPassword(''); // Limpa o campo
      setTimeout(() => setPasswordError(''), 4000);
    }

    setIsVerifying(false);
  };

  // 🔒 Handler do botão do lápis
  const handleWandClick = () => {
    if (!isDragging) {
      setIsPasswordModalOpen(true);
    }
  };

  // 🎯 Handler de drag do botão
  const handleDragEnd = async (event: any, info: any) => {
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
     
      {/* 🔒 Modal de Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPasswordModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
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

            {/* Body */}
            <form onSubmit={handleVerifyPassword} className="p-6 space-y-4">
              {/* Input de Senha */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Senha de Acesso
                </label>
                <motion.div 
                  className="relative"
                  animate={passwordError ? {
                    x: [0, -10, 10, -10, 10, 0],
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
                
                {/* Mensagem de Erro */}
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

              {/* Botões */}
              <div className="flex gap-3">
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
     
      {/* 🎯 Botão Flutuante de Admin ARRASTÁVEL */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
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
          
          {/* Indicador de arrasto */}
          {!isDragging && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </motion.div>
     
      {/* Menu Dropdown (quando senha está correta) */}
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

        {/* 🎯 DND: Área de Scroll com Blocos DRAGGABLE (Framer Motion Reorder) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide ios-scroll-enabled bg-transparent relative w-full pb-32 z-10">
          <div className="flex flex-col min-h-full p-4">
            <Reorder.Group
              axis="y"
              values={reorderableContent}
              onReorder={setReorderableContent}
              className="flex flex-col gap-4"
              style={{
                touchAction: 'pan-y', // 🍎 Permite scroll vertical mas habilita drag horizontal
                WebkitOverflowScrolling: 'touch' // 🍎 Scroll suave no iOS
              }}
            >
              {reorderableContent.map((block) => {
                // 🎯 Verifica se é o Banner
                const isBanner = block.type === 'banner';
                
                // 🔒 Apenas o Banner pode ser locked/unlocked
                const isLocked = isBanner ? isBannerLocked : false; // Outros sempre desbloqueados internamente
                
                // 🎯 Apenas o Banner pode ser arrastado pelo usuário
                const canDrag = isBanner && !isLocked;
                
                return (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className={cn("relative group", canDrag && "ios-drag-enabled")}
                    dragListener={canDrag} // 🔒 Só Banner desbloqueado pode ser arrastado
                    dragControls={undefined}
                    dragElastic={0.1} // 🍎 Reduz elasticidade para melhor controle no iOS
                    dragMomentum={false} // 🍎 Desabilita momentum para melhor controle no iOS
                    whileDrag={{
                      scale: 1, // ✅ SEM escala - mantém tamanho original
                      boxShadow: 'none', // ✅ SEM sombra durante arraste
                      zIndex: canDrag ? 100 : 'auto',
                      opacity: canDrag ? 0.9 : 1, // ✨ Levemente transparente ao arrastar
                      cursor: 'grabbing' // 🍎 Cursor visual
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 600, // ⬆️ Ainda mais rápido
                      damping: 40,    // ⬆️ Mais amortecimento
                      mass: 0.3       // ⬇️ Mais leve
                    }}
                    layout // ✨ Ativa layout animation para transições suaves
                    layoutId={block.id} // ✨ ID único para animação otimizada
                    style={{ 
                      touchAction: canDrag ? 'none' : 'auto', // 🍎 CRÍTICO: Desabilita scroll nativo do iOS durante drag
                      WebkitUserSelect: 'none', // 🍎 Previne seleção de texto no iOS
                      userSelect: 'none' // 🍎 Previne seleção de texto
                    }}
                  >
                    {/* 🔒 Botão de Lock/Unlock (APENAS no Banner) */}
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

                    {/* 🎯 Handle de Arraste (APENAS no Banner desbloqueado) */}
                    {isBanner && !isLocked && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-50">
                        <div 
                          className="bg-blue-500 text-white p-3 rounded-lg shadow-lg cursor-grab active:cursor-grabbing touch-none"
                          style={{
                            touchAction: 'none', // 🍎 CRÍTICO: Desabilita gestos nativos do iOS
                            WebkitTouchCallout: 'none', // 🍎 Desabilita menu de contexto do iOS
                            WebkitUserSelect: 'none',
                            userSelect: 'none'
                          }}
                        >
                          <GripVertical size={24} strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* Indicador Visual quando Banner está LOCKED */}
                    {isBanner && isLocked && (
                      <div className="absolute inset-0 bg-gray-900/5 border-2 border-red-500/20 rounded-lg pointer-events-none" />
                    )}
                    
                    {/* 🍎 Indicador Visual quando Banner está UNLOCKED (pronto para arrastar) */}
                    {isBanner && !isLocked && (
                      <div className="absolute inset-0 bg-green-500/5 border-2 border-green-500/30 rounded-lg pointer-events-none animate-pulse" />
                    )}

                    {/* Bloco Original */}
                    <BlockRenderer key={block.id} config={block} onAction={handleBlockAction} />
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        </div>

        <ReelsModal isOpen={!!activeReelsItem} item={activeReelsItem} onClose={() => setActiveReelsItem(null)} />
        
        {/* REMOVIDO: Modal de produto - Agora usa navegação para /product/[id] */}
      </div>
    </main>
  );
}

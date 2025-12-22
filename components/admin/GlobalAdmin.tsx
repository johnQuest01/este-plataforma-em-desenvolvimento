// components/admin/GlobalAdmin.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

// Importa a Engine e o Template
import { BlockRenderer } from '@/components/builder/BlockRender';
import { FooterBlock } from '@/components/builder/blocks/Footer'; // Importe explícito do Footer
import { ADMIN_TEMPLATE } from '@/data/templates/admin';

export const GlobalAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 1. SEGURANÇA: Fecha se a rota mudar
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsOpen(false), 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 2. EVENTOS EXTERNOS
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setTimeout(() => setIsOpen(false), 0);

    window.addEventListener('toggle_admin_menu', handleToggle);
    window.addEventListener('open_admin', handleOpen);
    window.addEventListener('close_admin', handleClose);

    return () => {
      window.removeEventListener('toggle_admin_menu', handleToggle);
      window.removeEventListener('open_admin', handleOpen);
      window.removeEventListener('close_admin', handleClose);
    };
  }, []);

  // --- ESTRATÉGIA LEGO: Separar Header e Footer do resto ---
  const headerBlock = ADMIN_TEMPLATE.find(b => b.type === 'header');
  const footerBlock = ADMIN_TEMPLATE.find(b => b.type === 'footer');
  
  // O conteúdo do meio é tudo que NÃO é header nem footer
  const scrollableBlocks = ADMIN_TEMPLATE.filter(b => b.type !== 'footer' && b.type !== 'header');

  const handleInterceptClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const linkElement = target.closest('a');
    const navButton = target.closest('button[data-nav="true"]') || target.closest('[data-action="navigate"]');

    if (linkElement || navButton) {
      setIsOpen(false);
    }
  };

  const handleBlockAction = (action: unknown) => {
    if (typeof action === 'string') {
      if (action.startsWith('/') || action === 'close' || action === 'navigate') {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE (Discreto quando fechado) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-[9990] w-14 h-14 bg-black border-2 border-white/20 rounded-full shadow-2xl flex items-center justify-center text-white"
            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
          >
            <Settings size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* MODAL DE ADMINISTRAÇÃO */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 lg:p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsOpen(false)} 
            />

            {/* WRAPPER PRINCIPAL (O Celular) */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={handleInterceptClick}
              className={cn(
                "w-full h-full bg-[#eeeeee] flex flex-col relative overflow-hidden pointer-events-auto shadow-2xl",
                "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
                "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900"
              )}
            >
              {/* --- 1. HEADER UNIVERSAL (FIXO) --- */}
              {headerBlock && (
                <div className="shrink-0 z-[60] relative shadow-md">
                   {/* Notch Fake (Apenas Desktop) */}
                   <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl pointer-events-none z-50"></div>
                   
                   {/* Renderiza o Header usando a config do template (Azul) */}
                   <BlockRenderer config={headerBlock} onAction={handleBlockAction} />
                   
                   {/* Botão Fechar EXPLICITO sobre o header */}
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                   >
                     <X size={18} strokeWidth={3} />
                   </button>
                </div>
              )}

              {/* --- 2. CONTEÚDO ROLÁVEL --- */}
              <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#eeeeee] relative w-full pb-32">
                <div className="flex flex-col min-h-full pt-4">
                  {scrollableBlocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      config={block}
                      onAction={handleBlockAction}
                    />
                  ))}
                </div>
              </div>

              {/* --- 3. FOOTER UNIVERSAL (FIXO) --- */}
              {footerBlock && footerBlock.isVisible && (
                <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom bg-transparent pointer-events-none">
                  <div className="pointer-events-auto">
                    <FooterBlock config={footerBlock} />
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
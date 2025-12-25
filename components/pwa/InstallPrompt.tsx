'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Verificação de ambiente
    if (typeof window === 'undefined') return;

    // 2. SOLUÇÃO PARA O ERRO DE CASCADING RENDERS:
    // Movemos a detecção para uma função assíncrona ou com timeout
    // Isso garante que o estado não mude "durante" a montagem síncrona.
    const initializeDetection = () => {
      const userAgent = window.navigator.userAgent;
      const isApple = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      if (isApple) {
        setIsIOS(true);
        // Se for Apple e não estiver instalado, mostramos após 3 segundos
        if (!isStandalone) {
          setTimeout(() => setIsVisible(true), 3000);
        }
      }
    };

    // Executa a detecção após o componente terminar de montar
    const detectionTimeout = setTimeout(initializeDetection, 100);

    // 3. Handler para Android/Chrome/Windows
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(detectionTimeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: Usuário escolheu ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  // 4. Segurança de Hidratação e Portal
  // Só renderiza se estiver no navegador e se o estado for visível
  if (!isVisible || typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96"
      >
        <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5874f6] rounded-xl flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">Instalar Aplicativo</span>
              <span className="text-[10px] text-gray-400">Acesso rápido e offline</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            {!isIOS ? (
              <button
                onClick={handleInstallClick}
                className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-2 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <Download size={14} strokeWidth={3} />
                Baixar
              </button>
            ) : (
              <div className="text-[10px] text-gray-300 max-w-[140px] leading-tight text-right">
                Toque em <span className="font-bold underline">Compartilhar</span> e <span className="font-bold underline">Adicionar à Tela de Início</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
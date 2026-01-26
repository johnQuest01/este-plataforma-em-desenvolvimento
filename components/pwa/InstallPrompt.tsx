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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Verificação de ambiente
    if (typeof window === 'undefined') return;
    
    setIsMounted(true);

    // 2. Previne múltiplas execuções
    let componentMounted = true;
    let detectionTimeout: NodeJS.Timeout | null = null;
    let iosTimeout: NodeJS.Timeout | null = null;

    // 3. SOLUÇÃO PARA O ERRO DE CASCADING RENDERS:
    // Movemos a detecção para uma função assíncrona ou com timeout
    // Isso garante que o estado não mude "durante" a montagem síncrona.
    const initializeDetection = () => {
      if (!componentMounted) return;
      
      const userAgent = window.navigator.userAgent;
      const isApple = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

      if (isApple && componentMounted) {
        setIsIOS(true);
        // Se for Apple e não estiver instalado, mostramos após 3 segundos
        if (!isStandalone) {
          iosTimeout = setTimeout(() => {
            if (componentMounted) setIsVisible(true);
          }, 3000);
        }
      } else if (isMobile && !isStandalone && componentMounted) {
        // Para Android/outros mobile: mostra após 2 segundos
        // Mesmo sem beforeinstallprompt, mostra instruções de instalação manual
        setTimeout(() => {
          if (componentMounted) {
            setIsVisible(true);
          }
        }, 2000);
      }
    };

    // Executa a detecção após o componente terminar de montar
    detectionTimeout = setTimeout(initializeDetection, 100);

    // 4. Handler para Android/Chrome/Windows (evento nativo do PWA)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (componentMounted) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      componentMounted = false;
      if (detectionTimeout) {
        clearTimeout(detectionTimeout);
      }
      if (iosTimeout) {
        clearTimeout(iosTimeout);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // ✅ SEM dependências para evitar loops

  // Não renderiza até estar montado no cliente
  if (!isMounted || typeof window === 'undefined') return null;

  const handleInstallClick = async (): Promise<void> => {
    // Se tiver o evento beforeinstallprompt, usa ele
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log(`PWA: Usuário escolheu ${choice.outcome}`);
        setDeferredPrompt(null);
        setIsVisible(false);
      } catch (error) {
        console.error('Erro ao chamar prompt:', error);
        // Fallback: tenta instalação manual
        handleManualInstall();
      }
    } else {
      // Fallback: instruções para instalação manual
      handleManualInstall();
    }
  };

  const handleManualInstall = (): void => {
    // Para Android/Chrome: mostra instruções visuais
    const userAgent = window.navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);
    const isSamsung = /SamsungBrowser/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    
    let message = '';
    
    if (isAndroid && isChrome) {
      message = 'Para instalar o app:\n\n1. Toque no menu (3 pontos no canto superior direito)\n2. Procure por "Instalar app" ou "Adicionar à tela inicial"\n3. Toque para instalar\n\nO app será adicionado à sua tela inicial!';
    } else if (isSamsung) {
      message = 'Para instalar o app:\n\n1. Toque no menu (3 linhas)\n2. Selecione "Adicionar página a"\n3. Escolha "Tela inicial"\n\nO app será adicionado!';
    } else if (isFirefox) {
      message = 'Para instalar o app:\n\n1. Toque no menu (3 pontos)\n2. Selecione "Página" → "Instalar"\n\nO app será instalado!';
    } else {
      message = 'Para instalar o app:\n\n1. Toque no menu do navegador\n2. Procure por "Instalar app", "Adicionar à tela inicial" ou "Adicionar à Home"\n3. Siga as instruções na tela\n\nO app será instalado!';
    }
    
    // Mostra mensagem e fecha o card
    alert(message);
    setIsVisible(false);
    
    // Log para debug
    console.log('PWA: Instruções de instalação manual mostradas');
  };

  // 5. Segurança de Hidratação e Portal
  // Só renderiza se estiver no navegador e se o estado for visível
  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 z-9999 md:left-auto md:right-6 md:w-96"
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
                onClick={() => handleInstallClick()}
                disabled={false}
                className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-2 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} strokeWidth={3} />
                {deferredPrompt ? 'Instalar' : 'Instalar'}
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
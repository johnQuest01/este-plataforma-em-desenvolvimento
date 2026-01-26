'use client';

import { useEffect } from 'react';

/**
 * Componente que aplica estilos standalone quando o app está instalado
 * O Service Worker é registrado automaticamente pelo @ducanh2912/next-pwa
 * Segue o protocolo @.cursorrules: Zero any, TypeScript Strict, Componente Puro
 */
export function PWAHead(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta modo standalone e aplica classe CSS
    const checkStandaloneMode = (): void => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        document.documentElement.classList.add('standalone-mode');
        document.body.classList.add('standalone-mode');
      }
    };

    // Verifica imediatamente
    checkStandaloneMode();

    // Observa mudanças no display mode (sem registrar SW manualmente)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (): void => {
      checkStandaloneMode();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Componente não renderiza nada, apenas executa efeitos
  return null;
}

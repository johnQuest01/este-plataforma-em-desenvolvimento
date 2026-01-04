// path: src/components/guardian/GuardianBeacon.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeElementStateEnum, UIMetrics } from "@/schemas/guardian-runtime-schema";

// Tipos de arquivos que podemos rastrear
type GuardianFileType = "UI_COMPONENT" | "POPUP" | "HOOK" | "LAYOUT" | "FORM";

interface GuardianBeaconProps {
  file: string; 
  type: GuardianFileType;
  id?: string; 
  children?: React.ReactNode;
}

/**
 * BEACON 2.0: Scanner de UI Profundo
 * Agora capaz de ler conteúdo textual e estrutura de layout.
 */
export const GuardianBeacon = ({ file, type, id, children }: GuardianBeaconProps) => {
  const registerElement = useGuardianStore((state) => state.registerElement);
  const unregisterElement = useGuardianStore((state) => state.unregisterElement);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const elementId = useMemo(() => {
    return id || `${file}-${Math.random().toString(36).substr(2, 9)}`;
  }, [file, id]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const scanDOM = () => {
      if (!containerRef.current) return;
      
      // Como usamos display: contents, o containerRef não tem tamanho.
      // Precisamos pegar o primeiro filho real (o componente do usuário).
      const targetElement = containerRef.current.firstElementChild as HTMLElement;
      
      if (!targetElement) return; // Ainda não montou o filho

      // 1. Análise de Estilo Computado
      const style = window.getComputedStyle(targetElement);
      const rect = targetElement.getBoundingClientRect();
      
      // 2. Deep Scan de Elementos
      const buttonNodes = targetElement.querySelectorAll('button, [role="button"]');
      const inputNodes = targetElement.querySelectorAll('input, textarea, select');
      const imageNodes = targetElement.querySelectorAll('img');
      const headingNodes = targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // 3. Extração de Conteúdo Rico (O que está escrito?)
      const buttonLabels = Array.from(buttonNodes)
        .map(b => (b as HTMLElement).innerText?.slice(0, 20) || "Icon Only")
        .filter(t => t.length > 0)
        .slice(0, 5); // Pega os 5 primeiros para não poluir

      const headings = Array.from(headingNodes)
        .map(h => (h as HTMLElement).innerText?.slice(0, 30))
        .filter(t => t && t.length > 0);

      const inputPlaceholders = Array.from(inputNodes)
        .map(i => (i as HTMLInputElement).placeholder || (i as HTMLInputElement).name)
        .filter(t => t && t.length > 0)
        .slice(0, 5);

      // Contar nós de texto
      let textNodes = 0;
      const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, null);
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue?.trim().length ?? 0 > 0) textNodes++;
      }

      // 4. Diagnósticos
      const isResponsiveIssue = targetElement.scrollWidth > targetElement.clientWidth;
      const aspectRatio = rect.height > 0 ? (rect.width / rect.height).toFixed(2) : "N/A";

      const metrics: UIMetrics = {
        width: rect.width,
        height: rect.height,
        aspectRatio,
        isFlex: style.display.includes('flex'),
        flexDirection: style.flexDirection,
        isGrid: style.display.includes('grid'),
        computedDisplay: style.display,
        isResponsiveIssue,
        elementCount: { 
            buttons: buttonNodes.length, 
            inputs: inputNodes.length, 
            images: imageNodes.length, 
            textNodes 
        },
        contentMap: {
            buttonLabels,
            headings,
            inputPlaceholders
        }
      };

      registerElement({
        elementId,
        componentName: file.split('/').pop()?.replace('.tsx', '') || "Unknown",
        responsibleFile: file,
        isPopup: type === "POPUP",
        zIndex: type === "POPUP" ? parseInt(style.zIndex) || 50 : 0,
        state: RuntimeElementStateEnum.enum.VISIBLE,
        timestamp: new Date().toISOString(),
        childComponents: [], 
        metrics: metrics,
        metadata: { type, origin: "GuardianBeacon" }
      });
    };

    const resizeObserver = new ResizeObserver(() => scanDOM());
    // Observamos o pai do containerRef porque display:contents não dispara resize events corretamente em alguns browsers
    if (containerRef.current?.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
    }

    const mutationObserver = new MutationObserver(() => scanDOM());
    if (containerRef.current) {
        mutationObserver.observe(containerRef.current, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            characterData: true
        });
    }

    // Pequeno delay para garantir que o React montou o filho
    setTimeout(scanDOM, 100);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      unregisterElement(elementId);
    };
  }, [file, type, elementId, registerElement, unregisterElement]);

  if (process.env.NODE_ENV !== 'development') return <>{children}</>;

  return (
    <div 
      ref={containerRef} 
      data-guardian-id={elementId} 
      style={{ display: 'contents' }} 
    >
      {children}
    </div>
  );
};

export function withGuardian<P extends object>(
  Component: React.ComponentType<P>,
  filePath: string,
  type: GuardianFileType = "UI_COMPONENT"
) {
  const WrappedComponent = (props: P) => {
    return (
      <GuardianBeacon file={filePath} type={type}>
        <Component {...props} />
      </GuardianBeacon>
    );
  };
  
  WrappedComponent.displayName = `Guardian(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
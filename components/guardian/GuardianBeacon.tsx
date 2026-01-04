// path: src/components/guardian/GuardianBeacon.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ CORREÇÃO DE PUREZA:
  // Usamos useState com inicializador preguiçoso para gerar o sufixo aleatório apenas uma vez.
  // Isso evita o erro "Cannot call impure function during render".
  const [randomSuffix] = useState(() => Math.random().toString(36).substr(2, 9));

  const elementId = useMemo(() => {
    return id || `${file}-${randomSuffix}`;
  }, [file, id, randomSuffix]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const scanDOM = () => {
      if (!containerRef.current) return;
     
      // Tenta pegar o primeiro filho direto (o componente real)
      let targetElement = containerRef.current.firstElementChild as HTMLElement;
      
      // Se não houver filho (ex: renderização condicional retornando null), não faz nada
      if (!targetElement) return;

      // 1. Análise de Dimensões Inteligente
      // Se o target tiver altura 0 (comum em wrappers ou fragments), tenta pegar o próximo elemento visível
      let rect = targetElement.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0 && targetElement.nextElementSibling) {
          const nextSibling = targetElement.nextElementSibling as HTMLElement;
          if (nextSibling) {
              targetElement = nextSibling;
              rect = nextSibling.getBoundingClientRect();
          }
      }

      const style = window.getComputedStyle(targetElement);
     
      // 2. Deep Scan de Elementos (QuerySelectorAll é muito rápido)
      const buttonNodes = targetElement.querySelectorAll('button, a[role="button"], [role="button"], input[type="button"], input[type="submit"]');
      const inputNodes = targetElement.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea, select');
      const imageNodes = targetElement.querySelectorAll('img, svg image');
      const headingNodes = targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
     
      // 3. Extração de Conteúdo Rico
      const buttonLabels = Array.from(buttonNodes)
        .map(b => (b as HTMLElement).innerText?.trim() || (b as HTMLInputElement).value?.trim() || "Icon/Action")
        .filter(t => t.length > 0)
        .slice(0, 8);

      const headings = Array.from(headingNodes)
        .map(h => (h as HTMLElement).innerText?.trim())
        .filter(t => t && t.length > 0);

      const inputPlaceholders = Array.from(inputNodes)
        .map(i => (i as HTMLInputElement).placeholder?.trim() || (i as HTMLInputElement).name?.trim() || "Input")
        .filter(t => t && t.length > 0)
        .slice(0, 8);

      // Contagem de Nós de Texto (Ignorando espaços em branco)
      let textNodes = 0;
      const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, null);
      while (walker.nextNode()) {
        const val = walker.currentNode.nodeValue;
        // Regex para verificar se tem pelo menos uma letra ou número
        if (val && /[a-zA-Z0-9]/.test(val)) {
          textNodes++;
        }
      }

      const isResponsiveIssue = targetElement.scrollWidth > targetElement.clientWidth;
      const aspectRatio = rect.height > 0 ? (rect.width / rect.height).toFixed(2) : "N/A";

      const metrics: UIMetrics = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
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
            textNodes: textNodes
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

    setTimeout(scanDOM, 200); // Delay levemente maior para garantir renderização

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
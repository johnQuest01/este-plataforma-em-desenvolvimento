// path: src/components/builder/blocks/master/RexRuntimePixel.tsx
"use client";

import React, { useEffect } from "react";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeTracker, RuntimeElementStateEnum } from "@/schemas/guardian-runtime-schema";

// --- 1. NOVO COMPONENTE: GUARDIAN TRACKER (A ETIQUETA) ---
/**
 * Coloque este componente dentro de qualquer Modal ou Popup.
 * Ele serve para identificar explicitamente qual arquivo é responsável pela tela.
 * 
 * Exemplo de uso:
 * <GuardianTracker file="components/modals/StockModal.tsx" />
 */
export function GuardianTracker({ file }: { file: string }) {
  // Em produção, isso não renderiza nada para economizar bytes
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <span 
      data-guardian-file={file} 
      style={{ display: 'none' }} 
      aria-hidden="true" 
    />
  );
}

interface RexRuntimePixelProps {
  elementId: string;
  componentName: string;
  isPopup?: boolean;
  responsibleFile?: string;
  children: React.ReactNode;
}

export function RexRuntimePixel({
  elementId,
  componentName,
  isPopup = false,
  responsibleFile,
  children
}: RexRuntimePixelProps) {
  const registerElement = useGuardianStore((state) => state.registerElement);
  const unregisterElement = useGuardianStore((state) => state.unregisterElement);

  useEffect(() => {
    const inferredFile = responsibleFile || `components/builder/blocks/${formatToPascalCase(componentName)}.tsx`;

    const trackerData: RuntimeTracker = {
      elementId,
      componentName,
      responsibleFile: inferredFile,
      isPopup,
      zIndex: isPopup ? 50 : 0,
      state: RuntimeElementStateEnum.enum.MOUNTED,
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    registerElement(trackerData);

    return () => {
      unregisterElement(elementId);
    };
  }, [elementId, componentName, isPopup, responsibleFile, registerElement, unregisterElement]);

  return <>{children}</>;
}

function formatToPascalCase(text: string): string {
  return text.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, "").toUpperCase());
}

// Algoritmo de Fallback (React Fiber) caso não tenha o Tracker
function getReactComponentInfo(domNode: HTMLElement): { name: string; fileName: string } | null {
  try {
    const key = Object.keys(domNode).find((k) => k.startsWith("__reactFiber$"));
    if (!key) return null;

    // @ts-expect-error - Acessando propriedade interna do React
    let fiber = domNode[key];

    while (fiber) {
      if (fiber._debugSource) {
        const fullPath = fiber._debugSource.fileName;
        let relativePath = fullPath;
        if (fullPath.includes("src/")) relativePath = "src/" + fullPath.split("src/")[1];
        else if (fullPath.includes("app/")) relativePath = "app/" + fullPath.split("app/")[1];

        let componentName = "Anonymous";
        if (fiber.type && typeof fiber.type === 'function') componentName = fiber.type.name || fiber.type.displayName;
        else if (fiber.type && typeof fiber.type === 'object') componentName = fiber.type.displayName || fiber.type.name;

        if (componentName && relativePath) return { name: componentName, fileName: relativePath };
      }
      fiber = fiber.return;
    }
  } catch (error) { console.warn(error); }
  return null;
}

/**
 * GlobalObserver Atualizado:
 * 1. Procura pela etiqueta <GuardianTracker /> dentro do popup.
 * 2. Se não achar, tenta usar a inteligência do React Fiber.
 */
export function GlobalGuardianObserver() {
  const registerElement = useGuardianStore((state) => state.registerElement);
  const unregisterElement = useGuardianStore((state) => state.unregisterElement);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            const zIndex = parseInt(style.zIndex, 10);
           
            // Detecta containers de Popup (Fixed/Absolute + High Z-Index)
            if ((style.position === 'fixed' || style.position === 'absolute') && zIndex >= 40) {
              
              // --- ESTRATÉGIA 1: BUSCA EXPLÍCITA (GUARDIAN TRACKER) ---
              // Procura um elemento filho com o atributo data-guardian-file
              const trackerNode = node.querySelector('[data-guardian-file]');
              const explicitFile = trackerNode?.getAttribute('data-guardian-file');

              let detectedName = "External Popup/Overlay";
              let detectedFile = "Unknown (External/Library)";
              let detectionMethod = "Unknown";

              if (explicitFile) {
                // ✅ SUCESSO: Identificador manual encontrado!
                detectedFile = explicitFile;
                detectedName = explicitFile.split('/').pop() || "Identified Popup";
                detectionMethod = "ExplicitTracker";
              } else {
                // --- ESTRATÉGIA 2: INTELIGÊNCIA AUTOMÁTICA (REACT FIBER) ---
                const reactInfo = getReactComponentInfo(node);
                if (reactInfo) {
                    detectedName = reactInfo.name;
                    detectedFile = reactInfo.fileName;
                    detectionMethod = "ReactFiberTraversal";
                }
              }

              registerElement({
                elementId: node.id || `popup-${Math.random().toString(36).substr(2, 9)}`,
                componentName: detectedName,
                responsibleFile: detectedFile,
                isPopup: true,
                zIndex: zIndex,
                state: RuntimeElementStateEnum.enum.VISIBLE,
                timestamp: new Date().toISOString(),
                metadata: { origin: "GlobalObserver", method: detectionMethod }
              });
            }
          }
        });

        mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.id) {
                unregisterElement(node.id);
            }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [registerElement, unregisterElement]);

  return null;
}
// path: src/components/builder/blocks/master/RexRuntimePixel.tsx
"use client";

import React, { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeTracker, RuntimeElementStateEnum, ComponentNode } from "@/schemas/guardian-runtime-schema";

// --- TIPAGEM ESTRITA DO REACT FIBER ---
interface FiberSource {
  fileName: string;
  lineNumber?: number;
}

interface FiberTypeObject {
  displayName?: string;
  name?: string;
}

type FiberType = string | FiberTypeObject | ((...args: unknown[]) => unknown) | null;

interface ReactFiberNode {
  return: ReactFiberNode | null;
  child: ReactFiberNode | null;
  sibling: ReactFiberNode | null;
  type: FiberType;
  _debugSource?: FiberSource;
  stateNode?: Element | null;
}

// --- 1. GUARDIAN TRACKER ---
export function GuardianTracker({ file }: { file: string }) {
  if (process.env.NODE_ENV !== 'development') return null;
  return <span data-guardian-file={file} style={{ display: 'none' }} aria-hidden="true" />;
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
    const inferredFile = responsibleFile || `components/builder/blocks/${componentName}.tsx`;
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
    return () => unregisterElement(elementId);
  }, [elementId, componentName, isPopup, responsibleFile, registerElement, unregisterElement]);

  return <>{children}</>;
}

// --- ALGORITMOS DE INTELIGÊNCIA (DEEP SCAN) ---

function getFiberFromDom(domNode: HTMLElement): ReactFiberNode | null {
  const key = Object.keys(domNode).find((k) => k.startsWith("__reactFiber$"));
  // @ts-expect-error - Acesso seguro via string dinâmica
  return key ? domNode[key] : null;
}

function cleanFilePath(fullPath: string): string {
  if (fullPath.includes("src/")) return "src/" + fullPath.split("src/")[1];
  if (fullPath.includes("app/")) return "app/" + fullPath.split("app/")[1];
  return fullPath;
}

function getComponentName(fiber: ReactFiberNode): string | null {
  if (!fiber.type) return null;
  if (typeof fiber.type === 'string') return null; // Ignora divs, spans
  if (typeof fiber.type === 'function') return fiber.type.name || (fiber.type as any).displayName;
  if (typeof fiber.type === 'object') return (fiber.type as any).displayName || (fiber.type as any).name;
  return null;
}

// 🧠 ALGORITMO RECURSIVO DE MAPEAMENTO DE TELA
function buildComponentTree(fiber: ReactFiberNode, depth: number = 0): ComponentNode | null {
  if (depth > 20) return null; // Limite de segurança

  const name = getComponentName(fiber);
  const file = fiber._debugSource ? cleanFilePath(fiber._debugSource.fileName) : undefined;

  // Se não for um componente React customizado (ex: div), continuamos descendo mas não criamos nó
  if (!name || name === "GuardianTracker" || name.startsWith("Next")) {
    if (fiber.child) return buildComponentTree(fiber.child, depth);
    return null;
  }

  const node: ComponentNode = {
    name,
    file,
    depth,
    children: []
  };

  // Varre os filhos (Child) e irmãos (Sibling)
  let child = fiber.child;
  while (child) {
    const childNode = buildComponentTree(child, depth + 1);
    if (childNode) {
      node.children.push(childNode);
    }
    // Otimização: Se o filho for apenas HTML (div), pegamos os netos dele e subimos
    else if (child.child) {
       // Lógica simplificada para não poluir a árvore com nós vazios
       // Em uma implementação real completa, faríamos um "flatten" aqui
    }
    child = child.sibling;
  }

  return node;
}

/**
 * GlobalObserver Atualizado:
 * 1. Detecta Popups (como antes).
 * 2. Escaneia a Rota Ativa inteira quando o pathname muda.
 */
export function GlobalGuardianObserver() {
  const pathname = usePathname();
  const registerElement = useGuardianStore((state) => state.registerElement);
  const unregisterElement = useGuardianStore((state) => state.unregisterElement);
  const setRouteStructure = useGuardianStore((state) => state.setRouteStructure);

  // 1. Scanner de Rota (Executa ao navegar)
  useEffect(() => {
    // Pequeno delay para garantir que o React montou a nova página
    const timer = setTimeout(() => {
      const rootElement = document.getElementById('main-content') || document.body;
      const rootFiber = getFiberFromDom(rootElement);
      
      if (rootFiber) {
        // Começa a varredura a partir do root
        const tree = buildComponentTree(rootFiber);
        setRouteStructure(tree);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, setRouteStructure]);

  // 2. Scanner de Popups (Mutation Observer)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            const zIndex = parseInt(style.zIndex, 10);
           
            if ((style.position === 'fixed' || style.position === 'absolute') && zIndex >= 40) {
              const trackerNode = node.querySelector('[data-guardian-file]');
              const explicitFile = trackerNode?.getAttribute('data-guardian-file');
              
              let detectedName = "External Popup/Overlay";
              let detectedFile = "Unknown (External/Library)";
              let detectionMethod = "Unknown";

              if (explicitFile) {
                detectedFile = explicitFile;
                detectedName = explicitFile.split('/').pop() || "Identified Popup";
                detectionMethod = "ExplicitTracker";
              } else {
                // Tenta descobrir via Fiber se não tiver etiqueta
                const fiber = getFiberFromDom(node);
                if (fiber && fiber._debugSource) {
                    detectedFile = cleanFilePath(fiber._debugSource.fileName);
                    detectedName = getComponentName(fiber) || "Unknown Component";
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
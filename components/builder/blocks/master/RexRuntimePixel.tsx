// path: src/components/builder/blocks/master/RexRuntimePixel.tsx
"use client";


import React, { useEffect } from "react";
import { useGuardianStore } from "@/hooks/use-guardian-store";
import { RuntimeTracker, RuntimeElementStateEnum } from "@/schemas/guardian-runtime-schema";


// --- TIPAGEM ESTRITA PARA REACT FIBER (INTERNALS) ---
// Define a estrutura mínima necessária dos nós internos do React para evitar 'any'
interface FiberSource {
  fileName: string;
  lineNumber?: number;
}


interface FiberTypeObject {
  displayName?: string;
  name?: string;
}


// União de tipos possíveis para 'type' em um nó Fiber
type FiberType =
  | string
  | FiberTypeObject
  | ((...args: unknown[]) => unknown)
  | null;


interface ReactFiberNode {
  return: ReactFiberNode | null;
  child: ReactFiberNode | null;
  sibling: ReactFiberNode | null;
  type: FiberType;
  _debugSource?: FiberSource;
  stateNode?: Element | null;
}


// --- 1. GUARDIAN TRACKER (A ETIQUETA) ---
export function GuardianTracker({ file }: { file: string }) {
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
    const inferredFile = responsibleFile || `components/builder/blocks/${componentName}.tsx`;


    const trackerData: RuntimeTracker = {
      elementId,
      componentName,
      responsibleFile: inferredFile,
      isPopup,
      zIndex: isPopup ? 50 : 0,
      state: RuntimeElementStateEnum.enum.MOUNTED,
      timestamp: new Date().toISOString(),
      childComponents: [], // Pixel padrão não escaneia filhos por enquanto para performance
      metadata: {},
    };


    registerElement(trackerData);


    return () => {
      unregisterElement(elementId);
    };
  }, [elementId, componentName, isPopup, responsibleFile, registerElement, unregisterElement]);


  return <>{children}</>;
}


// --- ALGORITMOS DE INTELIGÊNCIA ---


// 1. Descobre o arquivo pai (React Fiber)
function getReactComponentInfo(domNode: HTMLElement): { name: string; fileName: string; fiber: ReactFiberNode } | null {
  try {
    const key = Object.keys(domNode).find((k) => k.startsWith("__reactFiber$"));
    if (!key) return null;


    // Casting seguro para acessar a propriedade dinâmica
    const nodeWithFiber = domNode as unknown as Record<string, ReactFiberNode>;
    let fiber: ReactFiberNode | null = nodeWithFiber[key];


    while (fiber) {
      if (fiber._debugSource) {
        const fullPath = fiber._debugSource.fileName;
        let relativePath = fullPath;
        if (fullPath.includes("src/")) relativePath = "src/" + fullPath.split("src/")[1];
        else if (fullPath.includes("app/")) relativePath = "app/" + fullPath.split("app/")[1];


        let componentName = "Anonymous";
       
        // Verificação de tipo estrita para extrair o nome
        if (fiber.type) {
            if (typeof fiber.type === 'function') {
                componentName = fiber.type.name || (fiber.type as unknown as { displayName?: string }).displayName || componentName;
            } else if (typeof fiber.type === 'object') {
                componentName = (fiber.type as FiberTypeObject).displayName || (fiber.type as FiberTypeObject).name || componentName;
            }
        }


        if (componentName && relativePath) return { name: componentName, fileName: relativePath, fiber };
      }
      fiber = fiber.return;
    }
  } catch (error) { console.warn(error); }
  return null;
}


// 2. ✅ NOVO: Escaneia a árvore de componentes filhos (Deep Scan)
// Agora tipado corretamente com ReactFiberNode
function scanComponentTree(fiberNode: ReactFiberNode): string[] {
    const components = new Set<string>();
    const maxDepth = 10; // Limite de profundidade para evitar loops infinitos


    function walk(node: ReactFiberNode | null, depth: number) {
        if (!node || depth > maxDepth) return;


        // Tenta pegar o nome do componente
        let name = "";
        if (node.type) {
            if (typeof node.type === 'function') {
                name = node.type.name || (node.type as unknown as { displayName?: string }).displayName || "";
            } else if (typeof node.type === 'object') {
                name = (node.type as FiberTypeObject).displayName || (node.type as FiberTypeObject).name || "";
            }
        }


        // Filtra apenas componentes React customizados (Começam com Maiúscula)
        // Ignora divs, spans, e componentes internos do Next.js
        if (name && /^[A-Z]/.test(name) && !name.startsWith("Next") && name !== "GuardianTracker") {
            components.add(name);
        }


        // Recursão para filhos e irmãos
        if (node.child) walk(node.child, depth + 1);
        if (node.sibling) walk(node.sibling, depth);
    }


    if (fiberNode && fiberNode.child) {
        walk(fiberNode.child, 0);
    }


    return Array.from(components).slice(0, 15); // Retorna no máximo 15 componentes para não poluir
}


/**
 * GlobalObserver Atualizado
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
           
            if ((style.position === 'fixed' || style.position === 'absolute') && zIndex >= 40) {
             
              // 1. Busca Explícita (Guardian Tracker)
              const trackerNode = node.querySelector('[data-guardian-file]');
              const explicitFile = trackerNode?.getAttribute('data-guardian-file');


              let detectedName = "External Popup/Overlay";
              let detectedFile = "Unknown (External/Library)";
              let detectionMethod = "Unknown";
              let detectedChildren: string[] = [];


              // Tenta obter informações do React Fiber para escaneamento profundo
              const reactInfo = getReactComponentInfo(node);


              if (explicitFile) {
                detectedFile = explicitFile;
                detectedName = explicitFile.split('/').pop() || "Identified Popup";
                detectionMethod = "ExplicitTracker";
               
                // ✅ Se temos o Fiber, escaneamos os filhos mesmo com a etiqueta manual
                if (reactInfo?.fiber) {
                    detectedChildren = scanComponentTree(reactInfo.fiber);
                }


              } else {
                if (reactInfo) {
                    detectedName = reactInfo.name;
                    detectedFile = reactInfo.fileName;
                    detectionMethod = "ReactFiberTraversal";
                    // ✅ Escaneia filhos
                    detectedChildren = scanComponentTree(reactInfo.fiber);
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
                childComponents: detectedChildren, // ✅ Salva a lista de componentes
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


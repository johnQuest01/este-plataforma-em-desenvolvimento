// components/builder/ui/ButtonsFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { usePathname } from 'next/navigation';
import Link from 'next/link'; 
import { FooterItem, BlockStyle } from '@/types/builder';

interface ButtonsFooterProps {
    items: FooterItem[];
    style: BlockStyle;
}

/**
 * ButtonsFooter: Infinite Drag Carousel
 * 
 * Componente de rodapé com carrossel infinito horizontal de botões,
 * permitindo drag/swipe contínuo com efeito de loop infinito.
 * 
 * Features:
 * - Loop infinito matemático usando useTransform com módulo
 * - Duplicação de itens para ilusão visual contínua
 * - Reset suave quando excede limites
 * - Física de inércia e momentum nativa
 * - Botão de destaque para rota /pos (Caixa/PDV)
 * - Detecção automática de rota ativa via usePathname
 */
export const ButtonsFooter = ({ items, style }: ButtonsFooterProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    
    // Motion value para rastrear posição raw do drag
    // SEM SPRING: Usa x diretamente para evitar movimento automático
    // Os botões só se movem quando o usuário arrasta manualmente
    const x = useMotionValue(0);
    
    // Armazena a posição inicial do drag para calcular delta
    const dragStartX = useRef<number>(0);
    // Rastreia se o usuário está arrastando ou apenas tocando
    const isDragging = useRef<boolean>(false);
    const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
    // Rastreia direção do drag para física de corrente
    const dragDirection = useRef<number>(0); // -1 = esquerda, 1 = direita, 0 = neutro
    const lastDragX = useRef<number>(0);
    
    // Inicializa lastDragX com o valor inicial de x
    useEffect(() => {
        lastDragX.current = x.get();
    }, [x]);

    // 1. Filtra itens visíveis (Memorizado para performance)
    const visibleItems = useMemo(() => {
        return items.filter(item => item.isVisible);
    }, [items]);

    // 2. Estado para rastrear qual botão está no centro (dinâmico durante drag)
    // IMPORTANTE: Este estado é APENAS informativo e NÃO influencia a detecção individual
    // A detecção individual é completamente independente e baseada apenas em distância física
    const [centerButtonId, setCenterButtonId] = useState<string | null>(null);
    const containerWidthRef = useRef<number>(0);
    
    // Garante que não há inicialização com preferência por nenhum botão
    // Reset completo ao montar o componente
    useEffect(() => {
        setCenterButtonId(null);
    }, []);
    
    // Reset do estado quando os itens mudam para evitar estado persistente
    useEffect(() => {
        setCenterButtonId(null);
    }, [visibleItems]);

    // 3. Identifica botão de destaque (Dashboard - Tela Inicial)
    const highlightItem = useMemo(() => {
        return visibleItems.find(item => item.route === '/dashboard' || item.isHighlight);
    }, [visibleItems]);

    // 4. Duplica itens para criar loop infinito contínuo (botões dando voltas na tela)
    // Técnica: Múltiplas cópias idênticas para garantir que SEMPRE haja botões visíveis
    // Quando um botão sai de um lado, aparece imediatamente do outro lado
    // Cria a ilusão de que os botões estão dando voltas infinitas na tela
    // AUMENTADO para 5 cópias para garantir visibilidade contínua em scroll infinito
    const duplicatedItems = useMemo(() => {
        if (visibleItems.length === 0) return [];
        
        // Cria múltiplas cópias (8 cópias) para garantir loop infinito contínuo perfeito SEM FIM
        // Cada cópia é idêntica, permitindo reset imperceptível
        // Com 8 cópias, SEMPRE há botões visíveis mesmo em scroll muito rápido e prolongado
        const copies: FooterItem[][] = [];
        const numberOfCopies = 8; // Aumentado para 8 cópias para garantir visibilidade contínua ABSOLUTA
        
        for (let copyIndex = 0; copyIndex < numberOfCopies; copyIndex++) {
            copies.push(
                visibleItems.map((item, itemIndex) => ({
                    ...item,
                    id: `${item.id}_loop_${copyIndex}_${itemIndex}`
                }))
            );
        }
        
        // Concatena todas as cópias para criar lista infinita
        return copies.flat();
    }, [visibleItems]);

    // 5. Calcula largura do item e conteúdo dinamicamente
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!contentRef.current || duplicatedItems.length === 0) return;

            // Calcula largura de um item (incluindo gap)
            const firstButton = contentRef.current.querySelector('[data-button-item]') as HTMLElement;
            if (firstButton) {
                const buttonRect = firstButton.getBoundingClientRect();
                const gap = 12; // gap-3 = 12px
                const itemWidthCalculated = buttonRect.width + gap;
                
                // Calcula largura total do conteúdo (uma cópia completa)
                const singleSetWidth = visibleItems.length * itemWidthCalculated;
                setContentWidth(singleSetWidth);
            }
        };

        calculateDimensions();
        
        // Recalcula em resize
        window.addEventListener('resize', calculateDimensions);
        const timeoutId = setTimeout(calculateDimensions, 100);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            clearTimeout(timeoutId);
        };
    }, [visibleItems.length, duplicatedItems.length]);

    // 6. FUNÇÃO MATEMÁTICA DE LOOP INFINITO CONTÍNUO (SEM FIM)
    // Técnica: Função matemática robusta usando módulo matemático correto para criar loop perfeito infinito
    // Garante que os botões SEMPRE apareçam do outro lado quando saem da tela
    // Funciona em ambas as direções: direita->esquerda e esquerda->direita
    // NUNCA permite que os botões desapareçam - loop infinito verdadeiro
    // contentWidth = largura de UMA cópia completa dos itens
    // IMPORTANTE: Usa x diretamente (sem spring) para evitar movimento automático
    // Os botões só se movem quando o usuário arrasta manualmente
    
    // Função auxiliar para módulo matemático correto (funciona com valores negativos)
    const mathMod = (value: number, modulus: number): number => {
        return ((value % modulus) + modulus) % modulus;
    };
    
    const wrappedX = useTransform(x, (latestX): number => {
        if (contentWidth === 0) return latestX;
        
        // FUNÇÃO MATEMÁTICA ROBUSTA DE LOOP INFINITO SEM FIM:
        // Usa módulo matemático correto para valores negativos e positivos
        // Garante que o valor sempre fique no range [-contentWidth, 0]
        
        // Passo 1: Calcula módulo matemático correto usando função auxiliar
        // A função mathMod garante que funciona corretamente com valores negativos
        const modulo = mathMod(latestX, contentWidth);
        
        // Passo 2: Normaliza para range negativo [-contentWidth, 0]
        // Se o módulo é 0, significa que está exatamente no início de uma cópia
        // Se o módulo é positivo, subtrai contentWidth para normalizar para negativo
        let wrapped = modulo === 0 ? -contentWidth : modulo - contentWidth;
        
        // Passo 3: Garantia absoluta de que nunca fique fora do range [-contentWidth, 0]
        // Loop infinito: se estiver fora do range, normaliza até estar dentro
        // Isso previne qualquer edge case onde o valor possa estar fora do range esperado
        if (wrapped > 0) {
            wrapped = wrapped - contentWidth;
        }
        if (wrapped <= -contentWidth) {
            wrapped = wrapped + contentWidth;
        }
        
        // Passo 4: Verificação final para garantir que está no range correto
        // Se ainda estiver fora (edge case extremo), força normalização usando mathMod novamente
        if (wrapped > 0 || wrapped <= -contentWidth) {
            wrapped = mathMod(latestX, contentWidth) - contentWidth;
            // Garantia adicional: se ainda estiver fora, força para dentro do range
            if (wrapped > 0) wrapped = wrapped - contentWidth;
            if (wrapped <= -contentWidth) wrapped = wrapped + contentWidth;
        }
        
        return wrapped;
    });

    // 7. HANDLER DE RESET PREVENTIVO ULTRA AGRESSIVO COM FUNÇÃO MATEMÁTICA (SEM FIM)
    // Técnica: Reset preventivo ULTRA AGRESSIVO usando função matemática para garantir loop infinito SEM FIM
    // Reseta MUITO ANTES que os botões desapareçam da tela, garantindo visibilidade contínua ABSOLUTA
    // Os botões aparecem continuamente do outro lado, criando ilusão de voltas infinitas
    // Threshold aumentado para 20% para garantir reset MUITO antes dos botões desaparecerem
    // IMPORTANTE: Usa flag para prevenir loop infinito (x.set dentro de x.on('change') causa recursão)
    const isResettingRef = useRef<boolean>(false);
    
    useEffect(() => {
        if (contentWidth === 0) return;

        const unsubscribe = x.on('change', (latest: number): void => {
            // Previne loop infinito: se já está resetando, ignora o evento
            if (isResettingRef.current) return;
            
            // FUNÇÃO MATEMÁTICA DE RESET PREVENTIVO ULTRA AGRESSIVO:
            // Reseta quando se aproxima dos limites (20% do limite) para garantir visibilidade contínua ABSOLUTA
            // Threshold ULTRA AGRESSIVO de 20% para garantir reset MUITO antes dos botões desaparecerem
            // Isso previne ABSOLUTAMENTE que os botões desapareçam antes do reset acontecer
            
            // Calcula thresholds para reset preventivo ULTRA AGRESSIVO (20% do limite)
            const rightThreshold = contentWidth * 0.2; // 20% do limite para reset preventivo ultra agressivo (direita)
            const leftThreshold = -contentWidth * 0.2; // 20% do limite negativo para reset preventivo ultra agressivo (esquerda)
            
            // Loop infinito para a DIREITA: quando se aproxima do final de uma cópia (20% do limite)
            // Reseta preventivamente para o início da mesma cópia, fazendo botões aparecerem do outro lado (esquerda)
            // Como as cópias são idênticas, o reset é imperceptível - botões parecem dar voltas infinitas
            if (latest >= rightThreshold) {
                isResettingRef.current = true; // Marca que está resetando para prevenir loop
                const newX = latest - contentWidth;
                x.set(newX);
                lastDragX.current = newX;
                // Usa requestAnimationFrame para resetar a flag após o próximo frame
                requestAnimationFrame(() => {
                    isResettingRef.current = false;
                });
            }
            // Loop infinito para a ESQUERDA: quando se aproxima do início (20% do limite negativo)
            // Reseta preventivamente para o final da mesma cópia, fazendo botões aparecerem do outro lado (direita)
            // Como as cópias são idênticas, o reset é imperceptível - botões parecem dar voltas infinitas
            else if (latest <= leftThreshold) {
                isResettingRef.current = true; // Marca que está resetando para prevenir loop
                const newX = latest + contentWidth;
                x.set(newX);
                lastDragX.current = newX;
                // Usa requestAnimationFrame para resetar a flag após o próximo frame
                requestAnimationFrame(() => {
                    isResettingRef.current = false;
                });
            }
        });

        return () => unsubscribe();
    }, [x, contentWidth]);
    
    // 8. Inicialização com função matemática para garantir loop infinito desde o início
    // Começa no meio de uma cópia para permitir scroll infinito em ambas as direções
    // Como temos múltiplas cópias idênticas (5 cópias), começamos no meio para permitir voltas infinitas
    useEffect(() => {
        if (contentWidth > 0) {
            const currentX = x.get();
            // Se está na posição inicial (0), começa no meio de uma cópia usando função matemática
            // Isso permite que os botões deem voltas infinitas em ambas as direções desde o início
            // A função matemática garante que sempre haja espaço para scroll em ambas as direções
            if (currentX === 0) {
                // Calcula posição inicial no meio de uma cópia para permitir scroll infinito
                const initialX = -contentWidth / 2; // Começa no meio de uma cópia
                x.set(initialX);
                lastDragX.current = initialX;
            }
        }
    }, [contentWidth, x]);

    // 8.5. Centraliza botão ativo quando pathname muda (sem alterar loop infinito)
    // Usa a MESMA lógica que detecta quando um botão está no centro (onde ele fica grande)
    // Quando o usuário navega para uma nova tela, centraliza o botão correspondente no footer
    useEffect(() => {
        if (contentWidth === 0 || !containerRef.current || !contentRef.current) return;
        
        // Encontra o botão ativo baseado no pathname
        const activeItem = visibleItems.find(item => item.route === pathname);
        if (!activeItem) return;

        // Função matemática de módulo para loop infinito
        const mathMod = (value: number, modulus: number): number => {
            return ((value % modulus) + modulus) % modulus;
        };

        // Usa requestAnimationFrame para garantir que o DOM esteja atualizado antes de calcular
        const frameId = requestAnimationFrame(() => {
            if (!containerRef.current || !contentRef.current) return;

            // Encontra o primeiro botão ativo visível no DOM
            const allButtons = contentRef.current.querySelectorAll('[data-button-item]') as NodeListOf<HTMLElement>;
            let activeButtonElement: HTMLElement | null = null;
            
            for (const button of Array.from(allButtons)) {
                const buttonId = button.getAttribute('data-button-id');
                if (buttonId && buttonId.startsWith(activeItem.id)) {
                    activeButtonElement = button;
                    break;
                }
            }

            if (!activeButtonElement) return;

            // Usa a MESMA lógica que detecta quando um botão está no centro
            // (a mesma lógica que faz o botão crescer quando está no centro)
            const buttonRect = activeButtonElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Calcula o centro do botão em relação ao container (MESMA fórmula da detecção)
            const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
            
            // Centro fixo do container (MESMO valor usado na detecção)
            const fixedCenterX = containerRect.width / 2;
            
            // Calcula a diferença entre o centro do botão e o centro fixo
            // Se o botão está à direita do centro, deltaX é positivo
            // Se o botão está à esquerda do centro, deltaX é negativo
            const deltaX = buttonCenterX - fixedCenterX;
            
            // Posição X atual do conteúdo (raw, antes do wrappedX)
            const currentX = x.get();
            
            // Calcula nova posição: move o conteúdo pela diferença calculada
            // Se o botão está à direita do centro (deltaX positivo), move o conteúdo para a esquerda (x negativo)
            // Se o botão está à esquerda do centro (deltaX negativo), move o conteúdo para a direita (x positivo)
            const targetX = currentX - deltaX;

            // Normaliza para o range [-contentWidth, 0] usando módulo matemático
            // Isso garante que o loop infinito continue funcionando
            let normalizedX = mathMod(targetX, contentWidth);
            if (normalizedX > 0) {
                normalizedX = normalizedX - contentWidth;
            }
            if (normalizedX <= -contentWidth) {
                normalizedX = normalizedX + contentWidth;
            }

            // Ajusta para garantir que o botão fique visível usando offset de múltiplas cópias
            // Encontra a cópia mais próxima que mantenha o botão visível
            const currentNormalized = mathMod(currentX, contentWidth);
            let currentNormalizedFixed = currentNormalized;
            if (currentNormalizedFixed > 0) {
                currentNormalizedFixed = currentNormalizedFixed - contentWidth;
            }
            
            // Calcula offset necessário para manter o botão na mesma cópia relativa
            const offset = Math.round((currentNormalizedFixed - normalizedX) / contentWidth) * contentWidth;
            const finalX = normalizedX + offset;

            // Centraliza IMEDIATAMENTE sem animação (atualização instantânea)
            x.set(finalX);
            lastDragX.current = finalX;
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [pathname, contentWidth, visibleItems, x]);

    // 8. Renderiza ícone baseado no nome
    const renderIcon = (name: string, isActive: boolean): React.JSX.Element => {
        // Tamanho proporcional: 24px quando ativo (w-14 = 56px), 20px quando inativo (w-12 = 48px)
        const size = isActive ? 24 : 20; // Proporção: 24/56 ≈ 0.43, 20/48 ≈ 0.42 (mantém proporção)
        const props = { size, strokeWidth: 2.5 };
        
        const activeClass = "text-white";
        const inactiveClass = "text-[#5874f6]";

        switch (name) {
            case 'cart': 
                return <ShoppingCart {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            case 'heart': 
                return <Heart {...props} className={cn(isActive ? "fill-white text-white" : "fill-[#ff69b4] text-black")} />;
            case 'sync': 
                return <RefreshCw {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            case 'verified': 
                return <BadgeCheck {...props} className={cn(isActive ? "text-white fill-white/20" : "text-[#5874f6] fill-blue-100")} />;
            case 'package-check':
                return (
                    <div className="relative flex items-center justify-center">
                        <Package size={size} strokeWidth={2.5} className={cn(isActive ? activeClass : inactiveClass)} />
                        <div className={cn(
                            "absolute -top-2 -right-2 rounded-full w-4 h-4 flex items-center justify-center border-2", 
                            isActive ? "bg-white text-[#5874f6] border-[#5874f6]" : "bg-[#5874f6] text-white border-white"
                        )}>
                            <Check size={8} strokeWidth={4} />
                        </div>
                    </div>
                );
            case 'inventory': 
                return <Box {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            default: 
                return <HelpCircle {...props} className={cn(isActive ? activeClass : "text-gray-400")} />;
        }
    };

    // 9. Calcula qual botão está no CENTRO FIXO do footer
    // Lógica completamente igualitária: avalia TODOS os botões apenas pela distância física,
    // sem nenhuma preferência por ID, tipo ou qualquer outro atributo
    // REMOVIDO: Este useAnimationFrame não influencia mais a detecção individual
    // A detecção individual é completamente independente e baseada apenas em distância física

    // 10. Renderiza botão individual com escala dinâmica baseada no centro (TODOS os botões podem ficar grandes)
    const renderButton = (item: FooterItem, originalId: string): React.JSX.Element => {
        // REMOVIDO: Não usa mais centerButtonId para evitar qualquer viés
        const isHighlight = item.route === '/pos' || originalId === highlightItem?.id;
        // Verifica se este botão está ativo (rota atual corresponde ao pathname)
        const isActive = item.route === pathname;
        const transitionClass = "transition-all duration-75 ease-out";

        // Calcula se este botão específico está no centro FIXO (verifica TODOS os botões, não apenas os com isCenter)
        const buttonRef = useRef<HTMLDivElement>(null);
        const [isThisButtonCenter, setIsThisButtonCenter] = useState<boolean>(false);

        // Verifica se este botão específico está no centro FIXO
        // Lógica completamente independente e igualitária: calcula distância física pura
        // SEM TOLERÂNCIAS que possam causar preferência por qualquer botão específico
        useAnimationFrame(() => {
            if (!buttonRef.current || !containerRef.current || !contentRef.current) {
                setIsThisButtonCenter(false);
                return;
            }

            const buttonRect = buttonRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
            const fixedCenterX = containerRect.width / 2;
            const distance = Math.abs(buttonCenterX - fixedCenterX);
            
            // Threshold otimizado para detecção precisa do centro
            const CENTER_THRESHOLD = 75; // Balanceado: não muito restritivo, mas preciso o suficiente
            
            // Se está muito longe do centro, não é o centro
            if (distance >= CENTER_THRESHOLD) {
                setIsThisButtonCenter(false);
                return;
            }
            
            // Coleta TODOS os botões e calcula a distância de cada um
            const allButtons = contentRef.current.querySelectorAll('[data-button-item]') as NodeListOf<HTMLElement>;
            
            // Primeiro, encontra a melhor distância de cada botão original
            const bestDistancePerOriginal = new Map<string, number>();
            
            allButtons.forEach((otherButton) => {
                const otherButtonId = otherButton.getAttribute('data-button-id');
                if (otherButtonId) {
                    const otherOriginalIdMatch = otherButtonId.match(/^(.+?)(?:_loop_\d+_\d+)?$/);
                    const otherOriginalId = otherOriginalIdMatch ? otherOriginalIdMatch[1] : otherButtonId;
                    
                    const otherRect = otherButton.getBoundingClientRect();
                    const otherCenterX = otherRect.left - containerRect.left + otherRect.width / 2;
                    const otherDistance = Math.abs(otherCenterX - fixedCenterX);
                    
                    // Mantém apenas a menor distância de cada botão original
                    const existing = bestDistancePerOriginal.get(otherOriginalId);
                    if (existing === undefined || otherDistance < existing) {
                        bestDistancePerOriginal.set(otherOriginalId, otherDistance);
                    }
                }
            });
            
            // Encontra a menor distância entre TODOS os botões originais
            let globalMinDistance = Infinity;
            bestDistancePerOriginal.forEach((dist) => {
                if (dist < globalMinDistance) {
                    globalMinDistance = dist;
                }
            });
            
            // Se não há nenhum botão próximo do centro, não fica grande
            if (globalMinDistance >= CENTER_THRESHOLD) {
                setIsThisButtonCenter(false);
                return;
            }
            
            // Verifica se esta instância específica é a melhor deste botão original
            const thisButtonBestDistance = bestDistancePerOriginal.get(originalId);
            if (thisButtonBestDistance === undefined) {
                setIsThisButtonCenter(false);
                return;
            }
            
            // Tolerância precisa para garantir detecção consistente e evitar múltiplos botões grandes
            const TOLERANCE = 1.5; // Tolerância balanceada para evitar flickering mas garantir precisão
            
            // Verifica se esta instância específica é realmente a melhor deste botão original
            const isThisInstanceBest = Math.abs(distance - thisButtonBestDistance) < TOLERANCE;
            
            // Verifica se este botão original é o mais próximo do centro globalmente
            // IMPORTANTE: Usa comparação estrita para garantir que apenas o MAIS próximo fique grande
            const isClosest = Math.abs(thisButtonBestDistance - globalMinDistance) < TOLERANCE;
            
            // Verifica se há outros botões com a mesma distância mínima (empate)
            // Em caso de empate, garante que apenas um fique grande usando ordem determinística
            let isUniqueClosest = true;
            let tieCount = 0;
            bestDistancePerOriginal.forEach((dist, otherOriginalId) => {
                if (Math.abs(dist - globalMinDistance) < TOLERANCE) {
                    tieCount++;
                    // Se há empate e outro botão vem antes na ordem alfabética, este não é único
                    if (otherOriginalId !== originalId && otherOriginalId < originalId) {
                        isUniqueClosest = false;
                    }
                }
            });
            
            // Só fica grande se:
            // 1. Está próximo do centro fixo (dentro do threshold)
            // 2. Esta é a melhor instância deste botão original
            // 3. Este botão original é o mais próximo do centro
            // 4. É único ou o primeiro em caso de empate (garante apenas um botão grande)
            setIsThisButtonCenter(
                distance < CENTER_THRESHOLD && 
                isThisInstanceBest && 
                isClosest && 
                (tieCount === 1 || isUniqueClosest)
            );
        });

        const buttonContent = (
            <motion.div
                ref={buttonRef}
                data-button-item
                data-button-id={item.id}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                animate={{
                    // REMOVIDO scale para evitar inconsistências - usa apenas tamanho fixo via className
                }}
                transition={{
                    type: 'spring',
                    stiffness: 1000, // Aumentado para resposta ultra rápida
                    damping: 35, // Balanceado para animação suave mas muito rápida
                    mass: 0.2 // Reduzido para resposta quase instantânea
                }}
                className={cn(
                    "flex items-center justify-center shadow-xl rounded-full border-4 shrink-0",
                    "select-none touch-none",
                    transitionClass,
                    // Tamanho consistente: w-14 h-14 (56px) quando no centro, proporcional ao tamanho normal
                    isThisButtonCenter 
                        ? "w-14 h-14 -mt-5 mb-3.5 border-white ring-4 ring-[#5874f6]/20 z-20" // w-14 h-14 (56px) - tamanho reduzido e consistente
                        : "w-12 h-12 mt-4 mb-3 border-transparent bg-white z-10", // w-12 h-12 (48px) - tamanho normal
                    isThisButtonCenter ? "bg-[#5874f6]" : "bg-white",
                    // Destaque amarelo leve para botão ativo (tela atual)
                    isActive && !isThisButtonCenter && "ring-2 ring-pink-400/50 border-pink-400/30 bg-pink-50",
                    isActive && isThisButtonCenter && "ring-4 ring-pink-400/40 border-pink-400/50",
                    // Destaque visual para botão Caixa/PDV (apenas se não for ativo)
                    isHighlight && !isActive && !isThisButtonCenter && "ring-2 ring-[#5874f6]/30 border-[#5874f6]/50",
                    // Feedback visual de toque
                    "active:scale-90 active:opacity-80"
                )}
            >
                {renderIcon(item.icon, isThisButtonCenter)}
            </motion.div>
        );

                    if (item.route) {
                        return (
                            <Link
                                href={item.route}
                                prefetch={true} 
                                className={cn(
                                    "shrink-0",
                                    "min-w-[48px] min-h-[48px]",
                                    "flex items-center justify-center",
                                    "touch-none select-none",
                                    "relative z-30"
                                )}
                                style={{ 
                                    touchAction: 'pan-x pan-y',
                                    WebkitTapHighlightColor: 'transparent',
                                    pointerEvents: 'auto'
                                }}
                                onPointerDown={(e) => {
                                    // Permite drag: não previne propagação completamente
                                    // Apenas armazena posição inicial para detectar se é drag ou clique
                                    if (dragStartPosition.current === null) {
                                        dragStartPosition.current = { x: e.clientX, y: e.clientY };
                                    }
                                }}
                                onClick={(e) => {
                                    // Só navega se não houve drag significativo
                                    if (isDragging.current) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                {buttonContent}
                            </Link>
                        );
                    }

                    return (
                        <div
                            className={cn(
                                "shrink-0",
                                "min-w-[48px] min-h-[48px]",
                                "flex items-center justify-center",
                                "touch-none select-none",
                                "relative z-30"
                            )}
                            style={{ 
                                touchAction: 'pan-x pan-y',
                                WebkitTapHighlightColor: 'transparent',
                                pointerEvents: 'auto'
                            }}
                            onPointerDown={(e) => {
                                // Permite drag: não previne propagação completamente
                                // Apenas armazena posição inicial para detectar se é drag ou clique
                                if (dragStartPosition.current === null) {
                                    dragStartPosition.current = { x: e.clientX, y: e.clientY };
                                }
                            }}
                        >
                            {buttonContent}
                        </div>
                    );
    };

    // 10. Extrai ID original do item duplicado
    const getOriginalId = (duplicatedId: string): string => {
        const match = duplicatedId.match(/^(.+?)_loop_\d+_\d+$/);
        return match ? match[1] : duplicatedId;
    };

    // 11. Física de corrente REMOVIDA para permitir movimento completamente livre
    // Os botões agora se movem livremente sem nenhuma interferência física durante o drag

    return (
        <div 
            ref={containerRef}
            className="w-full relative h-[80px] flex items-end pointer-events-none overflow-hidden"
            style={{ touchAction: 'pan-y' }}
        >
            {/* BARRA DE FUNDO */}
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pointer-events-auto"
                style={{ backgroundColor: style.bgColor || '#5874f6' }}
            />

            {/* CONTAINER DE DRAG (Infinite Carousel) */}
            <motion.div
                ref={contentRef}
                drag="x"
                dragElastic={0}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
                dragPropagation={true}
                onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
                    // Armazena posição inicial para detectar se é drag ou clique
                    dragStartPosition.current = { x: event.clientX, y: event.clientY };
                    isDragging.current = false;
                }}
                onDragStart={(event, info) => {
                    // Permite drag em qualquer área, incluindo botões
                    // Verifica se é um movimento horizontal significativo
                    if (dragStartPosition.current && 'clientX' in event) {
                        const pointerEvent = event as PointerEvent;
                        const deltaX = Math.abs(pointerEvent.clientX - dragStartPosition.current.x);
                        const deltaY = Math.abs(pointerEvent.clientY - dragStartPosition.current.y);
                        
                        // Inicia drag se movimento horizontal for maior que vertical e significativo
                        if (deltaX > deltaY && deltaX > 5) {
                            isDragging.current = true;
                            dragStartX.current = x.get();
                        } else {
                            isDragging.current = false;
                        }
                    } else {
                        isDragging.current = true;
                        dragStartX.current = x.get();
                    }
                }}
                onDrag={(event, info) => {
                    if (!isDragging.current) return;
                    
                    // Atualiza o motion value com o delta do drag
                    // Permite drag em qualquer área, incluindo botões
                    const newX = dragStartX.current + info.offset.x;
                    x.set(newX);
                    
                    // Detecta direção do drag
                    const currentX = x.get();
                    const deltaX = currentX - lastDragX.current;
                    if (Math.abs(deltaX) > 0.5) {
                        dragDirection.current = deltaX > 0 ? 1 : -1;
                    }
                    lastDragX.current = currentX;
                }}
                onDragEnd={() => {
                    isDragging.current = false;
                    dragStartPosition.current = null;
                    dragDirection.current = 0;
                    lastDragX.current = x.get();
                }}
                style={{ 
                    x: wrappedX,
                    touchAction: 'pan-x pan-y'
                }}
                className={cn(
                    "relative z-10 flex items-end h-full px-2 pointer-events-auto",
                    "gap-3 sm:gap-4",
                    "cursor-grab active:cursor-grabbing",
                    "select-none"
                )}
            >
                {duplicatedItems.map((item) => {
                    const originalId = getOriginalId(item.id);
                    return (
                        <React.Fragment key={item.id}>
                            {renderButton(item, originalId)}
                        </React.Fragment>
                    );
                })}
            </motion.div>
        </div>
    );
};

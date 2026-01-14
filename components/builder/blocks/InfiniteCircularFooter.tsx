// components/builder/blocks/InfiniteCircularFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockComponentProps } from '@/types/builder';
import { InfiniteCircularFooterDataSchema, CircularFooterButton } from '@/types/footer';
import { registerFooterUsageAction } from '@/app/actions/footer-actions';

/**
 * InfiniteCircularFooter: Apple Watch Infinite Footer
 * 
 * Componente de rodapé circular infinito com efeito fisheye scaling.
 * Implementa loop infinito, long press navigation e física fluida.
 * 
 * Features:
 * - Loop infinito com triplicação de array
 * - Fisheye scaling: centro scale 1.3, bordas scale 0.7
 * - Opacity dinâmica: centro 1, bordas 0.4
 * - Long press + drag para navegação Caixa (/pos)
 * - Teletransporte invisível nas bordas
 * - useMotionValue para scroll contínuo sem gaps
 */
const InfiniteCircularFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Estados para long press
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
    const isLongPressingRef = useRef<boolean>(false);
    const [isLongPressActive, setIsLongPressActive] = useState<boolean>(false);
    
    // Motion values
    const x = useMotionValue(0);
    const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
    const xSpring = useSpring(x, springConfig);
    
    // Estados para dimensões
    const [itemWidth, setItemWidth] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [contentWidth, setContentWidth] = useState<number>(0);

    // Validação via Zod
    const validationResult = InfiniteCircularFooterDataSchema.safeParse(config.data);
    
    if (!validationResult.success) {
        return (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
                [LEGO_ERR]: {validationResult.error.issues[0]?.message ?? 'Erro de validação'}
            </div>
        );
    }

    const {
        buttons,
        enableLongPressNavigation,
        longPressThreshold,
        backgroundColor,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity
    } = validationResult.data;

    // 1. Triplica array para loop infinito
    const triplicatedButtons = useMemo(() => {
        const triplicated: Array<CircularFooterButton & { cloneIndex: number; originalIndex: number }> = [];
        for (let cloneIndex = 0; cloneIndex < 3; cloneIndex++) {
            buttons.forEach((button, originalIndex) => {
                triplicated.push({
                    ...button,
                    id: `${button.id}_clone_${cloneIndex}`,
                    cloneIndex,
                    originalIndex
                });
            });
        }
        return triplicated;
    }, [buttons]);

    // 2. Calcula dimensões dinamicamente
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current || !contentRef.current || triplicatedButtons.length === 0) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);

            const firstButton = contentRef.current.querySelector('[data-circular-button]') as HTMLElement;
            if (firstButton) {
                const buttonRect = firstButton.getBoundingClientRect();
                const gap = 16; // gap-4 = 16px
                const calculatedItemWidth = buttonRect.width + gap;
                setItemWidth(calculatedItemWidth);
                
                // Largura de uma cópia completa
                const singleSetWidth = buttons.length * calculatedItemWidth;
                setContentWidth(singleSetWidth);
            }
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        const timeoutId = setTimeout(calculateDimensions, 100);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            clearTimeout(timeoutId);
        };
    }, [buttons.length, triplicatedButtons.length]);

    // 3. Transform com módulo para loop infinito
    const wrappedX = useTransform(xSpring, (latestX) => {
        if (contentWidth === 0) return latestX;
        
        let wrapped = latestX % contentWidth;
        if (wrapped > 0) {
            wrapped = wrapped - contentWidth;
        }
        
        return wrapped;
    });

    // 4. Reset suave quando excede limites
    useEffect(() => {
        if (contentWidth === 0) return;

        const unsubscribe = xSpring.on('change', (latest) => {
            if (latest > contentWidth * 2) {
                x.set(latest - contentWidth * 2);
            } else if (latest < -contentWidth * 2) {
                x.set(latest + contentWidth * 2);
            }
        });

        return () => unsubscribe();
    }, [x, xSpring, contentWidth]);

    // 5. Mapeamento de ícones Lucide
    const iconMap: Record<string, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        default: HelpCircle
    };

    // 6. Renderiza ícone
    const renderIcon = (iconName: string, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap.default;
        const color = buttonColor ?? '#5874f6';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    };

    // 7. Helper para calcular transform baseado na posição (Fisheye Effect)
    const calculateTransform = (buttonIndex: number, scrollX: number): { scale: number; opacity: number } => {
        if (contentWidth === 0 || containerWidth === 0 || itemWidth === 0) {
            return { scale: centerScale, opacity: centerOpacity };
        }

        const buttonBasePosition = buttonIndex * itemWidth;
        const centerX = containerWidth / 2;
        const buttonCenterX = buttonBasePosition + scrollX + (itemWidth / 2);
        const distanceFromCenter = Math.abs(buttonCenterX - centerX);
        const maxDistance = containerWidth / 2;
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
        
        const calculatedScale = centerScale - (normalizedDistance * (centerScale - edgeScale));
        const calculatedOpacity = centerOpacity - (normalizedDistance * (centerOpacity - edgeOpacity));
        
        return {
            scale: Math.max(edgeScale, Math.min(centerScale, calculatedScale)),
            opacity: Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity))
        };
    };

    // 8. Handlers para long press navigation
    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
        if (!enableLongPressNavigation) return;
        
        dragStartPositionRef.current = { x: event.clientX, y: event.clientY };
        isLongPressingRef.current = false;
        
        longPressTimerRef.current = setTimeout(() => {
            isLongPressingRef.current = true;
            setIsLongPressActive(true);
        }, 500); // 500ms para long press
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
        if (!dragStartPositionRef.current || !enableLongPressNavigation) return;
        
        const deltaX = Math.abs(event.clientX - dragStartPositionRef.current.x);
        const deltaY = Math.abs(event.clientY - dragStartPositionRef.current.y);
        
        // Se moveu muito, cancela long press
        if (deltaX > 10 || deltaY > 10) {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            isLongPressingRef.current = false;
            setIsLongPressActive(false);
        }
    };

    const handlePointerUp = (): void => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        
        setIsLongPressActive(false);
    };

    const handleDragEnd = (event: PointerEvent, info: { offset: { x: number; y: number } }): void => {
        if (!enableLongPressNavigation || !isLongPressingRef.current) return;
        
        const deltaX = Math.abs(info.offset.x);
        const deltaY = Math.abs(info.offset.y);
        
        // Se arrastou além do threshold, navega para /pos
        if (deltaX > longPressThreshold || deltaY > longPressThreshold) {
            registerFooterUsageAction({
                buttonId: 'long_press_caixa',
                buttonLabel: 'Navegação Caixa via Long Press',
                route: '/pos',
                interactionType: 'long_press'
            }).catch(console.error);
            
            router.push('/pos');
            
            // Feedback visual de snap
            animate(x, x.get() + (deltaX > 0 ? 50 : -50), {
                type: 'spring',
                stiffness: 400,
                damping: 25
            }).then(() => {
                animate(x, x.get() - (deltaX > 0 ? 50 : -50), {
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                });
            });
        }
        
        isLongPressingRef.current = false;
        setIsLongPressActive(false);
    };

    // 9. Componente de botão individual com fisheye effect
    // Criado como componente separado para permitir uso de hooks
    const ButtonItem: React.FC<{
        button: CircularFooterButton & { cloneIndex: number; originalIndex: number };
        index: number;
        xSpring: ReturnType<typeof useSpring>;
        itemWidth: number;
        containerWidth: number;
        centerScale: number;
        edgeScale: number;
        centerOpacity: number;
        edgeOpacity: number;
        isLongPressActive: boolean;
        buttons: CircularFooterButton[];
        pathname: string;
    }> = ({
        button,
        index,
        xSpring,
        itemWidth,
        containerWidth,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity,
        isLongPressActive,
        buttons,
        pathname
    }) => {
        const originalButton = buttons[button.originalIndex];
        const isActive = originalButton.route === pathname;
        
        // Cria transforms dinâmicos para este botão específico
        const buttonBasePosition = index * itemWidth;
        
        const buttonScale = useTransform(xSpring, (latestX) => {
            if (containerWidth === 0 || itemWidth === 0) {
                return centerScale;
            }
            const centerX = containerWidth / 2;
            const buttonCenterX = buttonBasePosition + latestX + (itemWidth / 2);
            const distanceFromCenter = Math.abs(buttonCenterX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedScale = centerScale - (normalizedDistance * (centerScale - edgeScale));
            return Math.max(edgeScale, Math.min(centerScale, calculatedScale));
        });
        
        const buttonOpacity = useTransform(xSpring, (latestX) => {
            if (containerWidth === 0 || itemWidth === 0) {
                return centerOpacity;
            }
            const centerX = containerWidth / 2;
            const buttonCenterX = buttonBasePosition + latestX + (itemWidth / 2);
            const distanceFromCenter = Math.abs(buttonCenterX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedOpacity = centerOpacity - (normalizedDistance * (centerOpacity - edgeOpacity));
            return Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity));
        });

        const buttonContent = (
            <motion.div
                data-circular-button
                style={{
                    scale: buttonScale,
                    opacity: buttonOpacity
                }}
                className={cn(
                    "flex items-center justify-center rounded-full shadow-xl border-2 flex-shrink-0",
                    "w-14 h-14",
                    "transition-colors duration-200",
                    isActive 
                        ? "bg-[#5874f6] border-white ring-4 ring-[#5874f6]/20" 
                        : "bg-white border-gray-200",
                    isLongPressActive && "ring-4 ring-yellow-400/50 border-yellow-400"
                )}
            >
                {renderIcon(originalButton.icon, originalButton.color)}
            </motion.div>
        );

        if (originalButton.route) {
            return (
                <Link
                    key={button.id}
                    href={originalButton.route}
                    prefetch={true}
                    className="flex-shrink-0 touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                    onClick={async () => {
                        await registerFooterUsageAction({
                            buttonId: originalButton.id,
                            buttonLabel: originalButton.label,
                            route: originalButton.route,
                            interactionType: 'click'
                        });
                    }}
                >
                    {buttonContent}
                </Link>
            );
        }

        return (
            <div
                key={button.id}
                className="flex-shrink-0 touch-manipulation"
                style={{ touchAction: 'manipulation' }}
            >
                {buttonContent}
            </div>
        );
    };

    // 10. Renderiza botão wrapper
    const renderButton = (
        button: CircularFooterButton & { cloneIndex: number; originalIndex: number },
        index: number
    ): React.JSX.Element => {
        return (
            <ButtonItem
                key={button.id}
                button={button}
                index={index}
                xSpring={xSpring}
                itemWidth={itemWidth}
                containerWidth={containerWidth}
                centerScale={centerScale}
                edgeScale={edgeScale}
                centerOpacity={centerOpacity}
                edgeOpacity={edgeOpacity}
                isLongPressActive={isLongPressActive}
                buttons={buttons}
                pathname={pathname}
            />
        );
    };

    return (
        <div
            ref={containerRef}
            className="w-full relative h-[80px] flex items-end pointer-events-none overflow-hidden"
            style={{ 
                backgroundColor: backgroundColor ?? '#5874f6',
                touchAction: 'pan-y'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* BARRA DE FUNDO */}
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pointer-events-auto"
                style={{ backgroundColor: backgroundColor ?? '#5874f6' }}
            />

            {/* CONTAINER DE DRAG (Infinite Circular Carousel) */}
            <motion.div
                ref={contentRef}
                drag="x"
                dragElastic={0}
                dragMomentum={true}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                onDragEnd={handleDragEnd}
                style={{ 
                    x: wrappedX,
                    touchAction: 'pan-x pan-y'
                }}
                className={cn(
                    "relative z-10 flex items-end h-full px-4 pointer-events-auto",
                    "gap-4",
                    "cursor-grab active:cursor-grabbing",
                    "select-none"
                )}
            >
                {triplicatedButtons.map((button, index) => renderButton(button, index))}
            </motion.div>
        </div>
    );
};

/**
 * Exportação do componente
 */
export const InfiniteCircularFooter = InfiniteCircularFooterBase;

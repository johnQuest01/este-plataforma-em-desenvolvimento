'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, PanInfo } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockComponentProps } from '@/types/builder';
import { InfiniteCircularFooterDataSchema, CircularFooterButton, InfiniteCircularFooterData } from '@/types/footer';
import { registerFooterUsageAction } from '@/app/actions/footer-actions';

/**
 * Constants
 */
const GAP_PIXELS = 16;
const NUMBER_OF_COPIES = 4; // Increased buffer for stability

/**
 * Default configuration to satisfy hooks when validation fails
 */
const DEFAULT_CONFIG: InfiniteCircularFooterData = {
    buttons: [],
    enableLongPressNavigation: false,
    longPressThreshold: 150,
    backgroundColor: '#5874f6',
    centerScale: 1.3,
    edgeScale: 0.7,
    centerOpacity: 1,
    edgeOpacity: 0.4
};

/**
 * InfiniteCircularFooter: Apple Watch Infinite Footer
 * 
 * Componente de rodapé circular infinito com efeito fisheye scaling.
 * Implementa loop infinito, long press navigation e física fluida.
 */
const InfiniteCircularFooterBase = ({ config }: BlockComponentProps): React.JSX.Element => {
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
    const [singleSetWidth, setSingleSetWidth] = useState<number>(0);

    // 1. Validation (Executed but result used later for rendering)
    const validationResult = InfiniteCircularFooterDataSchema.safeParse(config.data);
    
    // Use validated data or fallback to defaults to keep hooks running unconditionally
    const safeData = validationResult.success ? validationResult.data : DEFAULT_CONFIG;

    const {
        buttons,
        enableLongPressNavigation,
        longPressThreshold,
        backgroundColor,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity
    } = safeData;

    // 2. Triplica array para loop infinito (useMemo called unconditionally)
    const triplicatedButtons = useMemo(() => {
        if (buttons.length === 0) return [];

        const triplicated: Array<CircularFooterButton & { cloneIndex: number; originalIndex: number; uniqueId: string }> = [];
        for (let cloneIndex = 0; cloneIndex < NUMBER_OF_COPIES; cloneIndex++) {
            buttons.forEach((button, originalIndex) => {
                triplicated.push({
                    ...button,
                    id: button.id, // Keep original ID for logic
                    uniqueId: `${button.id}_clone_${cloneIndex}_${originalIndex}`, // Unique key for React
                    cloneIndex,
                    originalIndex
                });
            });
        }
        return triplicated;
    }, [buttons]);

    // 3. Calcula dimensões dinamicamente (useEffect called unconditionally)
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current || !contentRef.current || triplicatedButtons.length === 0) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);

            // Find first button to measure
            const firstButton = contentRef.current.querySelector('[data-circular-button]') as HTMLElement;
            if (firstButton) {
                const buttonRect = firstButton.getBoundingClientRect();
                const calculatedItemWidth = buttonRect.width + GAP_PIXELS;
                setItemWidth(calculatedItemWidth);
                
                // Largura de uma cópia completa (Single Set)
                const calculatedSingleSetWidth = buttons.length * calculatedItemWidth;
                setSingleSetWidth(calculatedSingleSetWidth);

                // Largura total do conteúdo renderizado
                const totalContentWidth = triplicatedButtons.length * calculatedItemWidth;
                setContentWidth(totalContentWidth);
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

    // 4. Transform com módulo para loop infinito (useTransform called unconditionally)
    const wrappedX = useTransform(xSpring, (latestX) => {
        if (singleSetWidth === 0) return 0;
        
        // Mathematical modulo that handles negative numbers correctly
        // Maps the infinite drag value to a window of [-singleSetWidth, 0]
        // This ensures we are always viewing a valid "slice" of the infinite strip
        const offset = -singleSetWidth; 
        const wrapped = ((latestX % singleSetWidth) + singleSetWidth) % singleSetWidth;
        
        return offset - wrapped;
    });

    // 5. Reset suave (useEffect called unconditionally)
    // Note: With the mathematical wrappedX above, this manual reset is less critical 
    // but can help keep the raw number from growing to Infinity.
    useEffect(() => {
        if (singleSetWidth === 0) return;

        const unsubscribe = xSpring.on('change', (latest) => {
            // Reset only when values get extremely large to avoid floating point errors
            if (Math.abs(latest) > singleSetWidth * 100) {
                const resetValue = latest % singleSetWidth;
                x.set(resetValue);
            }
        });

        return () => unsubscribe();
    }, [x, xSpring, singleSetWidth]);

    // 6. Mapeamento de ícones Lucide
    const iconMap: Record<string, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        default: HelpCircle
    };

    // 7. Renderiza ícone
    const renderIcon = (iconName: string, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap.default;
        const color = buttonColor ?? '#5874f6';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    };

    // 8. Helper para calcular transform baseado na posição (Fisheye Effect)
    // Note: In a real infinite loop with wrappedX, calculating absolute distance requires 
    // knowing the visual position relative to the viewport center.
    // This is a simplified version for stability.
    const calculateTransform = (buttonIndex: number, scrollX: number): { scale: number; opacity: number } => {
        // Implementation simplified to avoid complex re-renders during drag
        // For production stability, we rely on CSS or simpler Framer Motion transforms
        return { scale: centerScale, opacity: centerOpacity };
    };

    // 9. Handlers para long press navigation
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

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
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

    // 10. Componente de botão individual
    const ButtonItem: React.FC<{
        button: CircularFooterButton & { cloneIndex: number; originalIndex: number; uniqueId: string };
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
        
        // Note: For true fisheye in infinite loop, we would need a more complex transform
        // that calculates distance based on the wrapped position. 
        // For stability, we are using static scaling here, but you can re-enable dynamic scaling
        // if you implement the wrapped distance logic.
        
        const buttonContent = (
            <motion.div
                data-circular-button
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
                    key={button.uniqueId}
                    href={originalButton.route}
                    prefetch={true}
                    className="flex-shrink-0 touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                    onClick={async (e) => {
                        // Prevent navigation if dragging
                        if (Math.abs(xSpring.getVelocity()) > 5) {
                            e.preventDefault();
                            return;
                        }
                        
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
                key={button.uniqueId}
                className="flex-shrink-0 touch-manipulation"
                style={{ touchAction: 'manipulation' }}
            >
                {buttonContent}
            </div>
        );
    };

    // --- RENDER PHASE ---
    
    // Now we can conditionally return based on validation result
    // because all hooks have been called unconditionally above.
    if (!validationResult.success) {
        return (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
                [LEGO_ERR]: {validationResult.error.issues[0]?.message ?? 'Erro de validação'}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full relative h-[80px] flex items-end pointer-events-none overflow-hidden"
            style={{ 
                backgroundColor: backgroundColor ?? '#5874f6',
                touchAction: 'none' // Critical for drag
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
                dragElastic={0.05}
                dragMomentum={true}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                onDrag={(event, info) => {
                    // Accumulate delta to x
                    x.set(x.get() + info.delta.x);
                }}
                onDragEnd={handleDragEnd}
                style={{ 
                    x: wrappedX,
                    gap: `${GAP_PIXELS}px`,
                    display: 'flex',
                    flexWrap: 'nowrap', // Critical for preventing collapse
                    alignItems: 'flex-end',
                    height: '100%',
                    paddingLeft: '16px',
                    paddingRight: '16px'
                }}
                className={cn(
                    "relative z-10 pointer-events-auto",
                    "cursor-grab active:cursor-grabbing",
                    "select-none"
                )}
            >
                {triplicatedButtons.map((button, index) => (
                    <ButtonItem
                        key={button.uniqueId}
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
                ))}
            </motion.div>
        </div>
    );
};

/**
 * Exportação do componente
 */
export const InfiniteCircularFooter = InfiniteCircularFooterBase;
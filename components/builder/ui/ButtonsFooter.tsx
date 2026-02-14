// components/builder/ui/ButtonsFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { usePathname } from 'next/navigation';
import Link from 'next/link'; 
import { FooterItem, BlockStyle } from '@/types/builder';

// ========================================
// TYPES & INTERFACES
// ========================================

interface ButtonsFooterProps {
    items: FooterItem[];
    style: BlockStyle;
}

interface FooterButtonProps {
    item: FooterItem;
    index: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
    pathname: string;
    isHighlight: boolean;
}

type IconName = FooterItem['icon'];

// ========================================
// CONSTANTS
// ========================================

const GAP_WIDTH = 8; // gap-2 = 8px in Tailwind (antes era 16px)
const STRICT_THRESHOLD = 30; // Distance in pixels to be considered "centered"

// ========================================
// ICON RENDERING HELPER
// ========================================

const renderIcon = (name: IconName, isActiveState: boolean): React.JSX.Element => {
    const size = 24;
    const props = { size, strokeWidth: 2.5 };
    const activeClass = "text-white";
    const inactiveClass = "text-[#5874f6]";

    switch (name) {
        case 'cart':
            return <ShoppingCart {...props} className={cn(isActiveState ? activeClass : inactiveClass)} />;
        case 'heart':
            return <Heart {...props} className={cn(isActiveState ? "fill-white text-white" : "fill-[#ff69b4] text-black")} />;
        case 'sync':
            return <RefreshCw {...props} className={cn(isActiveState ? activeClass : inactiveClass)} />;
        case 'verified':
            return <BadgeCheck {...props} className={cn(isActiveState ? "text-white fill-white/20" : "text-[#5874f6] fill-blue-100")} />;
        case 'package-check':
            return (
                <div className="relative flex items-center justify-center">
                    <Package size={size} strokeWidth={2.5} className={cn(isActiveState ? activeClass : inactiveClass)} />
                    <div className={cn(
                        "absolute -top-2 -right-2 rounded-full w-4 h-4 flex items-center justify-center border-2", 
                        isActiveState ? "bg-white text-[#5874f6] border-[#5874f6]" : "bg-[#5874f6] text-white border-white"
                    )}>
                        <Check size={8} strokeWidth={4} />
                    </div>
                </div>
            );
        case 'inventory': 
            return <Box {...props} className={cn(isActiveState ? activeClass : inactiveClass)} />;
        default: 
            return <HelpCircle {...props} className={cn(isActiveState ? activeClass : "text-gray-400")} />;
    }
};

// ========================================
// SUB-COMPONENT: FOOTER BUTTON
// ========================================

const FooterButton = ({ 
    item, 
    index,
    containerRef,
    pathname,
    isHighlight
}: FooterButtonProps): React.JSX.Element => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isCenter, setIsCenter] = useState<boolean>(false);
    
    const isActive = item.route === pathname;
    const transitionClass = "transition-all duration-100 ease-out";

    // Apple-style Magnification Effect - APENAS UM BOTÃO
    useAnimationFrame(() => {
        if (!buttonRef.current || !containerRef.current) {
            setIsCenter(false);
            return;
        }

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate button center relative to container
        const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
        const containerCenterX = containerRect.width / 2;
        const distanceFromCenter = Math.abs(buttonCenterX - containerCenterX);
        
        // Early return se está longe
        if (distanceFromCenter >= STRICT_THRESHOLD) {
            setIsCenter(false);
            return;
        }

        // Buscar o botão MAIS PRÓXIMO do centro
        const allButtons = containerRef.current.querySelectorAll('[data-button-item]');
        let closestDistance = Infinity;
        let closestButton: Element | null = null;

        allButtons.forEach((btn) => {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left - containerRect.left + rect.width / 2;
            const dist = Math.abs(btnCenterX - containerCenterX);
            
            if (dist < closestDistance) {
                closestDistance = dist;
                closestButton = btn;
            }
        });

        // Apenas o botão MAIS PRÓXIMO fica em destaque (mas sem scale)
        const isThisButtonClosest = closestButton === buttonRef.current;
        setIsCenter(isThisButtonClosest);
    });

    const buttonContent = (
        <motion.div
            ref={buttonRef}
            data-button-item
            data-button-id={item.id}
            whileTap={{ scale: 0.9 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25
            }}
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)',
                WebkitTransform: 'translate3d(0, 0, 0)'
            }}
            className={cn(
                "flex items-center justify-center shadow-xl rounded-full border-4 shrink-0",
                "w-14 h-14",
                "select-none touch-none",
                transitionClass,
                // Botão ativo (rota atual) = destaque colorido
                isActive 
                    ? "bg-[#5874f6] border-white ring-4 ring-pink-400/60 z-20" 
                    : "bg-white border-transparent z-10",
                // Highlight especial (ex: /pos)
                isHighlight && !isActive && "ring-2 ring-[#5874f6]/30 border-[#5874f6]/50",
                "active:scale-90 active:opacity-80"
            )}
        >
            {renderIcon(item.icon, isActive)}
        </motion.div>
    );

    if (item.route) {
        return (
            <Link
                href={item.route}
                prefetch={true} 
                className={cn(
                    "shrink-0 flex items-center justify-center",
                    "min-w-[56px] min-h-[56px]",
                    "touch-none select-none relative z-30"
                )}
                style={{ 
                    touchAction: 'pan-x pan-y',
                    WebkitTapHighlightColor: 'transparent',
                    pointerEvents: 'auto'
                }}
            >
                {buttonContent}
            </Link>
        );
    }

    return (
        <div
            className={cn(
                "shrink-0 flex items-center justify-center",
                "min-w-[56px] min-h-[56px]",
                "touch-none select-none relative z-30"
            )}
            style={{ 
                touchAction: 'pan-x pan-y',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto'
            }}
        >
            {buttonContent}
        </div>
    );
};

// ========================================
// MAIN COMPONENT: BOUNDED SCROLL
// ========================================

export const ButtonsFooter = ({ items, style }: ButtonsFooterProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Motion state
    const x = useMotionValue(0);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
    
    // Drag state
    const isDragging = useRef<boolean>(false);
    const dragStartX = useRef<number>(0);

    // ========================================
    // STEP 1: Filter visible items
    // ========================================
    const visibleItems = useMemo<FooterItem[]>(() => {
        return items.filter(item => item.isVisible);
    }, [items]);

    const highlightItem = useMemo<FooterItem | undefined>(() => {
        return visibleItems.find(item => item.route === '/pos' || item.isHighlight);
    }, [visibleItems]);

    // ========================================
    // STEP 2: Calculate dimensions and constraints
    // ========================================
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!contentRef.current || !containerRef.current || visibleItems.length === 0) return;

            const firstButton = contentRef.current.querySelector('[data-button-item]') as HTMLElement;
            if (!firstButton) return;

            const buttonRect = firstButton.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const itemWidth = buttonRect.width + GAP_WIDTH;
            const totalContentWidth = visibleItems.length * itemWidth;
            const viewportWidth = containerRect.width;

            setContentWidth(totalContentWidth);
            setContainerWidth(viewportWidth);

            // Calcular limites de drag
            // left (max scroll esquerda) = -(contentWidth - containerWidth)
            // right (max scroll direita) = 0
            const maxScrollLeft = -(totalContentWidth - viewportWidth);
            const maxScrollRight = 0;

            setDragConstraints({
                left: maxScrollLeft < 0 ? maxScrollLeft : 0,
                right: maxScrollRight
            });

            // Centralizar primeiro botão ativo ou primeiro botão
            const activeIndex = visibleItems.findIndex(item => item.route === pathname);
            const targetIndex = activeIndex >= 0 ? activeIndex : 0;
            const targetPosition = -(targetIndex * itemWidth) + (viewportWidth / 2) - (buttonRect.width / 2);
            
            // Limitar posição inicial dentro dos constraints
            const clampedPosition = Math.max(maxScrollLeft, Math.min(maxScrollRight, targetPosition));
            x.set(clampedPosition);
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        const timeoutId = setTimeout(calculateDimensions, 100);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            clearTimeout(timeoutId);
        };
    }, [visibleItems, pathname, x]);

    // ========================================
    // STEP 3: Auto-center active route
    // ========================================
    useEffect(() => {
        if (contentWidth === 0 || !containerRef.current || !contentRef.current) return;
        
        const activeItem = visibleItems.find(item => item.route === pathname);
        if (!activeItem) return;

        const timeoutId = setTimeout(() => {
            if (!containerRef.current || !contentRef.current) return;

            // Find active button
            const allButtons = Array.from(contentRef.current.querySelectorAll('[data-button-item]')) as HTMLElement[];
            let activeButton: HTMLElement | null = null;

            for (const btnElement of allButtons) {
                const btnId = btnElement.getAttribute('data-button-id');
                if (btnId === activeItem.id) {
                    activeButton = btnElement;
                    break;
                }
            }

            if (!activeButton || !containerRef.current) return;

            const buttonRect = activeButton.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
            const containerCenterX = containerRect.width / 2;
            const offset = buttonCenterX - containerCenterX;

            const targetX = x.get() - offset;
            
            // Limitar dentro dos constraints
            const clampedX = Math.max(dragConstraints.left, Math.min(dragConstraints.right, targetX));
            x.set(clampedX);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname, contentWidth, visibleItems, x, dragConstraints]);

    // ========================================
    // RENDER
    // ========================================
    return (
        <div 
            ref={containerRef}
            className="w-full relative h-[80px] flex items-center overflow-visible"
            style={{ 
                touchAction: 'pan-y',
                isolation: 'isolate',
                transform: 'translate3d(0, 0, 0)',
                WebkitTransform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            }}
        >
            {/* Background Bar */}
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                style={{ 
                    backgroundColor: style.bgColor || '#5874f6',
                    transform: 'translate3d(0, 0, 0)',
                    WebkitTransform: 'translate3d(0, 0, 0)'
                }}
            />

            {/* Bounded Scroll Container */}
            <motion.div
                ref={contentRef}
                drag="x"
                dragElastic={0.1}
                dragMomentum={true}
                dragConstraints={dragConstraints}
                dragTransition={{ 
                    bounceStiffness: 300, 
                    bounceDamping: 25,
                    power: 0.3,
                    timeConstant: 200
                }}
                onDragStart={() => {
                    isDragging.current = true;
                    dragStartX.current = x.get();
                }}
                onDrag={(_, info) => {
                    const newX = dragStartX.current + info.offset.x;
                    x.set(newX);
                }}
                onDragEnd={() => {
                    isDragging.current = false;
                }}
                style={{ 
                    x,
                    touchAction: 'pan-x pan-y',
                    willChange: 'transform',
                    contain: 'layout'
                }}
                className={cn(
                    "relative z-10 flex items-center h-full px-4",
                    "gap-2",
                    "cursor-grab active:cursor-grabbing",
                    "select-none"
                )}
            >
                {visibleItems.map((item, index) => {
                    const isHighlight = item.route === '/pos' || item.id === highlightItem?.id;
                    
                    return (
                        <FooterButton 
                            key={item.id}
                            item={item}
                            index={index}
                            containerRef={containerRef}
                            pathname={pathname}
                            isHighlight={isHighlight}
                        />
                    );
                })}
            </motion.div>
        </div>
    );
};

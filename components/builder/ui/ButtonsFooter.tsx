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

// --- Interfaces ---

interface ButtonsFooterProps {
    items: FooterItem[];
    style: BlockStyle;
}

interface FooterButtonProps {
    item: FooterItem;
    originalId: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    highlightItem: FooterItem | undefined;
    pathname: string;
}

// --- Sub-Component: FooterButton ---
// Extracted to allow proper usage of Hooks (useRef, useState, useAnimationFrame)
const FooterButton = ({ 
    item, 
    originalId, 
    containerRef, 
    contentRef, 
    highlightItem, 
    pathname 
}: FooterButtonProps): React.JSX.Element => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isThisButtonCenter, setIsThisButtonCenter] = useState<boolean>(false);
    
    // Logic to determine highlighting and active state
    const isHighlight = item.route === '/pos' || originalId === highlightItem?.id;
    const isActive = item.route === pathname;
    const transitionClass = "transition-all duration-75 ease-out";

    // Render Icon Helper
    const renderIcon = (name: string, isActiveState: boolean): React.JSX.Element => {
        const size = isActiveState ? 24 : 20;
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

    // Animation Frame Loop for Center Detection
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
        
        const CENTER_THRESHOLD = 75;
        
        if (distance >= CENTER_THRESHOLD) {
            setIsThisButtonCenter(false);
            return;
        }
        
        // Collect all buttons to compare distances
        const allButtons = contentRef.current.querySelectorAll('[data-button-item]') as NodeListOf<HTMLElement>;
        const bestDistancePerOriginal = new Map<string, number>();
        
        allButtons.forEach((otherButton) => {
            const otherButtonId = otherButton.getAttribute('data-button-id');
            if (otherButtonId) {
                const otherOriginalIdMatch = otherButtonId.match(/^(.+?)(?:_loop_\d+_\d+)?$/);
                const otherOriginalId = otherOriginalIdMatch ? otherOriginalIdMatch[1] : otherButtonId;
                
                const otherRect = otherButton.getBoundingClientRect();
                const otherCenterX = otherRect.left - containerRect.left + otherRect.width / 2;
                const otherDistance = Math.abs(otherCenterX - fixedCenterX);
                
                const existing = bestDistancePerOriginal.get(otherOriginalId);
                if (existing === undefined || otherDistance < existing) {
                    bestDistancePerOriginal.set(otherOriginalId, otherDistance);
                }
            }
        });
        
        let globalMinDistance = Infinity;
        bestDistancePerOriginal.forEach((dist) => {
            if (dist < globalMinDistance) {
                globalMinDistance = dist;
            }
        });
        
        if (globalMinDistance >= CENTER_THRESHOLD) {
            setIsThisButtonCenter(false);
            return;
        }
        
        const thisButtonBestDistance = bestDistancePerOriginal.get(originalId);
        if (thisButtonBestDistance === undefined) {
            setIsThisButtonCenter(false);
            return;
        }
        
        const TOLERANCE = 1.5;
        const isThisInstanceBest = Math.abs(distance - thisButtonBestDistance) < TOLERANCE;
        const isClosest = Math.abs(thisButtonBestDistance - globalMinDistance) < TOLERANCE;
        
        let isUniqueClosest = true;
        let tieCount = 0;
        bestDistancePerOriginal.forEach((dist, otherOriginalId) => {
            if (Math.abs(dist - globalMinDistance) < TOLERANCE) {
                tieCount++;
                if (otherOriginalId !== originalId && otherOriginalId < originalId) {
                    isUniqueClosest = false;
                }
            }
        });
        
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
            transition={{
                type: 'spring',
                stiffness: 1000,
                damping: 35,
                mass: 0.2
            }}
            className={cn(
                "flex items-center justify-center shadow-xl rounded-full border-4 shrink-0",
                "select-none touch-none",
                transitionClass,
                isThisButtonCenter 
                    ? "w-14 h-14 -mt-5 mb-3.5 border-white ring-4 ring-[#5874f6]/20 z-20" 
                    : "w-12 h-12 mt-4 mb-3 border-transparent bg-white z-10",
                isThisButtonCenter ? "bg-[#5874f6]" : "bg-white",
                isActive && !isThisButtonCenter && "ring-2 ring-pink-400/50 border-pink-400/30 bg-pink-50",
                isActive && isThisButtonCenter && "ring-4 ring-pink-400/40 border-pink-400/50",
                isHighlight && !isActive && !isThisButtonCenter && "ring-2 ring-[#5874f6]/30 border-[#5874f6]/50",
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
                // Note: Drag handling is managed by the parent container, 
                // but we allow pointer events to bubble up or be captured here if needed.
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
        >
            {buttonContent}
        </div>
    );
};

// --- Main Component ---

export const ButtonsFooter = ({ items, style }: ButtonsFooterProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    
    const x = useMotionValue(0);
    const dragStartX = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
    const dragDirection = useRef<number>(0);
    const lastDragX = useRef<number>(0);
    
    useEffect(() => {
        lastDragX.current = x.get();
    }, [x]);

    const visibleItems = useMemo(() => {
        return items.filter(item => item.isVisible);
    }, [items]);

    const highlightItem = useMemo(() => {
        return visibleItems.find(item => item.route === '/dashboard' || item.isHighlight);
    }, [visibleItems]);

    const duplicatedItems = useMemo(() => {
        if (visibleItems.length === 0) return [];
        
        const copies: FooterItem[][] = [];
        const numberOfCopies = 8;
        
        for (let copyIndex = 0; copyIndex < numberOfCopies; copyIndex++) {
            copies.push(
                visibleItems.map((item, itemIndex) => ({
                    ...item,
                    id: `${item.id}_loop_${copyIndex}_${itemIndex}`
                }))
            );
        }
        
        return copies.flat();
    }, [visibleItems]);

    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!contentRef.current || duplicatedItems.length === 0) return;

            const firstButton = contentRef.current.querySelector('[data-button-item]') as HTMLElement;
            if (firstButton) {
                const buttonRect = firstButton.getBoundingClientRect();
                const gap = 12;
                const itemWidthCalculated = buttonRect.width + gap;
                const singleSetWidth = visibleItems.length * itemWidthCalculated;
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
    }, [visibleItems.length, duplicatedItems.length]);

    const mathMod = (value: number, modulus: number): number => {
        return ((value % modulus) + modulus) % modulus;
    };
    
    const wrappedX = useTransform(x, (latestX): number => {
        if (contentWidth === 0) return latestX;
        
        const modulo = mathMod(latestX, contentWidth);
        let wrapped = modulo === 0 ? -contentWidth : modulo - contentWidth;
        
        if (wrapped > 0) {
            wrapped = wrapped - contentWidth;
        }
        if (wrapped <= -contentWidth) {
            wrapped = wrapped + contentWidth;
        }
        
        if (wrapped > 0 || wrapped <= -contentWidth) {
            wrapped = mathMod(latestX, contentWidth) - contentWidth;
            if (wrapped > 0) wrapped = wrapped - contentWidth;
            if (wrapped <= -contentWidth) wrapped = wrapped + contentWidth;
        }
        
        return wrapped;
    });

    const isResettingRef = useRef<boolean>(false);
    
    useEffect(() => {
        if (contentWidth === 0) return;

        const unsubscribe = x.on('change', (latest: number): void => {
            if (isResettingRef.current) return;
            
            const rightThreshold = contentWidth * 0.2;
            const leftThreshold = -contentWidth * 0.2;
            
            if (latest >= rightThreshold) {
                isResettingRef.current = true;
                const newX = latest - contentWidth;
                x.set(newX);
                lastDragX.current = newX;
                requestAnimationFrame(() => {
                    isResettingRef.current = false;
                });
            }
            else if (latest <= leftThreshold) {
                isResettingRef.current = true;
                const newX = latest + contentWidth;
                x.set(newX);
                lastDragX.current = newX;
                requestAnimationFrame(() => {
                    isResettingRef.current = false;
                });
            }
        });

        return () => unsubscribe();
    }, [x, contentWidth]);
    
    useEffect(() => {
        if (contentWidth > 0) {
            const currentX = x.get();
            if (currentX === 0) {
                const initialX = -contentWidth / 2;
                x.set(initialX);
                lastDragX.current = initialX;
            }
        }
    }, [contentWidth, x]);

    useEffect(() => {
        if (contentWidth === 0 || !containerRef.current || !contentRef.current) return;
        
        const activeItem = visibleItems.find(item => item.route === pathname);
        if (!activeItem) return;

        const frameId = requestAnimationFrame(() => {
            if (!containerRef.current || !contentRef.current) return;

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

            const buttonRect = activeButtonElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
            const fixedCenterX = containerRect.width / 2;
            const deltaX = buttonCenterX - fixedCenterX;
            const currentX = x.get();
            const targetX = currentX - deltaX;

            let normalizedX = mathMod(targetX, contentWidth);
            if (normalizedX > 0) {
                normalizedX = normalizedX - contentWidth;
            }
            if (normalizedX <= -contentWidth) {
                normalizedX = normalizedX + contentWidth;
            }

            const currentNormalized = mathMod(currentX, contentWidth);
            let currentNormalizedFixed = currentNormalized;
            if (currentNormalizedFixed > 0) {
                currentNormalizedFixed = currentNormalizedFixed - contentWidth;
            }
            
            const offset = Math.round((currentNormalizedFixed - normalizedX) / contentWidth) * contentWidth;
            const finalX = normalizedX + offset;

            x.set(finalX);
            lastDragX.current = finalX;
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [pathname, contentWidth, visibleItems, x]);

    const getOriginalId = (duplicatedId: string): string => {
        const match = duplicatedId.match(/^(.+?)_loop_\d+_\d+$/);
        return match ? match[1] : duplicatedId;
    };

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
                    dragStartPosition.current = { x: event.clientX, y: event.clientY };
                    isDragging.current = false;
                }}
                onDragStart={(event, info) => {
                    if (dragStartPosition.current && 'clientX' in event) {
                        const pointerEvent = event as PointerEvent;
                        const deltaX = Math.abs(pointerEvent.clientX - dragStartPosition.current.x);
                        const deltaY = Math.abs(pointerEvent.clientY - dragStartPosition.current.y);
                        
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
                    
                    const newX = dragStartX.current + info.offset.x;
                    x.set(newX);
                            
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
                        <FooterButton 
                            key={item.id}
                            item={item}
                            originalId={originalId}
                            containerRef={containerRef}
                            contentRef={contentRef}
                            highlightItem={highlightItem}
                            pathname={pathname}
                        />
                    );
                })}
            </motion.div>
        </div>
    );
};
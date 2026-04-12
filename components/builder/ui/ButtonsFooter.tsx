'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { FooterItem, BlockStyle } from '@/types/builder';
import { useSellerContext } from '@/lib/seller-context';

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
    onNavigate?: (route: string) => void;
}

type IconName = FooterItem['icon'];

const GAP_WIDTH = 8;

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

const FooterButton = ({ 
    item, 
    pathname,
    isHighlight,
    onNavigate
}: FooterButtonProps): React.JSX.Element => {
    const buttonRef = useRef<HTMLDivElement>(null);
    
    const targetRoute = item.route || '#';
    const isActive = targetRoute === pathname;
    
    const transitionClass = "transition-all duration-100 ease-out";

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
                isActive 
                    ? "bg-[#5874f6] border-white ring-4 ring-pink-400/60 z-20" 
                    : "bg-white border-transparent z-10",
                isHighlight && !isActive && "ring-2 ring-[#5874f6]/30 border-[#5874f6]/50",
                "active:scale-90 active:opacity-80"
            )}
        >
            {renderIcon(item.icon, isActive)}
        </motion.div>
    );

    // Se tiver um interceptador de navegação (modo visitante), usa div com onClick
    if (onNavigate && item.route) {
        return (
            <div
                onClick={() => onNavigate(item.route!)}
                className={cn(
                    "shrink-0 flex items-center justify-center cursor-pointer",
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
    }

    if (item.route) {
        return (
            <Link
                href={targetRoute}
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

export const ButtonsFooter = ({ items, style }: ButtonsFooterProps): React.JSX.Element => {
    const pathname = usePathname();
    const router = useRouter();
    const { isPreviewMode, sellerSlug } = useSellerContext();
    const containerRef = useRef<HTMLDivElement>(null);

    // Intercepta navegação em modo visitante: redireciona para cadastro
    const handlePreviewNavigate = (route: string) => {
        // Dashboard é permitido (tela inicial)
        if (route === '/dashboard') {
            router.push(sellerSlug ? `/dashboard?seller=${sellerSlug}` : '/dashboard');
            return;
        }
        // Qualquer outra rota → cadastro
        const registrationUrl = sellerSlug ? `/?seller=${sellerSlug}` : '/';
        router.push(registrationUrl);
    };
    const contentRef = useRef<HTMLDivElement>(null);
    
    const x = useMotionValue(0);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
    
    const isDragging = useRef<boolean>(false);
    const dragStartX = useRef<number>(0);

    const visibleItems = useMemo<FooterItem[]>(() => {
        return items.filter(item => item.isVisible);
    }, [items]);

    const highlightItem = useMemo<FooterItem | undefined>(() => {
        return visibleItems.find(item => item.route === '/pos' || item.isHighlight);
    }, [visibleItems]);

    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!contentRef.current || !containerRef.current || visibleItems.length === 0) return;

            const firstButton = contentRef.current.querySelector('[data-button-item]') as HTMLElement;
            if (!firstButton) return;

            const buttonRect = firstButton.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const itemWidth = buttonRect.width + GAP_WIDTH;
            const totalContentWidth = visibleItems.length * itemWidth - GAP_WIDTH;
            const viewportWidth = containerRect.width;

            if (totalContentWidth <= viewportWidth) {
                const centerOffset = (viewportWidth - totalContentWidth) / 2;
                setDragConstraints({
                    left: centerOffset,
                    right: centerOffset
                });
                
                const currentX = x.get();
                if (currentX === 0 || Math.abs(currentX) < 1) {
                    x.set(centerOffset);
                }
            } else {
                const maxScrollLeft = -(totalContentWidth - viewportWidth);
                const maxScrollRight = 0;

                setDragConstraints({
                    left: maxScrollLeft,
                    right: maxScrollRight
                });

                const currentX = x.get();
                if (currentX === 0 || Math.abs(currentX) < 1) {
                    x.set(0);
                }
            }
        };

        const timeoutId = setTimeout(calculateDimensions, 100);
        window.addEventListener('resize', calculateDimensions);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            clearTimeout(timeoutId);
        };
    }, [visibleItems.length, x]);

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
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                style={{ 
                    backgroundColor: style.bgColor || '#5874f6',
                    transform: 'translate3d(0, 0, 0)',
                    WebkitTransform: 'translate3d(0, 0, 0)'
                }}
            />

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
                    "relative z-10 flex items-center h-full",
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
                            onNavigate={isPreviewMode ? handlePreviewNavigate : undefined}
                        />
                    );
                })}
            </motion.div>
        </div>
    );
};
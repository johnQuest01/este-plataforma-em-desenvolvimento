'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue, useAnimationFrame } from 'framer-motion';
import { usePathname } from 'next/navigation';
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
 * Configuration for fisheye magnification
 */
interface FisheyeConfig {
    maxScale: number;
    minScale: number;
    maxWidth: number;
    minWidth: number;
    maxDistance: number;
    springStiffness: number;
    springDamping: number;
    springMass: number;
}

/**
 * Props for DockIcon
 */
interface DockIconProps {
    button: CircularFooterButton;
    index: number;
    cursorX: MotionValue<number | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    config: FisheyeConfig;
    isActive: boolean;
    pathname: string;
    renderIcon: (iconName: string, buttonColor?: string) => React.JSX.Element;
}

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
 * DockIcon: Individual icon component with fisheye magnification
 */
const DockIcon: React.FC<DockIconProps> = ({
    button,
    index,
    cursorX,
    containerRef,
    config,
    isActive,
    pathname,
    renderIcon
}) => {
    const iconRef = useRef<HTMLDivElement>(null);
    const iconCenterX = useMotionValue<number>(0);
    
    // Update button center position using useAnimationFrame
    useAnimationFrame(() => {
        if (!iconRef.current || !containerRef.current) return;
        const iconRect = iconRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = iconRect.left - containerRect.left + iconRect.width / 2;
        iconCenterX.set(centerX);
    });

    // Create a MotionValue that always returns a number (treats null as maxDistance)
    const cursorXNumber = useTransform(cursorX, (value: number | null): number => {
        return value ?? config.maxDistance;
    });

    // Calculate distance between cursor and button center
    const distanceFromCursor = useTransform(
        [cursorXNumber, iconCenterX],
        (values: number[]): number => {
            const cursor = values[0] ?? config.maxDistance;
            const center = values[1] ?? 0;
            if (center === 0) return config.maxDistance;
            return Math.abs(cursor - center);
        }
    );

    // Apply spring to smooth the distance
    const smoothedDistance = useSpring(distanceFromCursor, {
        stiffness: config.springStiffness,
        damping: config.springDamping,
        mass: config.springMass
    });

    // Calculate scale based on distance (fisheye effect)
    const iconScale = useTransform(smoothedDistance, (distance) => {
        if (distance >= config.maxDistance) {
            return config.minScale;
        }
        
        // Non-linear interpolation for fisheye effect
        const normalizedDistance = distance / config.maxDistance;
        const easeOut = 1 - Math.pow(1 - normalizedDistance, 3); // Cubic easing
        
        return config.maxScale - (easeOut * (config.maxScale - config.minScale));
    });

    // Calculate width based on distance
    const iconWidth = useTransform(smoothedDistance, (distance) => {
        if (distance >= config.maxDistance) {
            return config.minWidth;
        }
        
        const normalizedDistance = distance / config.maxDistance;
        const easeOut = 1 - Math.pow(1 - normalizedDistance, 3);
        
        return config.maxWidth - (easeOut * (config.maxWidth - config.minWidth));
    });

    // Apply spring to output values for elastic fluidity
    const springScale = useSpring(iconScale, {
        stiffness: config.springStiffness,
        damping: config.springDamping,
        mass: config.springMass
    });

    const springWidth = useSpring(iconWidth, {
        stiffness: config.springStiffness,
        damping: config.springDamping,
        mass: config.springMass
    });

    const buttonContent = (
        <motion.div
            ref={iconRef}
            style={{
                scale: springScale,
                width: springWidth,
                height: springWidth
            }}
            className={cn(
                "flex items-center justify-center rounded-full shadow-xl border-2 flex-shrink-0",
                "transition-colors duration-200",
                "touch-manipulation",
                "backdrop-blur-2xl bg-black/40",
                "border-white/10",
                isActive 
                    ? "bg-[#5874f6]/60 border-[#5874f6]/30 ring-4 ring-[#5874f6]/20" 
                    : "bg-black/40 border-white/10",
                "cursor-pointer"
            )}
        >
            {renderIcon(button.icon, button.color)}
        </motion.div>
    );

    if (button.route) {
        return (
            <Link
                href={button.route}
                prefetch={true}
                className="flex-shrink-0"
                style={{ touchAction: 'manipulation' }}
                onClick={async () => {
                    await registerFooterUsageAction({
                        buttonId: button.id,
                        buttonLabel: button.label,
                        route: button.route,
                        interactionType: 'click'
                    });
                }}
            >
                {buttonContent}
            </Link>
        );
    }

    return (
        <div className="flex-shrink-0" style={{ touchAction: 'manipulation' }}>
            {buttonContent}
        </div>
    );
};

/**
 * FisheyeFooter: Footer with Fisheye Magnification Effect (Dock Effect)
 * 
 * Footer component with dynamic magnification effect (Apple Watch style).
 * Buttons increase in size as the cursor/touch approaches the center.
 * 
 * Features:
 * - Fisheye Magnification: dynamic scale and width based on cursor distance
 * - Cursor/touch tracking without re-renders (useMotionValue)
 * - Non-linear interpolation with cubic easing
 * - Spring physics for elastic fluidity
 * - Glassmorphism with backdrop-blur
 */
const FisheyeFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // States for dimensions
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // 1. Validation (Executed but result used later for rendering)
    const validationResult = InfiniteCircularFooterDataSchema.safeParse(config.data);
    
    // Use validated data or fallback to defaults to keep hooks running unconditionally
    const safeData = validationResult.success ? validationResult.data : DEFAULT_CONFIG;

    const {
        buttons,
        backgroundColor
    } = safeData;

    // Configuration for fisheye magnification (useMemo called unconditionally)
    const fisheyeConfig: FisheyeConfig = useMemo(() => ({
        maxScale: 1.8,
        minScale: 1.0,
        maxWidth: 80,
        minWidth: 45,
        maxDistance: 150,
        springStiffness: 300,
        springDamping: 30,
        springMass: 0.8
    }), []);

    // MotionValue to track cursor/touch X position (useMotionValue called unconditionally)
    const cursorX = useMotionValue<number | null>(null);

    // 2. Calculate dimensions dynamically (useEffect called unconditionally)
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);
            
            setIsInitialized(true);
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        const timeoutId = setTimeout(calculateDimensions, 100);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            clearTimeout(timeoutId);
        };
    }, []);

    // 3. Track cursor/touch movement (useEffect called unconditionally)
    useEffect(() => {
        if (!isInitialized || !containerRef.current) return;

        const container = containerRef.current;

        const handleMouseMove = (event: MouseEvent): void => {
            const containerRect = container.getBoundingClientRect();
            const relativeX = event.clientX - containerRect.left;
            cursorX.set(relativeX);
        };

        const handleMouseLeave = (): void => {
            cursorX.set(null);
        };

        const handleTouchMove = (event: TouchEvent): void => {
            if (event.touches.length > 0) {
                const containerRect = container.getBoundingClientRect();
                const relativeX = event.touches[0].clientX - containerRect.left;
                cursorX.set(relativeX);
            }
        };

        const handleTouchEnd = (): void => {
            cursorX.set(null);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isInitialized, cursorX]);

    // 4. Lucide Icon Mapping
    const iconMap: Record<string, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        default: HelpCircle
    };

    // 5. Render Icon (useCallback called unconditionally)
    const renderIcon = useCallback((iconName: string, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap.default;
        const color = buttonColor ?? '#FFFFFF';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    }, []);

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

    if (!isInitialized) {
        return (
            <div className="w-full h-[80px] flex items-center justify-center">
                <div className="text-gray-400 text-sm">Carregando...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full relative h-[80px] flex items-end pointer-events-auto overflow-hidden"
            style={{ 
                touchAction: 'pan-y'
            }}
        >
            {/* BACKGROUND BAR WITH GLASSMORPHISM */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 w-full h-[60px] z-0",
                    "backdrop-blur-2xl bg-black/40",
                    "border-t border-white/10",
                    "shadow-[0_-4px_20px_rgba(0,0,0,0.5)]",
                    "pointer-events-auto"
                )}
                style={{ 
                    backgroundColor: backgroundColor ? `${backgroundColor}40` : undefined
                }}
            />

            {/* BUTTON CONTAINER WITH FISHEYE EFFECT */}
            <div
                className={cn(
                    "relative z-10 flex items-end h-full px-4 pointer-events-auto",
                    "gap-4",
                    "select-none"
                )}
            >
                {buttons.map((button, index) => {
                    const isActive = button.route === pathname;
                    return (
                        <DockIcon
                            key={button.id}
                            button={button}
                            index={index}
                            cursorX={cursorX}
                            containerRef={containerRef}
                            config={fisheyeConfig}
                            isActive={isActive}
                            pathname={pathname}
                            renderIcon={renderIcon}
                        />
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Export component
 */
export const FisheyeFooter = FisheyeFooterBase;
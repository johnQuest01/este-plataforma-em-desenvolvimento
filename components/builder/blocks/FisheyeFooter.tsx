// components/builder/blocks/FisheyeFooter.tsx
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
import { InfiniteCircularFooterDataSchema, CircularFooterButton } from '@/types/footer';
import { registerFooterUsageAction } from '@/app/actions/footer-actions';

/**
 * Configuração de fisheye magnification
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
 * Props para DockIcon
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
 * DockIcon: Componente individual de ícone com fisheye magnification
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
    
    // Atualiza posição do centro do botão usando useAnimationFrame
    useAnimationFrame(() => {
        if (!iconRef.current || !containerRef.current) return;
        const iconRect = iconRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = iconRect.left - containerRect.left + iconRect.width / 2;
        iconCenterX.set(centerX);
    });

    // Cria um MotionValue que sempre retorna number (trata null como maxDistance)
    const cursorXNumber = useTransform(cursorX, (value: number | null): number => {
        return value ?? config.maxDistance;
    });

    // Calcula distância entre cursor e centro do botão
    const distanceFromCursor = useTransform(
        [cursorXNumber, iconCenterX],
        (values: number[]): number => {
            const cursor = values[0] ?? config.maxDistance;
            const center = values[1] ?? 0;
            if (center === 0) return config.maxDistance;
            return Math.abs(cursor - center);
        }
    );

    // Aplica spring para suavizar a distância
    const smoothedDistance = useSpring(distanceFromCursor, {
        stiffness: config.springStiffness,
        damping: config.springDamping,
        mass: config.springMass
    });

    // Calcula scale baseado na distância (fisheye effect)
    const iconScale = useTransform(smoothedDistance, (distance) => {
        if (distance >= config.maxDistance) {
            return config.minScale;
        }
        
        // Interpolação não-linear para efeito fisheye
        const normalizedDistance = distance / config.maxDistance;
        const easeOut = 1 - Math.pow(1 - normalizedDistance, 3); // Easing cúbico
        
        return config.maxScale - (easeOut * (config.maxScale - config.minScale));
    });

    // Calcula width baseado na distância
    const iconWidth = useTransform(smoothedDistance, (distance) => {
        if (distance >= config.maxDistance) {
            return config.minWidth;
        }
        
        const normalizedDistance = distance / config.maxDistance;
        const easeOut = 1 - Math.pow(1 - normalizedDistance, 3);
        
        return config.maxWidth - (easeOut * (config.maxWidth - config.minWidth));
    });

    // Aplica spring nos valores de saída para fluidez elástica
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
 * FisheyeFooter: Footer com efeito Fisheye Magnification (Dock Effect)
 * 
 * Componente de rodapé com efeito de ampliação dinâmica estilo Apple Watch.
 * Os botões aumentam de tamanho conforme o cursor/toque se aproxima do centro.
 * 
 * Features:
 * - Fisheye Magnification: scale e width dinâmicos baseados na distância do cursor
 * - Rastreamento de cursor/toque sem re-renders (useMotionValue)
 * - Interpolação não-linear com easing cúbico
 * - Spring physics para fluidez elástica
 * - Glassmorphism com backdrop-blur
 */
const FisheyeFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Estados para dimensões
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
        backgroundColor
    } = validationResult.data;

    // Configuração de fisheye magnification
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

    // MotionValue para rastrear posição X do cursor/toque (sem re-renders)
    const cursorX = useMotionValue<number | null>(null);

    // 1. Calcula dimensões dinamicamente
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

    // 2. Rastreia movimento do cursor/toque
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

    // 3. Mapeamento de ícones Lucide
    const iconMap: Record<string, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        default: HelpCircle
    };

    // 4. Renderiza ícone
    const renderIcon = useCallback((iconName: string, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap.default;
        const color = buttonColor ?? '#FFFFFF';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    }, []);

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
            {/* BARRA DE FUNDO COM GLASSMORPHISM */}
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

            {/* CONTAINER DE BOTÕES COM FISHEYE EFFECT */}
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
 * Exportação do componente
 */
export const FisheyeFooter = FisheyeFooterBase;

// components/builder/blocks/NavigationFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useTransform, animate } from 'framer-motion';
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
import { 
    useFluidButton,
    FluidButtonConfig,
    FluidButtonState
} from '@/hooks/useFluidButton';

/**
 * NavigationFooter: Fluid Interface Footer (watchOS Style)
 * 
 * Componente de rodapé com física fluida estilo watchOS.
 * Implementa rubber banding, scale magnification e squash & stretch.
 * 
 * Features:
 * - Rubber Banding: resistência elástica ao arrasto
 * - Scale Magnification: aumento ao pressionar
 * - Squash and Stretch: deformação na direção do arrasto
 * - Glassmorphism: efeito de vidro líquido com backdrop-blur
 * - Spring physics: stiffness 300, damping 30, mass 0.8
 */
const NavigationFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Estados para dimensões
    const [itemWidth, setItemWidth] = useState<number>(72);
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
        backgroundColor,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity
    } = validationResult.data;

    // Configuração de física fluida (watchOS style)
    const fluidConfig: FluidButtonConfig = useMemo(() => ({
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        dragResistance: 0.007, // Resistência ao arrasto (rubber banding)
        scaleMagnification: 1.15, // Aumento ao pressionar
        squashStretchIntensity: 0.003 // Intensidade do squash and stretch
    }), []);

    // 1. Calcula dimensões dinamicamente
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);
            
            const gap = 16;
            const buttonSize = 56;
            setItemWidth(buttonSize + gap);
            
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

    // 2. Mapeamento de ícones Lucide
    const iconMap: Record<string, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        default: HelpCircle
    };

    // 3. Renderiza ícone
    const renderIcon = (iconName: string, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap.default;
        const color = buttonColor ?? '#5874f6';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    };

    // 4. Componente de botão individual com física fluida
    const ButtonItem: React.FC<{
        button: CircularFooterButton;
        index: number;
        containerWidth: number;
        itemWidth: number;
        centerScale: number;
        edgeScale: number;
        centerOpacity: number;
        edgeOpacity: number;
        fluidConfig: FluidButtonConfig;
    }> = ({
        button,
        index,
        containerWidth,
        itemWidth,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity,
        fluidConfig
    }) => {
        const isActive = button.route === pathname;
        
        // Posição inicial
        const restPosition = useMemo(() => {
            if (containerWidth === 0) return 0;
            const centerOffset = containerWidth / 2;
            const buttonOffset = (index - (buttons.length - 1) / 2) * itemWidth;
            return centerOffset + buttonOffset;
        }, [containerWidth, index, itemWidth, buttons.length]);
        
        // Hook de física fluida
        const fluidState = useFluidButton(restPosition, fluidConfig);
        
        // Inicializa posição
        useEffect(() => {
            if (containerWidth > 0 && restPosition > 0) {
                fluidState.x.set(restPosition);
            }
        }, [containerWidth, restPosition, fluidState.x]);

        // Calcula scale e opacity baseado na posição (Apple Watch Effect)
        const buttonScale = useTransform(fluidState.xSpring, (latestX) => {
            if (containerWidth === 0) return centerScale;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedScale = centerScale - (normalizedDistance * (centerScale - edgeScale));
            return Math.max(edgeScale, Math.min(centerScale, calculatedScale));
        });

        const buttonOpacity = useTransform(fluidState.xSpring, (latestX) => {
            if (containerWidth === 0) return centerOpacity;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedOpacity = centerOpacity - (normalizedDistance * (centerOpacity - edgeOpacity));
            return Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity));
        });

        // Combina scale de posição com scale de pressão
        const finalScaleX = useTransform(
            [buttonScale, fluidState.scaleX],
            (values: number[]): number => {
                const positionScale = values[0] ?? 1;
                const pressScale = values[1] ?? 1;
                return positionScale * pressScale;
            }
        );

        const finalScaleY = useTransform(
            [buttonScale, fluidState.scaleY],
            (values: number[]): number => {
                const positionScale = values[0] ?? 1;
                const pressScale = values[1] ?? 1;
                return positionScale * pressScale;
            }
        );

        // Posição visual: usa xSpring diretamente (rubber banding já aplicado no onDrag)
        const visualX = fluidState.xSpring;

        const buttonContent = (
            <motion.div
                drag="x"
                dragElastic={0.3}
                dragMomentum={true}
                dragTransition={{ 
                    bounceStiffness: fluidConfig.stiffness,
                    bounceDamping: fluidConfig.damping
                }}
                onDragStart={() => {
                    fluidState.isPressedRef.current = true;
                }}
                onDrag={(_, info) => {
                    // Atualiza delta para rubber banding e squash & stretch
                    fluidState.dragDelta.set(info.offset.x);
                    
                    // Atualiza posição com rubber banding aplicado
                    const currentX = fluidState.x.get();
                    const rawDelta = info.delta.x;
                    // Aplica resistência não-linear (rubber banding)
                    const resistanceFactor = 1 - (1 / (1 + Math.abs(rawDelta) * fluidConfig.dragResistance * 10));
                    const rubberBandedDelta = rawDelta * resistanceFactor;
                    fluidState.x.set(currentX + rubberBandedDelta);
                }}
                onDragEnd={(_, info) => {
                    fluidState.isPressedRef.current = false;
                    
                    // Reseta delta para animação de retorno
                    animate(fluidState.dragDelta, 0, {
                        type: 'spring',
                        stiffness: fluidConfig.stiffness,
                        damping: fluidConfig.damping
                    });
                    
                    // Aplica inércia com rubber banding
                    const velocity = info.velocity.x;
                    if (Math.abs(velocity) > 50) {
                        const currentX = fluidState.x.get();
                        const targetX = currentX + (velocity * 0.1 * fluidConfig.dragResistance);
                        animate(fluidState.x, targetX, {
                            type: 'spring',
                            stiffness: fluidConfig.stiffness,
                            damping: fluidConfig.damping,
                            velocity: velocity
                        });
                    } else {
                        // Retorna à posição de repouso
                        animate(fluidState.x, restPosition, {
                            type: 'spring',
                            stiffness: fluidConfig.stiffness,
                            damping: fluidConfig.damping
                        });
                    }
                }}
                style={{
                    x: visualX,
                    scaleX: finalScaleX,
                    scaleY: finalScaleY,
                    opacity: buttonOpacity
                }}
                className={cn(
                    "flex items-center justify-center rounded-full shadow-xl border-2 flex-shrink-0",
                    "w-14 h-14",
                    "transition-colors duration-200",
                    "touch-manipulation",
                    "backdrop-blur-md bg-white/80",
                    "border-white/50",
                    isActive 
                        ? "bg-[#5874f6]/90 border-[#5874f6] ring-4 ring-[#5874f6]/20" 
                        : "bg-white/80 border-gray-200/50",
                    "cursor-grab active:cursor-grabbing"
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
            className="w-full relative h-[80px] flex items-end pointer-events-none overflow-hidden"
            style={{ 
                touchAction: 'pan-y'
            }}
        >
            {/* BARRA DE FUNDO COM GLASSMORPHISM */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 w-full h-[60px] z-0",
                    "backdrop-blur-xl bg-gradient-to-t from-[#5874f6]/40 to-[#5874f6]/20",
                    "shadow-[0_-4px_20px_rgba(88,116,246,0.3)]",
                    "border-t border-white/20",
                    "pointer-events-auto"
                )}
                style={{ 
                    backgroundColor: backgroundColor ? `${backgroundColor}40` : undefined
                }}
            />

            {/* CONTAINER DE BOTÕES COM FÍSICA FLUIDA */}
            <div
                className={cn(
                    "relative z-10 flex items-end h-full px-4 pointer-events-auto",
                    "gap-4",
                    "select-none"
                )}
            >
                {buttons.map((button, index) => (
                    <ButtonItem
                        key={button.id}
                        button={button}
                        index={index}
                        containerWidth={containerWidth}
                        itemWidth={itemWidth}
                        centerScale={centerScale}
                        edgeScale={edgeScale}
                        centerOpacity={centerOpacity}
                        edgeOpacity={edgeOpacity}
                        fluidConfig={fluidConfig}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Exportação do componente
 */
export const NavigationFooter = NavigationFooterBase;

// components/builder/blocks/LiquidDynamicFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockComponentProps } from '@/types/builder';
import { 
    LiquidDynamicFooterDataSchema, 
    LiquidFooterButton,
    IconName
} from '@/types/footer-blocks';
import { registerFooterUsageAction } from '@/app/actions/footer-actions';
import { 
    useDistributedPhysics,
    RepulsionConfig,
    ButtonPhysicsState
} from '@/lib/physics/RepulsionEngine';
import { BlockConfig } from '@/types/builder';

/**
 * LiquidDynamicFooter: "Liquid Soap" POS Footer (Apple Watch Style)
 * 
 * Componente de rodapé com física de "sabonete líquido".
 * Botões deslizam, se empurram e crescem drasticamente ao cruzar o centro.
 * 
 * Features:
 * - Física distribuída: cada botão com movimento independente
 * - Campo de repulsão: efeito "sabonete" - empurra quando muito perto
 * - Escala dinâmica extrema: scale 1.8 no centro, 0.6 nas bordas
 * - Posicionamento absoluto controlado por MotionValues
 * - Infinite wrap: teletransporte quando sai da tela
 */
const LiquidDynamicFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Estados para dimensões
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Validação via Zod
    const validationResult = LiquidDynamicFooterDataSchema.safeParse(config.data);
    
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
        repulsionRadius,
        repulsionStrength,
        attractionStrength,
        dampingFactor,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity
    } = validationResult.data;

    // Configuração do motor de física
    const BUTTON_SIZE = 56; // w-14 h-14 = 56px
    const PADDING = 100;

    const physicsConfig: RepulsionConfig = useMemo(() => ({
        buttonSize: BUTTON_SIZE,
        repulsionRadius: repulsionRadius,
        repulsionStrength: repulsionStrength,
        attractionStrength: attractionStrength,
        dampingFactor: dampingFactor,
        padding: PADDING,
        containerWidth: containerWidth
    }), [repulsionRadius, repulsionStrength, attractionStrength, dampingFactor, containerWidth]);

    // Hook de física distribuída
    const { buttonStates, startDrag, updateDrag, endDrag } = useDistributedPhysics(
        buttons.length,
        physicsConfig
    );

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

    // 2. Mapeamento de ícones Lucide
    const iconMap: Record<IconName, LucideIcon> = {
        cart: ShoppingCart,
        heart: Heart,
        sync: RefreshCw,
        verified: BadgeCheck,
        'package-check': Package,
        inventory: Box,
        box: Box,
        check: Check,
        'help-circle': HelpCircle
    };

    // 3. Renderiza ícone
    const renderIcon = useCallback((iconName: IconName, buttonColor?: string): React.JSX.Element => {
        const IconComponent = iconMap[iconName] ?? iconMap['help-circle'];
        const color = buttonColor ?? '#FFFFFF';
        
        return <IconComponent size={24} strokeWidth={2.5} style={{ color }} />;
    }, []);

    // 4. Componente de botão individual com física líquida
    const LiquidButton: React.FC<{
        button: LiquidFooterButton;
        index: number;
        physicsState: ButtonPhysicsState;
        containerWidth: number;
        centerScale: number;
        edgeScale: number;
        centerOpacity: number;
        edgeOpacity: number;
        renderIcon: (iconName: IconName, buttonColor?: string) => React.JSX.Element;
    }> = ({
        button,
        index,
        physicsState,
        containerWidth,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity,
        renderIcon
    }) => {
        const isActive = button.route === pathname;
        
        // Calcula escala dinâmica extrema baseada na posição X (fisheye)
        const buttonScale = useTransform(physicsState.x, (x) => {
            if (containerWidth === 0) return centerScale;
            
            const screenCenter = containerWidth / 2;
            const distanceFromCenter = Math.abs(x - screenCenter);
            
            // Curva gaussiana acentuada para efeito "pop" rápido
            const maxDistance = 100; // 100px do centro = scale 1.0
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            
            // Curva gaussiana: e^(-(x^2) / (2 * sigma^2))
            // sigma menor = curva mais acentuada
            const sigma = 0.3;
            const gaussianFactor = Math.exp(-(normalizedDistance * normalizedDistance) / (2 * sigma * sigma));
            
            // Interpola entre centerScale e edgeScale
            const scale = centerScale - (gaussianFactor * (centerScale - edgeScale));
            
            return Math.max(edgeScale, Math.min(centerScale, scale));
        });

        // Calcula opacity baseada na posição X
        const buttonOpacity = useTransform(physicsState.x, (x) => {
            if (containerWidth === 0) return centerOpacity;
            
            const screenCenter = containerWidth / 2;
            const distanceFromCenter = Math.abs(x - screenCenter);
            
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            
            // Curva gaussiana para opacity também
            const sigma = 0.4;
            const gaussianFactor = Math.exp(-(normalizedDistance * normalizedDistance) / (2 * sigma * sigma));
            
            const opacity = centerOpacity - (gaussianFactor * (centerOpacity - edgeOpacity));
            
            return Math.max(edgeOpacity, Math.min(centerOpacity, opacity));
        });

        const buttonContent = (
            <motion.div
                drag="x"
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={false}
                onDragStart={(_, info) => {
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (containerRect) {
                        const relativeX = info.point.x - containerRect.left;
                        startDrag(index, relativeX);
                    }
                }}
                onDrag={(_, info) => {
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (containerRect) {
                        const relativeX = info.point.x - containerRect.left;
                        updateDrag(index, relativeX);
                    }
                }}
                onDragEnd={(_, info) => {
                    // Aplica velocidade ao soltar
                    const velocity = info.velocity.x;
                    endDrag(index, velocity * 0.1); // Ajusta velocidade para física
                }}
                style={{
                    x: physicsState.x,
                    scale: buttonScale,
                    opacity: buttonOpacity,
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}
                className={cn(
                    "flex items-center justify-center rounded-full shadow-xl border-2",
                    "w-14 h-14",
                    "transition-colors duration-200",
                    "touch-manipulation",
                    "backdrop-blur-xl bg-black/40",
                    "border-white/20",
                    isActive 
                        ? "bg-[#5874f6]/60 border-[#5874f6]/40 ring-4 ring-[#5874f6]/20" 
                        : "bg-black/40 border-white/20",
                    "cursor-grab active:cursor-grabbing",
                    "z-10"
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
                    className="absolute"
                    style={{ 
                        touchAction: 'manipulation',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
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
            <div 
                className="absolute"
                style={{ 
                    touchAction: 'manipulation',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}
            >
                {buttonContent}
            </div>
        );
    };

    if (!isInitialized || containerWidth === 0 || buttonStates.length === 0) {
        return (
            <div className="w-full h-[80px] flex items-center justify-center">
                <div className="text-gray-400 text-sm">Carregando...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full relative h-[80px] flex items-center pointer-events-auto overflow-hidden"
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
                    "pointer-events-none"
                )}
                style={{ 
                    backgroundColor: backgroundColor ? `${backgroundColor}40` : undefined
                }}
            />

            {/* CONTAINER DE BOTÕES COM FÍSICA LÍQUIDA (Posicionamento Absoluto) */}
            <div
                className={cn(
                    "relative z-10 w-full h-full",
                    "select-none"
                )}
                style={{ position: 'relative' }}
            >
                {buttons.map((button, index) => {
                    const physicsState = buttonStates[index];
                    if (!physicsState) return null;
                    
                    return (
                        <LiquidButton
                            key={button.id}
                            button={button}
                            index={index}
                            physicsState={physicsState}
                            containerWidth={containerWidth}
                            centerScale={centerScale}
                            edgeScale={edgeScale}
                            centerOpacity={centerOpacity}
                            edgeOpacity={edgeOpacity}
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
export const LiquidDynamicFooter = LiquidDynamicFooterBase;

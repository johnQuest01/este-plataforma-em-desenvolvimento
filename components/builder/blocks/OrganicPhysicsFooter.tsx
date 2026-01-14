// components/builder/blocks/OrganicPhysicsFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, useAnimationFrame, animate, useTransform } from 'framer-motion';
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
import { 
    useIndividualPhysics, 
    calculateRepulsionForce, 
    applyWrapAround,
    PhysicsConfig 
} from '@/hooks/useIndividualPhysics';

/**
 * OrganicPhysicsFooter: Apple Style Organic Physics Footer
 * 
 * Componente de rodapé com física de molas individual para cada botão.
 * Cada botão tem movimento independente com repulsão entre adjacentes.
 * 
 * Features:
 * - Física de molas individual por botão
 * - Efeito de empuxo/repulsão entre botões adjacentes
 * - Loop infinito orgânico com wrap-around
 * - Efeito Apple Watch com scaling baseado na posição
 * - Inércia individual ao soltar
 */
const OrganicPhysicsFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Estados para dimensões
    const [itemWidth, setItemWidth] = useState<number>(64); // w-14 = 56px + gap
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

    // Configuração de física padrão
    const physicsConfig: PhysicsConfig = useMemo(() => ({
        stiffness: 300,
        damping: 30,
        mass: 0.5,
        repulsionStrength: 0.15,
        minDistance: itemWidth
    }), [itemWidth]);

    // 1. Calcula dimensões dinamicamente
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);
            
            // Calcula largura do item (botão + gap)
            const gap = 16; // gap-4 = 16px
            const buttonSize = 56; // w-14 h-14 = 56px
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

    // 4. Componente de botão individual com física própria
    const ButtonItem: React.FC<{
        button: CircularFooterButton;
        index: number;
        containerWidth: number;
        itemWidth: number;
        centerScale: number;
        edgeScale: number;
        centerOpacity: number;
        edgeOpacity: number;
        allButtonsPhysics: Array<ReturnType<typeof useIndividualPhysics>>;
    }> = ({
        button,
        index,
        containerWidth,
        itemWidth,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity,
        allButtonsPhysics
    }) => {
        const isActive = button.route === pathname;
        
        // Física individual para este botão
        const initialX = useMemo(() => {
            if (containerWidth === 0) return 0;
            const centerOffset = containerWidth / 2;
            const buttonOffset = (index - (buttons.length - 1) / 2) * itemWidth;
            return centerOffset + buttonOffset;
        }, [containerWidth, index, itemWidth, buttons.length]);
        
        const physics = useIndividualPhysics(initialX, physicsConfig);
        
        // Inicializa posição quando containerWidth muda
        useEffect(() => {
            if (containerWidth > 0 && initialX > 0) {
                physics.x.set(initialX);
            }
        }, [containerWidth, initialX, physics.x]);
        
        // Armazena referência para cálculos de repulsão
        useEffect(() => {
            if (allButtonsPhysics) {
                allButtonsPhysics[index] = physics;
            }
        }, [index, physics]);

        // Calcula scale e opacity baseado na posição usando useTransform (Apple Watch Effect)
        const buttonScale = useTransform(physics.xSpring, (latestX) => {
            if (containerWidth === 0) return centerScale;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedScale = centerScale - (normalizedDistance * (centerScale - edgeScale));
            return Math.max(edgeScale, Math.min(centerScale, calculatedScale));
        });

        const buttonOpacity = useTransform(physics.xSpring, (latestX) => {
            if (containerWidth === 0) return centerOpacity;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedOpacity = centerOpacity - (normalizedDistance * (centerOpacity - edgeOpacity));
            return Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity));
        });

        // useAnimationFrame para aplicar repulsão e wrap-around
        useAnimationFrame(() => {
            if (!isInitialized || containerWidth === 0 || physics.isDraggingRef.current) return;

            const currentX = physics.xSpring.get();
            
            // Aplica repulsão de botões adjacentes
            let repulsionForce = 0;
            
            allButtonsPhysics.forEach((otherPhysics, otherIndex) => {
                if (otherIndex === index || !otherPhysics || otherPhysics.isDraggingRef.current) return;
                
                const otherX = otherPhysics.xSpring.get();
                const force = calculateRepulsionForce(
                    currentX,
                    otherX,
                    physicsConfig.minDistance,
                    physicsConfig.repulsionStrength
                );
                repulsionForce += force;
            });

            // Aplica força de repulsão gradualmente
            if (Math.abs(repulsionForce) > 0.01) {
                const currentValue = physics.x.get();
                const newX = currentValue + repulsionForce;
                physics.x.set(newX);
            }

            // Aplica wrap-around suave
            const wrappedX = applyWrapAround(currentX, containerWidth, itemWidth);
            if (Math.abs(wrappedX - currentX) > itemWidth / 2) {
                physics.x.set(wrappedX);
            }
        });

        const buttonContent = (
            <motion.div
                drag="x"
                dragElastic={0}
                dragMomentum={true}
                dragTransition={{ 
                    bounceStiffness: physicsConfig.stiffness,
                    bounceDamping: physicsConfig.damping
                }}
                onDragStart={(_, info) => {
                    physics.isDraggingRef.current = true;
                    physics.dragStartXRef.current = info.point.x;
                }}
                onDrag={(_, info) => {
                    const deltaX = info.point.x - physics.dragStartXRef.current;
                    const currentX = physics.xSpring.get();
                    const newX = currentX + info.delta.x;
                    physics.x.set(newX);
                }}
                onDragEnd={(_, info) => {
                    physics.isDraggingRef.current = false;
                    
                    // Aplica inércia individual
                    const velocity = info.velocity.x;
                    if (Math.abs(velocity) > 50) {
                        const currentX = physics.xSpring.get();
                        const targetX = currentX + (velocity * 0.1);
                        animate(physics.x, targetX, {
                            type: 'spring',
                            stiffness: physicsConfig.stiffness,
                            damping: physicsConfig.damping,
                            velocity: velocity
                        });
                    }
                }}
                style={{
                    x: physics.xSpring,
                    scale: buttonScale,
                    opacity: buttonOpacity
                }}
                className={cn(
                    "flex items-center justify-center rounded-full shadow-xl border-2 flex-shrink-0",
                    "w-14 h-14",
                    "transition-colors duration-200",
                    "touch-manipulation",
                    isActive 
                        ? "bg-[#5874f6] border-white ring-4 ring-[#5874f6]/20" 
                        : "bg-white border-gray-200",
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

    // Array para armazenar referências de física de todos os botões
    const allButtonsPhysicsRef = useRef<Array<ReturnType<typeof useIndividualPhysics>>>([]);
    
    // Inicializa array com tamanho correto
    useEffect(() => {
        allButtonsPhysicsRef.current = new Array(buttons.length);
    }, [buttons.length]);

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
                backgroundColor: backgroundColor ?? '#5874f6',
                touchAction: 'pan-y'
            }}
        >
            {/* BARRA DE FUNDO */}
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pointer-events-auto"
                style={{ backgroundColor: backgroundColor ?? '#5874f6' }}
            />

            {/* CONTAINER DE BOTÕES COM FÍSICA INDIVIDUAL */}
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
                        allButtonsPhysics={allButtonsPhysicsRef.current}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Exportação do componente
 */
export const OrganicPhysicsFooter = OrganicPhysicsFooterBase;

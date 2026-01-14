// components/builder/blocks/CollisionPhysicsFooter.tsx
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame, useTransform, animate } from 'framer-motion';
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
    PhysicsEngine, 
    CollisionPhysicsConfig,
    ButtonPhysicsState 
} from '@/lib/physics/PhysicsEngine';

/**
 * CollisionPhysicsFooter: Independent Collision Physics Footer
 * 
 * Componente de rodapé com física de colisão individual para cada botão.
 * Cada botão interage via detecção de colisão e repulsão em tempo real.
 * 
 * Features:
 * - MotionValues independentes por botão
 * - Detecção de colisão em tempo real (120fps)
 * - Repulsão quando botões estão muito próximos
 * - Wrap-around individual quando sai da tela
 * - Spring constraints para posição de repouso
 * - Transferência de momentum como bolas de bilhar
 */
const CollisionPhysicsFooterBase = ({ config, onAction }: BlockComponentProps): React.JSX.Element => {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Estados para dimensões
    const [itemWidth, setItemWidth] = useState<number>(72); // w-14 = 56px + gap-4 = 16px
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

    // Configuração de física
    const physicsConfig: CollisionPhysicsConfig = useMemo(() => ({
        buttonWidth: 56, // w-14 = 56px
        minDistance: itemWidth,
        repulsionStrength: 0.2,
        springStiffness: 150,
        springDamping: 25,
        springMass: 0.5,
        momentumTransfer: 0.8,
        wrapAroundEnabled: true
    }), [itemWidth]);

    // Instância do motor de física
    const physicsEngineRef = useRef<PhysicsEngine | null>(null);

    // Inicializa e atualiza motor de física
    useEffect(() => {
        if (containerWidth > 0) {
            if (!physicsEngineRef.current) {
                physicsEngineRef.current = new PhysicsEngine(physicsConfig, containerWidth);
            } else {
                physicsEngineRef.current.updateContainerWidth(containerWidth);
            }
        }
    }, [containerWidth, physicsConfig]);

    // 1. Calcula dimensões dinamicamente
    useEffect(() => {
        const calculateDimensions = (): void => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerWidth(containerRect.width);
            
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

    // 4. Componente de botão individual com física de colisão
    const ButtonItem: React.FC<{
        button: CircularFooterButton;
        index: number;
        containerWidth: number;
        itemWidth: number;
        centerScale: number;
        edgeScale: number;
        centerOpacity: number;
        edgeOpacity: number;
        physicsConfig: CollisionPhysicsConfig;
    }> = ({
        button,
        index,
        containerWidth,
        itemWidth,
        centerScale,
        edgeScale,
        centerOpacity,
        edgeOpacity,
        physicsConfig
    }) => {
        const isActive = button.route === pathname;
        
        // Posição inicial e de repouso
        const restPosition = useMemo(() => {
            if (containerWidth === 0) return 0;
            const centerOffset = containerWidth / 2;
            const buttonOffset = (index - (buttons.length - 1) / 2) * itemWidth;
            return centerOffset + buttonOffset;
        }, [containerWidth, index, itemWidth, buttons.length]);
        
        // Motion values individuais
        const x = useMotionValue(restPosition);
        const xSpring = useSpring(x, {
            stiffness: physicsConfig.springStiffness,
            damping: physicsConfig.springDamping,
            mass: physicsConfig.springMass
        });

        // Estado físico do botão
        const physicsStateRef = useRef<ButtonPhysicsState>({
            x,
            restPosition,
            velocity: 0,
            isDragging: false,
            mass: physicsConfig.springMass
        });

        // Registra botão no motor de física
        useEffect(() => {
            if (physicsEngineRef.current && containerWidth > 0) {
                physicsStateRef.current.restPosition = restPosition;
                physicsEngineRef.current.registerButton(button.id, physicsStateRef.current);
            }

            return () => {
                if (physicsEngineRef.current) {
                    physicsEngineRef.current.unregisterButton(button.id);
                }
            };
        }, [button.id, restPosition, containerWidth]);

        // Atualiza posição de repouso quando containerWidth muda
        useEffect(() => {
            if (containerWidth > 0 && restPosition > 0) {
                physicsStateRef.current.restPosition = restPosition;
                x.set(restPosition);
                if (physicsEngineRef.current) {
                    physicsEngineRef.current.updateRestPosition(button.id, restPosition);
                }
            }
        }, [containerWidth, restPosition, button.id, x]);

        // Calcula scale e opacity baseado na posição (Apple Watch Effect)
        const buttonScale = useTransform(xSpring, (latestX) => {
            if (containerWidth === 0) return centerScale;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedScale = centerScale - (normalizedDistance * (centerScale - edgeScale));
            return Math.max(edgeScale, Math.min(centerScale, calculatedScale));
        });

        const buttonOpacity = useTransform(xSpring, (latestX) => {
            if (containerWidth === 0) return centerOpacity;
            const centerX = containerWidth / 2;
            const distanceFromCenter = Math.abs(latestX - centerX);
            const maxDistance = containerWidth / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
            const calculatedOpacity = centerOpacity - (normalizedDistance * (centerOpacity - edgeOpacity));
            return Math.max(edgeOpacity, Math.min(centerOpacity, calculatedOpacity));
        });

        // Rastreia velocidade para transferência de momentum
        const lastXRef = useRef<number>(restPosition);
        const lastTimeRef = useRef<number>(Date.now());

        // useAnimationFrame para física de colisão (120fps)
        useAnimationFrame(() => {
            if (!isInitialized || containerWidth === 0 || !physicsEngineRef.current) return;
            if (physicsStateRef.current.isDragging) return;

            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Converter para segundos
            lastTimeRef.current = currentTime;

            // Calcula velocidade
            const currentX = xSpring.get();
            const deltaX = currentX - lastXRef.current;
            physicsStateRef.current.velocity = deltaTime > 0 ? deltaX / deltaTime : 0;
            lastXRef.current = currentX;

            // Processa física do frame
            const force = physicsEngineRef.current.processFrame(button.id, deltaTime);
            
            if (Math.abs(force) > 0.01) {
                const currentValue = x.get();
                const newX = currentValue + force * deltaTime;
                x.set(newX);
            }

            // Verifica wrap-around
            const wrapResult = physicsEngineRef.current.checkWrapAround(button.id);
            if (wrapResult.shouldWrap) {
                x.set(wrapResult.wrapPosition);
                // Atualiza posição de repouso após wrap
                physicsStateRef.current.restPosition = wrapResult.newRestPosition;
                physicsEngineRef.current.updateRestPosition(button.id, wrapResult.newRestPosition);
            }
        });

        const buttonContent = (
            <motion.div
                drag="x"
                dragElastic={0}
                dragMomentum={true}
                dragTransition={{ 
                    bounceStiffness: physicsConfig.springStiffness,
                    bounceDamping: physicsConfig.springDamping
                }}
                onDragStart={(_, info) => {
                    physicsStateRef.current.isDragging = true;
                    physicsStateRef.current.velocity = 0;
                }}
                onDrag={(_, info) => {
                    const currentX = xSpring.get();
                    const newX = currentX + info.delta.x;
                    x.set(newX);
                }}
                onDragEnd={(_, info) => {
                    physicsStateRef.current.isDragging = false;
                    
                    // Aplica inércia individual com transferência de momentum
                    const velocity = info.velocity.x;
                    if (Math.abs(velocity) > 50) {
                        physicsStateRef.current.velocity = velocity;
                        if (physicsEngineRef.current) {
                            physicsEngineRef.current.updateVelocity(button.id, velocity);
                        }
                        
                        const currentX = xSpring.get();
                        const targetX = currentX + (velocity * 0.15);
                        animate(x, targetX, {
                            type: 'spring',
                            stiffness: physicsConfig.springStiffness,
                            damping: physicsConfig.springDamping,
                            velocity: velocity
                        });
                    }
                }}
                style={{
                    x: xSpring,
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

            {/* CONTAINER DE BOTÕES COM FÍSICA DE COLISÃO */}
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
                        physicsConfig={physicsConfig}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Exportação do componente
 */
export const CollisionPhysicsFooter = CollisionPhysicsFooterBase;

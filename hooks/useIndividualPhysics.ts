// hooks/useIndividualPhysics.ts
import { useMotionValue, useSpring, useAnimationFrame } from 'framer-motion';
import { useRef, useCallback } from 'react';

/**
 * Configuração de física para um botão individual
 */
export interface PhysicsConfig {
    stiffness: number;
    damping: number;
    mass: number;
    repulsionStrength: number;
    minDistance: number;
}

/**
 * Estado de movimento de um botão individual
 */
export interface ButtonPhysicsState {
    x: ReturnType<typeof useMotionValue<number>>;
    xSpring: ReturnType<typeof useSpring>;
    velocityRef: React.MutableRefObject<number>;
    isDraggingRef: React.MutableRefObject<boolean>;
    dragStartXRef: React.MutableRefObject<number>;
}

/**
 * Hook customizado para gerenciar física individual de cada botão
 * 
 * Cada botão tem sua própria instância de useMotionValue e useSpring,
 * permitindo movimento independente com física de molas.
 */
export function useIndividualPhysics(
    initialX: number,
    config: PhysicsConfig
): ButtonPhysicsState {
    const x = useMotionValue(initialX);
    const xSpring = useSpring(x, {
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass
    });

    const velocityRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);
    const dragStartXRef = useRef<number>(0);
    const lastXRef = useRef<number>(initialX);

    // Atualiza velocidade baseado na mudança de posição
    useAnimationFrame(() => {
        const currentX = xSpring.get();
        const deltaX = currentX - lastXRef.current;
        velocityRef.current = deltaX * 16; // Aproximação de velocidade (60fps)
        lastXRef.current = currentX;
    });

    return {
        x,
        xSpring,
        velocityRef,
        isDraggingRef,
        dragStartXRef
    };
}

/**
 * Calcula força de repulsão entre dois botões
 * 
 * @param button1X Posição X do primeiro botão
 * @param button2X Posição X do segundo botão
 * @param minDistance Distância mínima entre botões
 * @param repulsionStrength Força de repulsão
 * @returns Força aplicada ao primeiro botão
 */
export function calculateRepulsionForce(
    button1X: number,
    button2X: number,
    minDistance: number,
    repulsionStrength: number
): number {
    const distance = Math.abs(button1X - button2X);
    
    if (distance < minDistance) {
        const overlap = minDistance - distance;
        const direction = button1X < button2X ? -1 : 1;
        return direction * overlap * repulsionStrength;
    }
    
    return 0;
}

/**
 * Aplica wrap-around quando botão sai da borda
 * 
 * @param currentX Posição atual X
 * @param containerWidth Largura do container
 * @param buttonWidth Largura do botão
 * @returns Nova posição X após wrap
 */
export function applyWrapAround(
    currentX: number,
    containerWidth: number,
    buttonWidth: number
): number {
    const halfButton = buttonWidth / 2;
    
    // Se saiu pela direita
    if (currentX > containerWidth + halfButton) {
        return -halfButton;
    }
    
    // Se saiu pela esquerda
    if (currentX < -halfButton) {
        return containerWidth + halfButton;
    }
    
    return currentX;
}

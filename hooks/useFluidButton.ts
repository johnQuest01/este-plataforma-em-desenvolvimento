// hooks/useFluidButton.ts
import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useRef, useEffect } from 'react';

/**
 * Configuração de física fluida para botão
 */
export interface FluidButtonConfig {
    stiffness: number;
    damping: number;
    mass: number;
    dragResistance: number; // Fator de resistência ao arrasto (0-1)
    scaleMagnification: number; // Escala quando pressionado
    squashStretchIntensity: number; // Intensidade do squash and stretch
}

/**
 * Estado de física fluida de um botão
 */
export interface FluidButtonState {
    x: MotionValue<number>;
    xSpring: MotionValue<number>;
    dragResistanceValue: MotionValue<number>;
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
    isPressedRef: React.MutableRefObject<boolean>;
    dragDelta: MotionValue<number>;
}

/**
 * Hook customizado para gerenciar física fluida de botão (watchOS style)
 * 
 * Implementa:
 * - Rubber Banding: resistência elástica ao arrasto
 * - Scale Magnification: aumento ao pressionar
 * - Squash and Stretch: deformação na direção do arrasto
 */
export function useFluidButton(
    initialX: number,
    config: FluidButtonConfig
): FluidButtonState {
    // Motion values para posição
    const x = useMotionValue(initialX);
    const dragDelta = useMotionValue(0);
    
    // Spring para animação suave
    const xSpring = useSpring(x, {
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass
    });

    // Rubber Banding: mapeamento não-linear com resistência
    const dragResistanceValue = useTransform(dragDelta, (latestDelta) => {
        // Função não-linear para criar efeito de "elástico"
        // Quanto mais arrasta, mais resistência
        const absDelta = Math.abs(latestDelta);
        const resistanceFactor = 1 - (1 / (1 + absDelta * config.dragResistance));
        return latestDelta * resistanceFactor;
    });

    // Estado de pressão
    const isPressedRef = useRef<boolean>(false);

    // Scale Magnification: aumenta quando pressionado
    const baseScale = 1;
    const pressedScale = baseScale * config.scaleMagnification;
    
    const scaleX = useTransform(dragDelta, (latestDelta) => {
        if (!isPressedRef.current) return baseScale;
        
        // Squash and Stretch: estica na direção do arrasto
        const stretchFactor = Math.abs(latestDelta) * config.squashStretchIntensity;
        const direction = latestDelta > 0 ? 1 : -1;
        
        // Aumenta escala base quando pressionado
        const baseStretch = pressedScale;
        
        // Adiciona deformação na direção do arrasto
        if (direction > 0) {
            // Estica para direita (scaleX aumenta)
            return Math.min(baseStretch + stretchFactor, baseStretch * 1.2);
        } else {
            // Comprime para esquerda (scaleX diminui)
            return Math.max(baseStretch - stretchFactor, baseStretch * 0.8);
        }
    });

    const scaleY = useTransform(dragDelta, (latestDelta) => {
        if (!isPressedRef.current) return baseScale;
        
        const stretchFactor = Math.abs(latestDelta) * config.squashStretchIntensity;
        const direction = latestDelta > 0 ? 1 : -1;
        
        const baseStretch = pressedScale;
        
        // Efeito oposto ao scaleX para criar squash and stretch
        if (direction > 0) {
            // Comprime verticalmente quando estica horizontalmente
            return Math.max(baseStretch - stretchFactor, baseStretch * 0.8);
        } else {
            // Estica verticalmente quando comprime horizontalmente
            return Math.min(baseStretch + stretchFactor, baseStretch * 1.2);
        }
    });

    return {
        x,
        xSpring,
        dragResistanceValue,
        scaleX,
        scaleY,
        isPressedRef,
        dragDelta
    };
}

/**
 * Calcula posição visual com rubber banding aplicado
 */
export function applyRubberBanding(
    rawPosition: number,
    resistanceFactor: number
): number {
    // Função não-linear para criar efeito de elástico
    const absPosition = Math.abs(rawPosition);
    const resistance = 1 - (1 / (1 + absPosition * resistanceFactor));
    return rawPosition * resistance;
}

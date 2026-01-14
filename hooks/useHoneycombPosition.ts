// hooks/useHoneycombPosition.ts
'use client';

import { useRef, useEffect } from 'react';
import { useMotionValue, useTransform, MotionValue, useAnimationFrame } from 'framer-motion';

interface HoneycombPositionConfig {
    maxDistance: number;
    scaleRange: { min: number; max: number };
    yOffsetRange: { min: number; max: number };
    opacityRange: { min: number; max: number };
}

interface HoneycombPositionResult {
    distance: MotionValue<number>;
    scale: MotionValue<number>;
    yOffset: MotionValue<number>;
    opacity: MotionValue<number>;
    normalizedDistance: MotionValue<number>;
}

/**
 * useHoneycombPosition: Hook para calcular efeito Fisheye/Honeycomb
 * 
 * Calcula dinamicamente a distância de um item em relação ao centro do container,
 * e mapeia essa distância para scale, y offset e opacity usando curvas não-lineares.
 * 
 * @param buttonRef - Referência do elemento do botão
 * @param containerRef - Referência do container pai
 * @param containerX - MotionValue da posição X do container (para rastrear drag)
 * @param config - Configuração do efeito fisheye
 * @returns Objeto com MotionValues para distance, scale, yOffset e opacity
 */
export function useHoneycombPosition(
    buttonRef: React.RefObject<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement>,
    containerX: MotionValue<number>,
    config: HoneycombPositionConfig
): HoneycombPositionResult {
    // MotionValue para rastrear a distância do centro
    const distance = useMotionValue(0);
    
    // Atualiza a distância em cada frame usando useAnimationFrame
    useAnimationFrame(() => {
        if (!buttonRef.current || !containerRef.current) {
            distance.set(config.maxDistance);
            return;
        }
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Posição do centro do botão relativa ao container
        const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
        // Posição do centro fixo do container
        const containerCenterX = containerRect.width / 2;
        
        // Distância absoluta do centro do botão até o centro do container
        const currentDistance = Math.abs(buttonCenterX - containerCenterX);
        distance.set(currentDistance);
    });
    
    // Normaliza a distância para o range [0, 1] onde 0 = centro, 1 = borda
    const normalizedDistance = useTransform(distance, (dist) => {
        const normalized = Math.min(dist / config.maxDistance, 1);
        return normalized;
    });
    
    // Função de interpolação não-linear (curva gaussiana acentuada)
    const gaussianInterpolation = (t: number, sharpness: number = 2): number => {
        // Curva exponencial para efeito mais acentuado no centro
        return Math.exp(-Math.pow(t * sharpness, 2));
    };
    
    // Mapeia distância normalizada para scale (1.0 a 1.8)
    const scale = useTransform(normalizedDistance, (normalized) => {
        const gaussian = gaussianInterpolation(normalized, 2.5);
        const scaleValue = config.scaleRange.min + 
            (config.scaleRange.max - config.scaleRange.min) * gaussian;
        return scaleValue;
    });
    
    // Mapeia distância normalizada para y offset (efeito de arco)
    const yOffset = useTransform(normalizedDistance, (normalized) => {
        const gaussian = gaussianInterpolation(normalized, 2.5);
        const yValue = config.yOffsetRange.min + 
            (config.yOffsetRange.max - config.yOffsetRange.min) * (1 - gaussian);
        return yValue;
    });
    
    // Mapeia distância normalizada para opacity
    const opacity = useTransform(normalizedDistance, (normalized) => {
        const gaussian = gaussianInterpolation(normalized, 2);
        const opacityValue = config.opacityRange.min + 
            (config.opacityRange.max - config.opacityRange.min) * gaussian;
        return opacityValue;
    });
    
    return {
        distance,
        scale,
        yOffset,
        opacity,
        normalizedDistance
    };
}

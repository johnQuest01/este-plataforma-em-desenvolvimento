// lib/physics/RepulsionEngine.ts
import { useMotionValue, MotionValue, useAnimationFrame } from 'framer-motion';
import { useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Configuração do motor de repulsão
 */
export interface RepulsionConfig {
    buttonSize: number;
    repulsionRadius: number;
    repulsionStrength: number;
    attractionStrength: number;
    dampingFactor: number;
    padding: number;
    containerWidth: number;
}

/**
 * Estado físico de um botão individual
 */
export interface ButtonPhysicsState {
    x: MotionValue<number>;
    vx: MotionValue<number>;
    targetX: number;
    isDragging: boolean;
    dragStartX: number;
}

/**
 * Hook customizado para gerenciar física distribuída de múltiplos botões
 * 
 * Implementa:
 * - Força de atração: botões tentam voltar para posição ideal
 * - Campo de repulsão: efeito "sabonete" - empurra quando muito perto
 * - Amortecimento: fricção para movimento suave
 * - Infinite wrap: teletransporte quando sai da tela
 */
export function useDistributedPhysics(
    buttonCount: number,
    config: RepulsionConfig
): {
    buttonStates: ButtonPhysicsState[];
    startDrag: (buttonIndex: number, startX: number) => void;
    updateDrag: (buttonIndex: number, currentX: number) => void;
    endDrag: (buttonIndex: number, velocity: number) => void;
} {
    // Cria MotionValues para todos os botões (fora de loops)
    const motionValues = useMemo(() => {
        const values: Array<{ x: MotionValue<number>; vx: MotionValue<number> }> = [];
        for (let i = 0; i < buttonCount; i++) {
            values.push({
                x: useMotionValue(0),
                vx: useMotionValue(0)
            });
        }
        return values;
    }, [buttonCount]);

    // Array de estados físicos para cada botão
    const buttonStatesRef = useRef<ButtonPhysicsState[]>([]);
    
    // Inicializa estados físicos
    useEffect(() => {
        if (config.containerWidth === 0 || buttonCount === 0 || motionValues.length === 0) {
            buttonStatesRef.current = [];
            return;
        }
        
        const states: ButtonPhysicsState[] = [];
        const spacing = config.containerWidth / (buttonCount + 1);
        
        for (let i = 0; i < buttonCount; i++) {
            const targetX = spacing * (i + 1);
            const motionValue = motionValues[i];
            
            // Inicializa valores
            motionValue.x.set(targetX);
            motionValue.vx.set(0);
            
            states.push({
                x: motionValue.x,
                vx: motionValue.vx,
                targetX,
                isDragging: false,
                dragStartX: 0
            });
        }
        
        buttonStatesRef.current = states;
    }, [buttonCount, config.containerWidth, motionValues]);

    // Calcula força de repulsão entre dois botões
    const calculateRepulsionForce = useCallback((
        button1X: number,
        button2X: number,
        config: RepulsionConfig
    ): number => {
        const distance = Math.abs(button1X - button2X);
        const minDistance = config.repulsionRadius;
        
        if (distance < minDistance && distance > 0) {
            // Força inversamente proporcional à proximidade (efeito "sabonete")
            const overlap = minDistance - distance;
            const direction = button1X < button2X ? -1 : 1;
            // Curva não-linear para efeito mais suave
            const forceMagnitude = (overlap / minDistance) * config.repulsionStrength;
            return direction * forceMagnitude;
        }
        
        return 0;
    }, []);

    // Calcula força de atração para posição ideal
    const calculateAttractionForce = useCallback((
        currentX: number,
        targetX: number,
        config: RepulsionConfig
    ): number => {
        const displacement = targetX - currentX;
        return displacement * config.attractionStrength;
    }, []);

    // Aplica infinite wrap quando botão sai da tela
    const applyInfiniteWrap = useCallback((
        x: number,
        config: RepulsionConfig,
        buttonCount: number
    ): { wrappedX: number; newTargetX: number } => {
        const leftBound = -config.padding;
        const rightBound = config.containerWidth + config.padding;
        
        let wrappedX = x;
        let newTargetX = 0;
        
        if (x < leftBound) {
            wrappedX = rightBound;
            const spacing = config.containerWidth / (buttonCount + 1);
            newTargetX = spacing * buttonCount;
        } else if (x > rightBound) {
            wrappedX = leftBound;
            const spacing = config.containerWidth / (buttonCount + 1);
            newTargetX = spacing;
        } else {
            newTargetX = x; // Mantém target atual
        }
        
        return { wrappedX, newTargetX };
    }, []);

    // Loop de simulação física (useAnimationFrame)
    useAnimationFrame(() => {
        const states = buttonStatesRef.current;
        if (states.length === 0 || config.containerWidth === 0) return;

        states.forEach((state, index) => {
            // Pula botão que está sendo arrastado
            if (state.isDragging) return;

            const currentX = state.x.get();
            const currentVx = state.vx.get();

            let totalForce = 0;

            // 1. Força de atração (voltar para posição ideal)
            const attractionForce = calculateAttractionForce(
                currentX,
                state.targetX,
                config
            );
            totalForce += attractionForce;

            // 2. Campo de repulsão (efeito "sabonete")
            states.forEach((otherState, otherIndex) => {
                if (otherIndex === index || otherState.isDragging) return;
                
                const otherX = otherState.x.get();
                const repulsionForce = calculateRepulsionForce(
                    currentX,
                    otherX,
                    config
                );
                totalForce += repulsionForce;
            });

            // 3. Aplica força para atualizar velocidade
            const newVx = currentVx + totalForce;
            
            // 4. Amortecimento (fricção - multiplica por fator < 1)
            const dampedVx = newVx * config.dampingFactor;
            state.vx.set(dampedVx);

            // 5. Atualiza posição baseado na velocidade
            const newX = currentX + dampedVx;
            
            // 6. Infinite wrap
            const wrapResult = applyInfiniteWrap(newX, config, buttonCount);
            if (wrapResult.wrappedX !== newX) {
                state.x.set(wrapResult.wrappedX);
                state.targetX = wrapResult.newTargetX;
            } else {
                state.x.set(newX);
            }
        });
    });

    // Handlers para drag
    const startDrag = useCallback((buttonIndex: number, startX: number): void => {
        const state = buttonStatesRef.current[buttonIndex];
        if (!state) return;
        
        state.isDragging = true;
        state.dragStartX = startX;
        state.vx.set(0); // Reseta velocidade ao começar drag
    }, []);

    const updateDrag = useCallback((buttonIndex: number, currentX: number): void => {
        const state = buttonStatesRef.current[buttonIndex];
        if (!state || !state.isDragging) return;
        
        // Atualiza posição diretamente durante drag
        state.x.set(currentX);
    }, []);

    const endDrag = useCallback((buttonIndex: number, velocity: number): void => {
        const state = buttonStatesRef.current[buttonIndex];
        if (!state) return;
        
        state.isDragging = false;
        // Aplica velocidade inicial ao soltar
        state.vx.set(velocity);
    }, []);

    return {
        buttonStates: buttonStatesRef.current,
        startDrag,
        updateDrag,
        endDrag
    };
}

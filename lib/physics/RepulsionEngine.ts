import { motionValue, MotionValue, useAnimationFrame } from 'framer-motion';
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
    // 1. Cria MotionValues estáveis (preservam estado entre renders)
    const motionValues = useMemo(() => {
        const values: Array<{ x: MotionValue<number>; vx: MotionValue<number> }> = [];
        for (let i = 0; i < buttonCount; i++) {
            values.push({
                x: motionValue(0),
                vx: motionValue(0)
            });
        }
        return values;
    }, [buttonCount]);

    // 2. Constrói a estrutura de estado declarativamente (Safe for Render)
    const buttonStates = useMemo(() => {
        if (config.containerWidth === 0 || buttonCount === 0) return [];

        const spacing = config.containerWidth / (buttonCount + 1);
        
        return motionValues.map((mv, i) => ({
            x: mv.x,
            vx: mv.vx,
            targetX: spacing * (i + 1),
            isDragging: false, // Reseta drag apenas se containerWidth/count mudar (resize)
            dragStartX: 0
        }));
    }, [buttonCount, config.containerWidth, motionValues]);

    // 3. Ref para acesso dentro do loop de animação (evita stale closures)
    const statesRef = useRef<ButtonPhysicsState[]>(buttonStates);

    // Sincroniza Ref e inicializa posições quando a estrutura muda
    useEffect(() => {
        statesRef.current = buttonStates;

        // Inicializa posições (snap) quando o layout muda
        buttonStates.forEach(state => {
            // Apenas define se estiver muito longe (primeira renderização ou resize brusco)
            // Opcional: pode-se remover essa verificação para forçar snap sempre
            if (state.x.get() === 0) {
                state.x.set(state.targetX);
                state.vx.set(0);
            }
        });
    }, [buttonStates]);

    // Calcula força de repulsão entre dois botões
    const calculateRepulsionForce = useCallback((
        button1X: number,
        button2X: number,
        config: RepulsionConfig
    ): number => {
        const distance = Math.abs(button1X - button2X);
        const minDistance = config.repulsionRadius;
        
        if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance;
            const direction = button1X < button2X ? -1 : 1;
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

    // Aplica infinite wrap
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
            newTargetX = x;
        }
        
        return { wrappedX, newTargetX };
    }, []);

    // Loop de simulação física
    useAnimationFrame(() => {
        // Lê do Ref para garantir acesso aos dados mais recentes sem re-render
        const states = statesRef.current;
        if (states.length === 0 || config.containerWidth === 0) return;

        states.forEach((state, index) => {
            if (state.isDragging) return;

            const currentX = state.x.get();
            const currentVx = state.vx.get();

            let totalForce = 0;

            // 1. Atração
            totalForce += calculateAttractionForce(currentX, state.targetX, config);

            // 2. Repulsão
            states.forEach((otherState, otherIndex) => {
                if (otherIndex === index || otherState.isDragging) return;
                totalForce += calculateRepulsionForce(currentX, otherState.x.get(), config);
            });

            // 3. Integração
            const newVx = currentVx + totalForce;
            const dampedVx = newVx * config.dampingFactor;
            state.vx.set(dampedVx);

            const newX = currentX + dampedVx;
            
            // 4. Wrap
            const wrapResult = applyInfiniteWrap(newX, config, buttonCount);
            if (wrapResult.wrappedX !== newX) {
                state.x.set(wrapResult.wrappedX);
                state.targetX = wrapResult.newTargetX;
            } else {
                state.x.set(newX);
            }
        });
    });

    // Handlers para drag (Usam statesRef para garantir consistência)
    const startDrag = useCallback((buttonIndex: number, startX: number): void => {
        const state = statesRef.current[buttonIndex];
        if (!state) return;
        
        state.isDragging = true;
        state.dragStartX = startX;
        state.vx.set(0);
    }, []);

    const updateDrag = useCallback((buttonIndex: number, currentX: number): void => {
        const state = statesRef.current[buttonIndex];
        if (!state || !state.isDragging) return;
        
        state.x.set(currentX);
    }, []);

    const endDrag = useCallback((buttonIndex: number, velocity: number): void => {
        const state = statesRef.current[buttonIndex];
        if (!state) return;
        
        state.isDragging = false;
        state.vx.set(velocity);
    }, []);

    // Retorna o valor memoizado (seguro para render)
    return {
        buttonStates,
        startDrag,
        updateDrag,
        endDrag
    };
}
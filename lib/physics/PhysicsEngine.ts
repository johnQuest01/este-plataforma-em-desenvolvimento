// lib/physics/PhysicsEngine.ts
import { MotionValue } from 'framer-motion';

/**
 * Configuração de física para simulação de colisão
 */
export interface CollisionPhysicsConfig {
    buttonWidth: number;
    minDistance: number;
    repulsionStrength: number;
    springStiffness: number;
    springDamping: number;
    springMass: number;
    momentumTransfer: number;
    wrapAroundEnabled: boolean;
}

/**
 * Estado físico de um botão individual
 */
export interface ButtonPhysicsState {
    x: MotionValue<number>;
    restPosition: number;
    velocity: number;
    isDragging: boolean;
    mass: number;
}

/**
 * Resultado de cálculo de colisão
 */
export interface CollisionResult {
    force: number;
    shouldWrap: boolean;
    wrapPosition: number;
}

/**
 * PhysicsEngine: Motor de física para detecção de colisão e repulsão
 * 
 * Implementa física de colisão individual sem containers,
 * com detecção em tempo real e transferência de momentum.
 */
export class PhysicsEngine {
    private config: CollisionPhysicsConfig;
    private buttons: Map<string, ButtonPhysicsState>;
    private containerWidth: number;

    constructor(config: CollisionPhysicsConfig, containerWidth: number) {
        this.config = config;
        this.containerWidth = containerWidth;
        this.buttons = new Map();
    }

    /**
     * Registra um botão no sistema de física
     */
    registerButton(buttonId: string, state: ButtonPhysicsState): void {
        this.buttons.set(buttonId, state);
    }

    /**
     * Remove um botão do sistema de física
     */
    unregisterButton(buttonId: string): void {
        this.buttons.delete(buttonId);
    }

    /**
     * Atualiza largura do container
     */
    updateContainerWidth(width: number): void {
        this.containerWidth = width;
    }

    /**
     * Calcula força de repulsão entre dois botões
     */
    private calculateRepulsionForce(
        button1X: number,
        button2X: number,
        button1State: ButtonPhysicsState,
        button2State: ButtonPhysicsState
    ): number {
        const distance = Math.abs(button1X - button2X);
        
        if (distance < this.config.minDistance && distance > 0) {
            const overlap = this.config.minDistance - distance;
            const direction = button1X < button2X ? -1 : 1;
            
            // Força proporcional à massa e overlap
            const baseForce = overlap * this.config.repulsionStrength;
            const massFactor = button2State.mass / (button1State.mass + button2State.mass);
            
            return direction * baseForce * massFactor;
        }
        
        return 0;
    }

    /**
     * Calcula transferência de momentum entre dois botões
     */
    private calculateMomentumTransfer(
        button1State: ButtonPhysicsState,
        button2State: ButtonPhysicsState,
        button1X: number,
        button2X: number
    ): { button1Force: number; button2Force: number } {
        const distance = Math.abs(button1X - button2X);
        
        if (distance < this.config.minDistance && distance > 0) {
            const relativeVelocity = button1State.velocity - button2State.velocity;
            const direction = button1X < button2X ? -1 : 1;
            
            // Transferência de momentum (conservação)
            const totalMass = button1State.mass + button2State.mass;
            const transfer = relativeVelocity * this.config.momentumTransfer;
            
            const button1Force = -direction * transfer * (button2State.mass / totalMass);
            const button2Force = direction * transfer * (button1State.mass / totalMass);
            
            return { button1Force, button2Force };
        }
        
        return { button1Force: 0, button2Force: 0 };
    }

    /**
     * Calcula wrap-around para um botão que saiu da tela
     * Mantém a ordem relativa dos botões após wrap
     */
    private calculateWrapAround(
        currentX: number,
        buttonId: string
    ): { shouldWrap: boolean; wrapPosition: number; newRestPosition: number } {
        if (!this.config.wrapAroundEnabled) {
            return { shouldWrap: false, wrapPosition: currentX, newRestPosition: currentX };
        }

        const halfButton = this.config.buttonWidth / 2;
        const buttonState = this.buttons.get(buttonId);
        const currentRestPosition = buttonState?.restPosition ?? currentX;
        
        // Saiu pela direita
        if (currentX > this.containerWidth + halfButton) {
            // Reposiciona no lado esquerdo, mantendo ordem
            const buttonsArray = Array.from(this.buttons.entries());
            const currentIndex = buttonsArray.findIndex(([id]) => id === buttonId);
            
            // Encontra o botão mais à esquerda
            let leftmostX = Infinity;
            buttonsArray.forEach(([id, state]) => {
                if (id !== buttonId) {
                    const x = state.x.get();
                    if (x < leftmostX) {
                        leftmostX = x;
                    }
                }
            });
            
            const wrapPosition = leftmostX !== Infinity ? leftmostX - this.config.minDistance : -halfButton;
            const newRestPosition = wrapPosition;
            
            return { 
                shouldWrap: true, 
                wrapPosition,
                newRestPosition
            };
        }
        
        // Saiu pela esquerda
        if (currentX < -halfButton) {
            // Reposiciona no lado direito, mantendo ordem
            const buttonsArray = Array.from(this.buttons.entries());
            
            // Encontra o botão mais à direita
            let rightmostX = -Infinity;
            buttonsArray.forEach(([id, state]) => {
                if (id !== buttonId) {
                    const x = state.x.get();
                    if (x > rightmostX) {
                        rightmostX = x;
                    }
                }
            });
            
            const wrapPosition = rightmostX !== -Infinity ? rightmostX + this.config.minDistance : this.containerWidth + halfButton;
            const newRestPosition = wrapPosition;
            
            return { 
                shouldWrap: true, 
                wrapPosition,
                newRestPosition
            };
        }
        
        return { shouldWrap: false, wrapPosition: currentX, newRestPosition: currentRestPosition };
    }

    /**
     * Calcula força de spring para retornar à posição de repouso
     */
    private calculateSpringForce(
        currentX: number,
        restPosition: number,
        velocity: number
    ): number {
        const displacement = currentX - restPosition;
        const springForce = -displacement * this.config.springStiffness;
        const dampingForce = -velocity * this.config.springDamping;
        
        return springForce + dampingForce;
    }

    /**
     * Processa física de um frame (chamado via useAnimationFrame)
     * 
     * @param buttonId ID do botão sendo processado
     * @param deltaTime Tempo desde o último frame (em segundos)
     * @returns Força total a ser aplicada ao botão
     */
    processFrame(buttonId: string, deltaTime: number): number {
        const buttonState = this.buttons.get(buttonId);
        if (!buttonState) return 0;

        const currentX = buttonState.x.get();
        
        // Se está sendo arrastado, não aplica física
        if (buttonState.isDragging) {
            return 0;
        }

        let totalForce = 0;

        // 1. Calcula repulsão de todos os outros botões
        this.buttons.forEach((otherState, otherId) => {
            if (otherId === buttonId) return;
            
            const otherX = otherState.x.get();
            const repulsionForce = this.calculateRepulsionForce(
                currentX,
                otherX,
                buttonState,
                otherState
            );
            totalForce += repulsionForce;

            // 2. Calcula transferência de momentum
            const momentum = this.calculateMomentumTransfer(
                buttonState,
                otherState,
                currentX,
                otherX
            );
            totalForce += momentum.button1Force;
        });

        // 3. Calcula força de spring para retornar à posição de repouso
        const springForce = this.calculateSpringForce(
            currentX,
            buttonState.restPosition,
            buttonState.velocity
        );
        totalForce += springForce * deltaTime;

        return totalForce;
    }

    /**
     * Verifica e aplica wrap-around para um botão
     */
    checkWrapAround(buttonId: string): { shouldWrap: boolean; wrapPosition: number; newRestPosition: number } {
        const buttonState = this.buttons.get(buttonId);
        if (!buttonState) {
            return { shouldWrap: false, wrapPosition: 0, newRestPosition: 0 };
        }

        const currentX = buttonState.x.get();
        return this.calculateWrapAround(currentX, buttonId);
    }

    /**
     * Atualiza posição de repouso de um botão
     */
    updateRestPosition(buttonId: string, newRestPosition: number): void {
        const buttonState = this.buttons.get(buttonId);
        if (buttonState) {
            buttonState.restPosition = newRestPosition;
        }
    }

    /**
     * Atualiza velocidade de um botão
     */
    updateVelocity(buttonId: string, velocity: number): void {
        const buttonState = this.buttons.get(buttonId);
        if (buttonState) {
            buttonState.velocity = velocity;
        }
    }

    /**
     * Obtém estado de um botão
     */
    getButtonState(buttonId: string): ButtonPhysicsState | undefined {
        return this.buttons.get(buttonId);
    }
}

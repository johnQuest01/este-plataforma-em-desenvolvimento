// path: src/hooks/use-guardian-store.ts
import { create } from 'zustand';
import { RuntimeTracker } from '@/schemas/guardian-runtime-schema';

interface GuardianRuntimeState {
  activeRuntimeElements: Map<string, RuntimeTracker>;
  registerElement: (element: RuntimeTracker) => void;
  unregisterElement: (elementId: string) => void;
  // Mantemos o estado existente do Guardian OS
  isOpen: boolean;
  toggle: () => void;
}

export const useGuardianStore = create<GuardianRuntimeState>((set) => ({
  activeRuntimeElements: new Map(),
  isOpen: false,
  
  registerElement: (element) => set((state) => {
    const newMap = new Map(state.activeRuntimeElements);
    newMap.set(element.elementId, element);
    return { activeRuntimeElements: newMap };
  }),

  unregisterElement: (elementId) => set((state) => {
    const newMap = new Map(state.activeRuntimeElements);
    newMap.delete(elementId);
    return { activeRuntimeElements: newMap };
  }),

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
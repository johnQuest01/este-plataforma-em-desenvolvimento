// path: src/hooks/use-guardian-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemePreference } from '@/schemas/user-preferences-schema';
import { DiagnosticLayer } from '@/schemas/guardian-schema';
import { RuntimeTracker, ComponentNode } from '@/schemas/guardian-runtime-schema';

// ✅ ATUALIZAÇÃO: Adicionado 'CODE_MAP' explicitamente ao tipo
export type GuardianTab = 'SCANNER' | 'CODE_MAP' | 'DATABASE' | 'AUDIT' | 'HISTORY' | 'CONNECTIONS' | 'FILES';
export type GuardianFilter = DiagnosticLayer | 'ALL';

export interface SelectedFileState {
  name: string;
  type: 'UI' | 'LOGIC';
}

interface GuardianStore {
  isOpen: boolean;
  theme: ThemePreference;
  activeTab: GuardianTab;
  activeFilter: GuardianFilter;
  selectedFile: SelectedFileState | null;
 
  // Estado da Rota Ativa
  activeRuntimeElements: RuntimeTracker[];
  currentRouteStructure: ComponentNode | null;

  toggle: () => void;
  close: () => void;
  setTheme: (theme: ThemePreference) => void;
  setTab: (tab: GuardianTab) => void;
  setFilter: (filter: GuardianFilter) => void;
  selectFile: (file: SelectedFileState) => void;
  clearSelectedFile: () => void;
  registerElement: (element: RuntimeTracker) => void;
  unregisterElement: (elementId: string) => void;
 
  setRouteStructure: (structure: ComponentNode | null) => void;
}

export const useGuardianStore = create<GuardianStore>()(
  persist(
    (set) => ({
      isOpen: false,
      theme: 'system',
      activeTab: 'SCANNER',
      activeFilter: 'ALL',
      selectedFile: null,
      activeRuntimeElements: [],
      currentRouteStructure: null,

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      setTheme: (theme) => set({ theme }),
      setTab: (tab) => set({ activeTab: tab }),
      setFilter: (filter) => set({ activeFilter: filter }),
      selectFile: (file) => set({ selectedFile: file }),
      clearSelectedFile: () => set({ selectedFile: null }),

      registerElement: (element) => set((state) => {
        // Evita duplicatas
        const exists = state.activeRuntimeElements.find(e => e.elementId === element.elementId);
        if (exists) return state;
        return { activeRuntimeElements: [...state.activeRuntimeElements, element] };
      }),

      unregisterElement: (elementId) => set((state) => ({
        activeRuntimeElements: state.activeRuntimeElements.filter((e) => e.elementId !== elementId)
      })),

      setRouteStructure: (structure) => set({ currentRouteStructure: structure }),
    }),
    {
      name: 'guardian-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        theme: state.theme,
      }),
    }
  )
);
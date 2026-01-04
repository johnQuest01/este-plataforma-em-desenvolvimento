import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemePreference } from '@/schemas/user-preferences-schema';
import { DiagnosticLayer } from '@/schemas/guardian-schema';
import { RuntimeTracker } from '@/schemas/guardian-runtime-schema';

// Views aligned with MasterGuardianDashboard
export type GuardianTab = 'SCANNER' | 'DATABASE' | 'AUDIT' | 'HISTORY' | 'CONNECTIONS' | 'FILES';
export type GuardianFilter = DiagnosticLayer | 'ALL';

// Structure to maintain selected file state in detailed view
export interface SelectedFileState {
  name: string;
  type: 'UI' | 'LOGIC';
}

interface GuardianStore {
  // --- UI State ---
  isOpen: boolean;
  theme: ThemePreference;
 
  // --- Navigation State ---
  activeTab: GuardianTab;
  activeFilter: GuardianFilter;
  selectedFile: SelectedFileState | null;
 
  // --- REX RUNTIME STATE (Live DOM Data) ---
  // Stores elements currently mounted and monitored by RexRuntimePixel
  activeRuntimeElements: RuntimeTracker[];

  // --- Actions ---
  toggle: () => void;
  close: () => void;
  setTheme: (theme: ThemePreference) => void;
  setTab: (tab: GuardianTab) => void;
  setFilter: (filter: GuardianFilter) => void;
 
  // --- File Detail Actions ---
  selectFile: (file: SelectedFileState) => void;
  clearSelectedFile: () => void;

  // --- Runtime Actions (Called by RexRuntimePixel) ---
  registerElement: (element: RuntimeTracker) => void;
  unregisterElement: (elementId: string) => void;
}

export const useGuardianStore = create<GuardianStore>()(
  persist(
    (set) => ({
      // Initial State
      isOpen: false,
      theme: 'system',
      activeTab: 'SCANNER',
      activeFilter: 'ALL',
      selectedFile: null,
      activeRuntimeElements: [],

      // Actions
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
     
      setTheme: (theme) => set({ theme }),
     
      setTab: (tab) => set({ activeTab: tab }),
     
      setFilter: (filter) => set({ activeFilter: filter }),
     
      selectFile: (file) => set({ selectedFile: file }),
     
      clearSelectedFile: () => set({ selectedFile: null }),

      // --- Runtime Implementation ---
      registerElement: (element) => set((state) => {
        // Prevent duplicates
        const exists = state.activeRuntimeElements.find(e => e.elementId === element.elementId);
        if (exists) return state;
        return { activeRuntimeElements: [...state.activeRuntimeElements, element] };
      }),

      unregisterElement: (elementId) => set((state) => ({
        activeRuntimeElements: state.activeRuntimeElements.filter((e) => e.elementId !== elementId)
      })),
    }),
    {
      name: 'guardian-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist navigation state, but NEVER persist runtime elements (they are transient)
        activeTab: state.activeTab,
        theme: state.theme,
      }),
    }
  )
);
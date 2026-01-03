import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemePreference } from '@/schemas/user-preferences-schema';
import { DiagnosticLayer } from '@/schemas/guardian-schema';

// Views alinhadas com o MasterGuardianDashboard
export type GuardianTab = 'SCANNER' | 'DATABASE' | 'AUDIT' | 'HISTORY';
export type GuardianFilter = DiagnosticLayer | 'ALL';

// Estrutura para manter o estado do arquivo selecionado na visualização detalhada
export interface SelectedFileState {
  name: string;
  type: 'UI' | 'LOGIC';
}

interface GuardianStore {
  // UI State
  isOpen: boolean;
  theme: ThemePreference;
  
  // Navigation State
  activeTab: GuardianTab;
  activeFilter: GuardianFilter;
  selectedFile: SelectedFileState | null;
  
  // Actions
  toggle: () => void;
  close: () => void;
  setTheme: (theme: ThemePreference) => void;
  setTab: (tab: GuardianTab) => void;
  setFilter: (filter: GuardianFilter) => void;
  
  // File Detail Actions
  selectFile: (file: SelectedFileState) => void;
  clearSelectedFile: () => void;
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

      // Actions
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      
      setTheme: (theme) => set({ theme }),
      
      setTab: (tab) => set({ activeTab: tab }),
      
      setFilter: (filter) => set({ activeFilter: filter }),
      
      selectFile: (file) => set({ selectedFile: file }),
      
      clearSelectedFile: () => set({ selectedFile: null }),
    }),
    {
      name: 'guardian-storage-v2', // Versioned key to avoid conflicts
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        // Persist navigation state so the dev doesn't lose context on reload
        activeTab: state.activeTab,
        theme: state.theme,
        // We do NOT persist isOpen (always start closed) or selectedFile (start fresh)
      }), 
    }
  )
);
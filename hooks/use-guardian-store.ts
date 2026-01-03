import { create } from 'zustand';
import { ThemePreference } from '@/schemas/user-preferences-schema';
import { DiagnosticLayer } from '@/schemas/guardian-schema';

// Definição dos tipos de aba e filtro
export type GuardianTab = 'AUDIT' | 'MAP' | 'SETTINGS';
export type GuardianFilter = DiagnosticLayer | 'ALL';

interface GuardianStore {
  isOpen: boolean;
  theme: ThemePreference;
  activeTab: GuardianTab;
  activeFilter: GuardianFilter;
  
  toggle: () => void;
  setTheme: (theme: ThemePreference) => void;
  setTab: (tab: GuardianTab) => void;
  setFilter: (filter: GuardianFilter) => void;
}

export const useGuardianStore = create<GuardianStore>((set) => ({
  isOpen: false,
  theme: 'system',
  activeTab: 'AUDIT',
  activeFilter: 'ALL',

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setTheme: (theme) => set({ theme }),
  setTab: (tab) => set({ activeTab: tab }),
  setFilter: (filter) => set({ activeFilter: filter }),
}));
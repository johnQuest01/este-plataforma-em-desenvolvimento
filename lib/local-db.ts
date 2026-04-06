'use client';

export interface UserSessionData {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

const DATABASE_STORAGE_KEY = '@pos:user_session';

export const LocalDB = {
  /**
   * Guarda o utilizador retornado pelo Backend (Server Action)
   */
  setUser: (userData: UserSessionData): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('[LocalDB] Erro crítico ao guardar utilizador no armazenamento local:', error);
    }
  },

  /**
   * Recupera o utilizador para manter a sessão ativa
   */
  getUser: (): UserSessionData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const storedData = localStorage.getItem(DATABASE_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('[LocalDB] Erro crítico ao recuperar utilizador do armazenamento local:', error);
      return null;
    }
  },

  /**
   * Limpa os dados (Logout)
   */
  clearUser: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(DATABASE_STORAGE_KEY);
    } catch (error) {
      console.error('[LocalDB] Erro crítico ao limpar utilizador do armazenamento local:', error);
    }
  }
};
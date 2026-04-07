// lib/local-db.ts

'use client';

export interface UserData {
  id: string;
  type: 'fisica' | 'juridica';
  document: string;
  name: string;
  emailAddress?: string;
  storeName?: string;
  whatsapp: string;
  role?: string;
  isVendedor?: boolean;
  nameGender?: 'feminino' | 'masculino';
  createdAt: string;
}

const DB_KEY = 'b2b_app_user_db';

export const LocalDB = {
  // Salvar usuário (Cadastro)
  saveUser: (data: Omit<UserData, 'id' | 'createdAt'>) => {
    if (typeof window === 'undefined') return null;

    const newUser: UserData = {
      ...data,
      // CORREÇÃO: Fallback para funcionar em HTTP (IP de rede)
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(DB_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Recuperar usuário (Login Automático)
  getUser: (): UserData | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Limpar dados (Sair do App)
  clearUser: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DB_KEY);
  }
};
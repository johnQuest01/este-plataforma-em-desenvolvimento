'use client';

export interface UserData {
  id: string;
  type: 'fisica' | 'juridica';
  document: string;
  name: string;
  email: string;
  address: string;
  storeName?: string;
  whatsapp: string;
  isVendedor?: boolean;
  nameGender?: 'feminino' | 'masculino';
  createdAt: string;
}

const DB_KEY = 'b2b_app_user_db';

export const LocalDB = {
  saveUser: (data: Omit<UserData, 'id' | 'createdAt'>) => {
    if (typeof window === 'undefined') return null;

    const newUser: UserData = {
      ...data,
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(DB_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getUser: (): UserData | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearUser: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DB_KEY);
  }
};
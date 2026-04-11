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
  /** URL da foto de perfil (Neon/Prisma `User.profilePictureUrl`) */
  profilePictureUrl?: string | null;
  createdAt: string;
}

/** Vendedor no banco: `role === 'seller'`; sessão local também pode usar `isVendedor`. */
export function isSellerUser(user: UserData | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'seller') return true;
  return typeof user.isVendedor === 'boolean' && user.isVendedor === true;
}

export const LOCAL_USER_DB_KEY = 'b2b_app_user_db';
const DB_KEY = LOCAL_USER_DB_KEY;

/** Heurística simples para rótulos “Vendedor/Vendedora” e “Ativo/Ativa” (PT). */
export function inferNameGenderFromFullName(fullName: string): 'feminino' | 'masculino' {
  const raw = fullName.trim().split(/\s+/)[0] ?? '';
  if (raw.length < 2) return 'masculino';
  const first = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const maleEndingA = new Set(['luca', 'joshua']);
  if (maleEndingA.has(first)) return 'masculino';
  if (first.endsWith('a')) return 'feminino';
  return 'masculino';
}

type SaveUserInput = Omit<UserData, 'id' | 'createdAt'> & { prismaUserId?: string };

export const LocalDB = {
  // Salvar usuário (Cadastro)
  saveUser: (data: SaveUserInput) => {
    if (typeof window === 'undefined') return null;

    const { prismaUserId, ...rest } = data;
    const id =
      typeof prismaUserId === 'string' && prismaUserId.trim().length > 0
        ? prismaUserId.trim()
        : typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newUser: UserData = {
      ...rest,
      id,
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
  },

  /** Mescla campos na sessão local (ex.: após sync com Prisma). */
  updateUser: (partial: Partial<UserData>): UserData | null => {
    if (typeof window === 'undefined') return null;
    const current = LocalDB.getUser();
    if (!current) return null;
    const next: UserData = { ...current, ...partial };
    if (partial.role !== undefined) {
      next.isVendedor = partial.role === 'seller';
    }
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },
};
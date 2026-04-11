'use server';

import { prisma } from '@/lib/prisma';

export type SyncedUserProfile = {
  userId: string;
  userName: string;
  role: string;
  documentType: 'CPF' | 'CNPJ';
  documentNumber: string;
  emailAddress: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
};

export type SellerClientRow = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  dataCadastro: string;
};

/**
 * Alinha a sessão local com o usuário no Neon (role vendedor/comprador, nome, foto).
 */
export async function syncUserProfileForClientAction(
  userId: string
): Promise<{ success: boolean; data?: SyncedUserProfile; error?: string }> {
  try {
    const trimmed = typeof userId === 'string' ? userId.trim() : '';
    if (trimmed.length === 0) {
      return { success: false, error: 'Usuário inválido.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: trimmed },
      select: {
        id: true,
        name: true,
        role: true,
        document: true,
        documentType: true,
        email: true,
        whatsapp: true,
        profilePictureUrl: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        userName: user.name ?? 'Usuário',
        role: user.role,
        documentType: user.documentType === 'CNPJ' ? 'CNPJ' : 'CPF',
        documentNumber: user.document,
        emailAddress: user.email ?? '',
        phoneNumber: user.whatsapp ?? '',
        profilePictureUrl: user.profilePictureUrl ?? null,
      },
    };
  } catch (error) {
    console.error('[syncUserProfileForClientAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao sincronizar perfil.',
    };
  }
}

/**
 * Contatos derivados de pedidos nas lojas do vendedor (`Store.ownerId`).
 */
export async function getSellerClientsFromOrdersAction(
  sellerUserId: string
): Promise<{ success: boolean; clients: SellerClientRow[]; error?: string }> {
  try {
    const trimmed = typeof sellerUserId === 'string' ? sellerUserId.trim() : '';
    if (trimmed.length === 0) {
      return { success: false, clients: [], error: 'Vendedor inválido.' };
    }

    const stores = await prisma.store.findMany({
      where: { ownerId: trimmed },
      select: { id: true },
    });

    if (stores.length === 0) {
      return { success: true, clients: [] };
    }

    const storeIds = stores.map((s) => s.id);

    const orders = await prisma.order.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        createdAt: true,
      },
    });

    const seenPhones = new Set<string>();
    const clients: SellerClientRow[] = [];

    for (const order of orders) {
      const phoneDigits = (order.customerPhone ?? '').replace(/\D/g, '');
      const dedupeKey =
        phoneDigits.length >= 8 ? phoneDigits : `order-${order.id}`;

      if (seenPhones.has(dedupeKey)) continue;
      seenPhones.add(dedupeKey);

      const created = order.createdAt;
      const y = created.getFullYear();
      const m = String(created.getMonth() + 1).padStart(2, '0');
      const d = String(created.getDate()).padStart(2, '0');

      clients.push({
        id: dedupeKey,
        nome: (order.customerName ?? '').trim() || 'Cliente',
        telefone: order.customerPhone?.trim() || '—',
        dataCadastro: `${y}-${m}-${d}`,
      });
    }

    return { success: true, clients };
  } catch (error) {
    console.error('[getSellerClientsFromOrdersAction]', error);
    return {
      success: false,
      clients: [],
      error: error instanceof Error ? error.message : 'Erro ao listar clientes.',
    };
  }
}

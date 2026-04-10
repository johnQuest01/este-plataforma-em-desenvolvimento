'use server';

import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  DeleteRegisteredUserPayloadSchema,
  type DeleteRegisteredUserPayload,
} from '@/schemas/user-admin-schema';

export type ListedUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  document: string;
  documentType: string;
  role: string;
  address: string | null;
  street: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  createdAt: string;
};

const registeredUserListSelect = {
  id: true,
  name: true,
  email: true,
  whatsapp: true,
  document: true,
  documentType: true,
  role: true,
  address: true,
  street: true,
  addressNumber: true,
  addressComplement: true,
  district: true,
  city: true,
  state: true,
  postalCode: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type RegisteredUserListRecord = Prisma.UserGetPayload<{
  select: typeof registeredUserListSelect;
}>;

export type ListRegisteredUsersActionResult = {
  success: boolean;
  data?: ListedUserRow[];
  error?: string;
};

export type DeleteRegisteredUserActionResult = {
  success: boolean;
  error?: string;
};

function mapPrismaUserToListedRow(record: RegisteredUserListRecord): ListedUserRow {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    whatsapp: record.whatsapp,
    document: record.document,
    documentType: record.documentType,
    role: record.role,
    address: record.address,
    street: record.street,
    addressNumber: record.addressNumber,
    addressComplement: record.addressComplement,
    district: record.district,
    city: record.city,
    state: record.state,
    postalCode: record.postalCode,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function listRegisteredUsersAction(): Promise<ListRegisteredUsersActionResult> {
  try {
    const userRecords = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: registeredUserListSelect,
    });

    const listedRows: ListedUserRow[] = userRecords.map((record) =>
      mapPrismaUserToListedRow(record)
    );

    return {
      success: true,
      data: listedRows,
    };
  } catch (error) {
    console.error('[listRegisteredUsersAction]', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao listar utilizadores.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Remove o utilizador e dados ligados às suas lojas (pedidos, produtos, produção, etc.).
 * Não apaga utilizadores com role "admin".
 */
export async function deleteRegisteredUserByIdAction(
  payload: DeleteRegisteredUserPayload
): Promise<DeleteRegisteredUserActionResult> {
  const parsedPayload = DeleteRegisteredUserPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstIssueMessage = parsedPayload.error.issues[0]?.message;
    return {
      success: false,
      error:
        firstIssueMessage ??
        'Payload inválido para apagar utilizador.',
    };
  }

  const { userIdentifier } = parsedPayload.data;

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: userIdentifier },
      select: { id: true, role: true },
    });

    if (userRecord === null) {
      return { success: false, error: 'Utilizador não encontrado.' };
    }

    if (userRecord.role === 'admin') {
      return {
        success: false,
        error:
          'Não é permitido apagar contas de administrador por esta ação.',
      };
    }

    await prisma.$transaction(async (transaction) => {
      const ownedStores = await transaction.store.findMany({
        where: { ownerId: userIdentifier },
        select: { id: true },
      });
      const ownedStoreIdentifiers = ownedStores.map((store) => store.id);

      if (ownedStoreIdentifiers.length === 0) {
        await transaction.user.delete({ where: { id: userIdentifier } });
        return;
      }

      await transaction.productionItem.deleteMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
      });

      const storeOrders = await transaction.order.findMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
        select: { id: true },
      });
      const orderIdentifiers = storeOrders.map((order) => order.id);

      await transaction.orderItem.deleteMany({
        where: { orderId: { in: orderIdentifiers } },
      });
      await transaction.order.deleteMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
      });

      const storeProducts = await transaction.product.findMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
        select: { id: true },
      });
      const productIdentifiers = storeProducts.map((product) => product.id);

      await transaction.productVariant.deleteMany({
        where: { productId: { in: productIdentifiers } },
      });
      await transaction.product.deleteMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
      });

      await transaction.productionOrder.deleteMany({
        where: { storeId: { in: ownedStoreIdentifiers } },
      });

      await transaction.store.deleteMany({
        where: { ownerId: userIdentifier },
      });
      await transaction.user.delete({ where: { id: userIdentifier } });
    });

    revalidatePath('/admin/manage');

    return { success: true };
  } catch (error) {
    console.error('[deleteRegisteredUserByIdAction]', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao apagar utilizador.';
    return {
      success: false,
      error: message,
    };
  }
}

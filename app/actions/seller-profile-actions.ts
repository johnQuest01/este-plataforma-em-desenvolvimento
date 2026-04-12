'use server';

import { prisma } from '@/lib/prisma';
import { UpdateUserFieldSchema, type UpdateUserFieldType } from '@/schemas/blocks/seller-profile-schema';
import { revalidatePath } from 'next/cache';

export interface UserProfileInformation {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  address: string;
  document: string;
  documentType: string;
  profilePictureUrl: string | null;
  backgroundImageUrl: string | null;
  role: string;
}

export type GetUserProfileResult = {
  success: boolean;
  data?: UserProfileInformation;
  error?: string;
};

export async function getUserProfileInformationAction(userId: string): Promise<GetUserProfileResult> {
  try {
    if (!userId || userId.trim() === '') {
      return { success: false, error: 'ID de usuário inválido.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        address: true,
        document: true,
        documentType: true,
        profilePictureUrl: true,
        backgroundImageUrl: true,
        role: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado no banco de dados.' };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name ?? 'Não informado',
        email: user.email ?? 'Não informado',
        whatsapp: user.whatsapp ?? 'Não informado',
        address: user.address ?? 'Não informado',
        document: user.document,
        documentType: user.documentType,
        profilePictureUrl: user.profilePictureUrl,
        backgroundImageUrl: user.backgroundImageUrl,
        role: user.role,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro interno ao buscar perfil.' };
  }
}

export async function updateUserFieldAction(payload: UpdateUserFieldType): Promise<{ success: boolean; error?: string }> {
  try {
    const result = UpdateUserFieldSchema.safeParse(payload);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message };
    }

    const { userId, field, value } = result.data;

    // Uso obrigatório de prisma.$transaction para operações de escrita
    await prisma.$transaction(async (tx) => {
      const updateData: Record<string, string> = {};
      updateData[field] = value;

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });
    });

    revalidatePath('/account');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar dado.' };
  }
}
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserProfileUpdateSchema, type UserProfileUpdateType } from '@/schemas/user-profile-schema';
import { hashPlainPassword } from '@/lib/password-hash';

export interface StandardActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function updateUserProfileInformationAction(
  payload: UserProfileUpdateType
): Promise<StandardActionResponse<{ updatedUserId: string }>> {
  try {
    const validationResult = UserProfileUpdateSchema.safeParse(payload);
    
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0]?.message };
    }

    const validatedData = validationResult.data;

    const updatedUser = await prisma.$transaction(async (transactionalEntityManager) => {
      const existingUser = await transactionalEntityManager.user.findUnique({
        where: { id: validatedData.userId },
      });

      if (!existingUser) {
        throw new Error('Utilizador não encontrado no sistema.');
      }

      const updatePayload: Record<string, string> = {};

      if (validatedData.fullName) updatePayload.name = validatedData.fullName;
      if (validatedData.emailAddress) updatePayload.email = validatedData.emailAddress;
      if (validatedData.phoneNumber) updatePayload.whatsapp = validatedData.phoneNumber;
      if (validatedData.storeAddress) updatePayload.address = validatedData.storeAddress;
      if (validatedData.documentNumber) updatePayload.document = validatedData.documentNumber;
      
      if (validatedData.password) {
        updatePayload.passwordHash = hashPlainPassword(validatedData.password);
      }

      return await transactionalEntityManager.user.update({
        where: { id: validatedData.userId },
        data: updatePayload,
      });
    });

    revalidatePath('/profile');
    
    return {
      success: true,
      data: { updatedUserId: updatedUser.id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ocorreu um erro interno ao atualizar o perfil.',
    };
  }
}
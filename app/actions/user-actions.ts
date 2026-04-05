'use server';

import { prisma } from '@/lib/prisma';
import { UpdateUserImageSchema, UpdateUserImageType } from '@/schemas/user-schema';

export async function updateUserImageAction(
  payload: UpdateUserImageType
): Promise<{ success: boolean; error?: string }> {
  try {
    const validationResult = UpdateUserImageSchema.safeParse(payload);

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Erro de validação nos dados da imagem.'
      };
    }

    const validatedData = validationResult.data;

    await prisma.$transaction(async (transaction) => {
      const updateData = validatedData.imageType === "PROFILE" 
        ? { profilePictureUrl: validatedData.imageUrl }
        : { backgroundImageUrl: validatedData.imageUrl };

      return await transaction.user.update({
        where: { id: validatedData.userIdentifier },
        data: updateData
      });
    });

    return { success: true };
  } catch (error) {
    console.error(`[User Action Error]:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao atualizar a imagem.' 
    };
  }
}
'use server';

import { prisma } from '@/lib/prisma';
import { UserRegistrationSchema, UserRegistrationType } from '@/schemas/registration-schema';

export async function registerNewUserAction(
  payload: UserRegistrationType
): Promise<{ success: boolean; error?: string }> {
  try {
    const validationResult = UserRegistrationSchema.safeParse(payload);

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Erro de validação no formulário de registo.'
      };
    }

    const validatedData = validationResult.data;

    await prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: {
          OR: [
            { email: validatedData.emailAddress },
            { document: validatedData.documentNumber }
          ]
        }
      });

      if (existingUser) {
        throw new Error("Já existe um utilizador registado com este E-mail ou Documento.");
      }

      return await transaction.user.create({
        data: {
          name: validatedData.fullName,
          email: validatedData.emailAddress,
          whatsapp: validatedData.phoneNumber,
          address: validatedData.physicalAddress,
          documentType: validatedData.documentType,
          document: validatedData.documentNumber,
          role: "customer"
          // Em produção real, a senha deve ser hasheada aqui (ex: bcrypt.hash)
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error(`[Registration Action Error]:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao registar o utilizador.' 
    };
  }
}
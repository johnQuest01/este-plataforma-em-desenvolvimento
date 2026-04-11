'use server';

import { prisma } from '@/lib/prisma';
import { UserLoginSchema, UserLoginType } from '@/schemas/auth-schema';
import { verifyPlainPasswordAgainstHash } from '@/lib/password-hash';

function normalizeDocumentNumber(documentNumber: string): string {
  return documentNumber.replace(/\D/g, '');
}

function normalizeEmail(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

export async function authenticateUserAction(
  payload: UserLoginType
): Promise<{
  success: boolean;
  data?: {
    userId: string;
    userName: string;
    role: string;
    documentType: 'CPF' | 'CNPJ';
    documentNumber: string;
    emailAddress: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
  };
  error?: string;
}> {
  try {
    const validationResult = UserLoginSchema.safeParse(payload);

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Erro de validação nos dados de login.'
      };
    }

    const validatedData = validationResult.data;
    const normalizedCredential = validatedData.documentOrEmail.trim();
    const normalizedEmailCredential = normalizeEmail(normalizedCredential);
    const normalizedDocumentCredential = normalizeDocumentNumber(normalizedCredential);

    // Busca o usuário pelo E-mail OU pelo Documento (CPF/CNPJ)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmailCredential },
          { document: normalizedDocumentCredential },
          { document: normalizedCredential },
        ]
      }
    });

    if (!existingUser) {
      return { success: false, error: 'Usuário não encontrado. Verifique os seus dados.' };
    }

    const isPasswordValid = verifyPlainPasswordAgainstHash(
      validatedData.password,
      existingUser.passwordHash
    );

    if (!isPasswordValid) {
      return { success: false, error: 'Senha incorreta.' };
    }

    console.log(`✅ [Auth Action] Login bem-sucedido para o usuário: ${existingUser.id}`);

    return { 
      success: true, 
      data: {
        userId: existingUser.id,
        userName: existingUser.name || 'Usuário',
        role: existingUser.role,
        documentType: existingUser.documentType === 'CNPJ' ? 'CNPJ' : 'CPF',
        documentNumber: existingUser.document,
        emailAddress: existingUser.email ?? '',
        phoneNumber: existingUser.whatsapp ?? '',
        profilePictureUrl: existingUser.profilePictureUrl ?? null,
      }
    };

  } catch (error) {
    console.error(`❌ [Auth Action] Erro interno ao autenticar:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao fazer login.' 
    };
  }
}
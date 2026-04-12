'use server';

import { prisma } from '@/lib/prisma';
import { UserLoginSchema, UserLoginType } from '@/schemas/auth-schema';
import { verifyPlainPasswordAgainstHash } from '@/lib/password-hash';
import { onlyDigits, formatCpf, formatCnpj } from '@/schemas/registration-schema';

function normalizeEmail(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

/**
 * Gera todas as variantes de busca de um documento (dígitos puros, CPF formatado, CNPJ formatado).
 * Permite encontrar o usuário seja qual for o formato salvo no banco ou digitado no login.
 */
function buildDocumentSearchVariants(raw: string): string[] {
  const digits = onlyDigits(raw);
  const variants = new Set<string>();
  variants.add(raw.trim());           // como o utilizador digitou
  variants.add(digits);               // só dígitos
  if (digits.length === 11) variants.add(formatCpf(digits));   // CPF formatado
  if (digits.length === 14) variants.add(formatCnpj(digits));  // CNPJ formatado
  return Array.from(variants).filter((v) => v.length > 0);
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
    address: string;
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

    // Busca pelo e-mail OU por qualquer variante do documento (dígitos puros, CPF/CNPJ formatado)
    const documentVariants = buildDocumentSearchVariants(normalizedCredential);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmailCredential },
          ...documentVariants.map((v) => ({ document: v })),
        ],
      },
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
        address: existingUser.address ?? '',
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
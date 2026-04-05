'use server';

import { prisma } from '@/lib/prisma';
import { UserLoginSchema, UserLoginType } from '@/schemas/auth-schema';

export async function authenticateUserAction(
  payload: UserLoginType
): Promise<{ success: boolean; data?: { userId: string; userName: string; role: string }; error?: string }> {
  try {
    const validationResult = UserLoginSchema.safeParse(payload);

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Erro de validação nos dados de login.'
      };
    }

    const validatedData = validationResult.data;

    // Busca o usuário pelo E-mail OU pelo Documento (CPF/CNPJ)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.documentOrEmail },
          { document: validatedData.documentOrEmail }
        ]
      }
    });

    if (!existingUser) {
      return { success: false, error: 'Usuário não encontrado. Verifique os seus dados.' };
    }

    // ⚠️ NOTA DE ARQUITETURA: Em produção real (Stack 2026), você DEVE usar bcrypt.compare() aqui.
    // Como o schema atual não tem o campo passwordHash explícito ainda, estamos simulando a aprovação.
    // Exemplo futuro: const isPasswordValid = await bcrypt.compare(validatedData.password, existingUser.passwordHash);
    
    // Simulando validação de senha para o fluxo atual:
    const isPasswordValid = validatedData.password.length >= 6; 

    if (!isPasswordValid) {
      return { success: false, error: 'Senha incorreta.' };
    }

    console.log(`✅ [Auth Action] Login bem-sucedido para o usuário: ${existingUser.id}`);

    return { 
      success: true, 
      data: {
        userId: existingUser.id,
        userName: existingUser.name || 'Usuário',
        role: existingUser.role
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
'use server';

import { prisma } from '@/lib/prisma';
import { AccountUpdateSchema, AccountUpdatePayload } from '@/schemas/account-schema';

export async function updateUserAccountAction(
  payload: AccountUpdatePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🛡️ Correção Zero-Error: Uso de safeParse para inferência segura
    const validationResult = AccountUpdateSchema.safeParse(payload);

    if (!validationResult.success) {
      // ✅ CORREÇÃO TS(2339): Utilização de '.issues' em vez de '.errors'
      console.error(`❌ [Account Action] Erro de validação:`, validationResult.error.issues);
      
      return { 
        success: false, 
        // Fallback seguro caso a mensagem não exista
        error: validationResult.error.issues[0]?.message || 'Erro de validação nos dados fornecidos.'
      };
    }

    const validatedData = validationResult.data;

    // 🛡️ Operação de Escrita com Transação Obrigatória (Prisma)
    await prisma.$transaction(async (transaction) => {
      return await transaction.user.update({
        where: { id: validatedData.userIdentifier },
        data: {
          name: validatedData.userName,
          email: validatedData.userEmail,
          document: validatedData.userDocument,
          whatsapp: validatedData.userWhatsapp,
        }
      });
    });

    console.log(`✅ [Account Action] Conta atualizada com sucesso para o usuário: ${validatedData.userIdentifier}`);
    return { success: true };

  } catch (error) {
    console.error(`❌ [Account Action] Erro interno ao atualizar conta:`, error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao atualizar a conta.' 
    };
  }
}
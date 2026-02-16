// app/actions/admin-access.ts
'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const ADMIN_RECORD_ID = 'admin-access-single-record';
const CORRECT_PASSWORD = 'BUCETA199';

/**
 * Hash da senha usando SHA-256
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verifica se a senha está correta
 */
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Inicializa o registro de admin se não existir
 */
async function ensureAdminRecord() {
  const existing = await prisma.adminAccess.findUnique({
    where: { id: ADMIN_RECORD_ID }
  });

  if (!existing) {
    await prisma.adminAccess.create({
      data: {
        id: ADMIN_RECORD_ID,
        passwordHash: hashPassword(CORRECT_PASSWORD),
        isUnlocked: false,
        accessCount: 0,
        buttonPosition: { x: 16, y: 16 } // Posição inicial (top-right)
      }
    });
  }

  return prisma.adminAccess.findUnique({
    where: { id: ADMIN_RECORD_ID }
  });
}

/**
 * Verifica a senha e desbloqueia o acesso
 */
export async function verifyAdminPasswordAction(password: string) {
  try {
    const record = await ensureAdminRecord();
    
    if (!record) {
      return { success: false, message: 'Erro ao acessar configurações' };
    }

    const isValid = verifyPassword(password, record.passwordHash);

    if (isValid) {
      // Atualiza registro com acesso bem-sucedido
      await prisma.adminAccess.update({
        where: { id: ADMIN_RECORD_ID },
        data: {
          isUnlocked: true,
          lastAccess: new Date(),
          accessCount: { increment: 1 }
        }
      });

      return { success: true, message: 'Acesso liberado!' };
    }

    return { success: false, message: 'Senha errada' };
  } catch (error) {
    console.error('❌ [Admin Access] Erro ao verificar senha:', error);
    return { success: false, message: 'Senha errada' };
  }
}

/**
 * Obtém o status atual do acesso admin
 */
export async function getAdminAccessStatusAction() {
  try {
    const record = await ensureAdminRecord();
    
    return {
      success: true,
      isUnlocked: record?.isUnlocked || false,
      buttonPosition: record?.buttonPosition as { x: number; y: number } || { x: 16, y: 16 },
      lastAccess: record?.lastAccess?.toISOString() || null,
      accessCount: record?.accessCount || 0
    };
  } catch (error) {
    console.error('❌ [Admin Access] Erro ao obter status:', error);
    return {
      success: false,
      isUnlocked: false,
      buttonPosition: { x: 16, y: 16 },
      lastAccess: null,
      accessCount: 0
    };
  }
}

/**
 * Bloqueia o acesso admin (logout)
 */
export async function lockAdminAccessAction() {
  try {
    await prisma.adminAccess.update({
      where: { id: ADMIN_RECORD_ID },
      data: { isUnlocked: false }
    });

    return { success: true, message: 'Acesso bloqueado' };
  } catch (error) {
    console.error('❌ [Admin Access] Erro ao bloquear acesso:', error);
    return { success: false, message: 'Erro ao bloquear acesso' };
  }
}

/**
 * Atualiza a posição do botão admin
 */
export async function updateAdminButtonPositionAction(position: { x: number; y: number }) {
  try {
    await prisma.adminAccess.update({
      where: { id: ADMIN_RECORD_ID },
      data: { buttonPosition: position }
    });

    return { success: true, message: 'Posição atualizada' };
  } catch (error) {
    console.error('❌ [Admin Access] Erro ao atualizar posição:', error);
    return { success: false, message: 'Erro ao atualizar posição' };
  }
}

/**
 * Altera a senha de acesso admin
 */
export async function changeAdminPasswordAction(oldPassword: string, newPassword: string) {
  try {
    const record = await ensureAdminRecord();
    
    if (!record) {
      return { success: false, message: 'Erro ao acessar configurações' };
    }

    // Verifica senha antiga
    const isValid = verifyPassword(oldPassword, record.passwordHash);
    
    if (!isValid) {
      return { success: false, message: 'Senha atual incorreta' };
    }

    // Atualiza com nova senha
    await prisma.adminAccess.update({
      where: { id: ADMIN_RECORD_ID },
      data: { passwordHash: hashPassword(newPassword) }
    });

    return { success: true, message: 'Senha alterada com sucesso!' };
  } catch (error) {
    console.error('❌ [Admin Access] Erro ao alterar senha:', error);
    return { success: false, message: 'Erro ao alterar senha' };
  }
}

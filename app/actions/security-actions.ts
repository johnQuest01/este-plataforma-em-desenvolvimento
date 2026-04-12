'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPlainPassword, verifyPlainPasswordAgainstHash } from '@/lib/password-hash';
import { revalidatePath } from 'next/cache';

// ─── Schemas de validação ────────────────────────────────────────────────────

const ChangePasswordSchema = z.object({
  userId: z.string().min(1, 'ID do usuário inválido.'),
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve ter ao menos 6 caracteres.')
    .max(100, 'Senha muito longa.'),
  confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não conferem.',
  path: ['confirmPassword'],
});

const ToggleTwoFactorSchema = z.object({
  userId: z.string().min(1),
  enabled: z.boolean(),
});

// ─── Alterar senha ───────────────────────────────────────────────────────────

export type ChangePasswordResult = { success: boolean; error?: string };

export async function changePasswordAction(
  payload: z.infer<typeof ChangePasswordSchema>
): Promise<ChangePasswordResult> {
  try {
    const validation = ChangePasswordSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const { userId, currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const isCurrentPasswordValid = verifyPlainPasswordAgainstHash(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Senha atual incorreta.' };
    }

    const newHash = hashPlainPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });
    });

    revalidatePath('/account');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao alterar a senha.',
    };
  }
}

// ─── Ativar / desativar autenticação em duas etapas ──────────────────────────

export type ToggleTwoFactorResult = {
  success: boolean;
  enabled?: boolean;
  error?: string;
};

export async function toggleTwoFactorAction(
  payload: z.infer<typeof ToggleTwoFactorSchema>
): Promise<ToggleTwoFactorResult> {
  try {
    const validation = ToggleTwoFactorSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: 'Dados inválidos.' };
    }

    const { userId, enabled } = validation.data;

    // isTwoFactorEnabled está no schema.prisma — cast necessário até próximo `prisma generate`
    await prisma.$transaction(async (tx) => {
      await (tx.user.update as (args: unknown) => Promise<unknown>)({
        where: { id: userId },
        data: { isTwoFactorEnabled: enabled },
      });
    });

    revalidatePath('/account');
    return { success: true, enabled };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar autenticação.',
    };
  }
}

// ─── Buscar status de segurança do usuário ───────────────────────────────────

export type SecurityStatus = {
  email: string;
  isTwoFactorEnabled: boolean;
  role: string;
};

export type GetSecurityStatusResult = {
  success: boolean;
  data?: SecurityStatus;
  error?: string;
};

export async function getSecurityStatusAction(
  userId: string
): Promise<GetSecurityStatusResult> {
  try {
    if (!userId?.trim()) {
      return { success: false, error: 'ID inválido.' };
    }

    // isTwoFactorEnabled está no schema.prisma — cast necessário até próximo `prisma generate`
    const user = await (prisma.user.findUnique as (args: unknown) => Promise<{
      email: string | null;
      isTwoFactorEnabled: boolean;
      role: string;
    } | null>)({
      where: { id: userId },
      select: { email: true, isTwoFactorEnabled: true, role: true },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    return {
      success: true,
      data: {
        email: user.email ?? '',
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        role: user.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar status.',
    };
  }
}

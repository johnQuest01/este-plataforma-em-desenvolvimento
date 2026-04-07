'use server';

import { prisma } from '@/lib/prisma';
import { UserRegistrationSchema, UserRegistrationType } from '@/schemas/registration-schema';
import { hashPlainPassword } from '@/lib/password-hash';

type RegistrationSuccessPayload = {
  userId: string;
  fullName: string;
  documentType: 'CPF' | 'CNPJ';
  documentNumber: string;
  role: string;
  emailAddress: string;
  phoneNumber: string;
};

function buildStoreSlug(fullName: string, userId: string): string {
  const base = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = userId.slice(-6);
  return `${base.length > 0 ? base : 'loja'}-${suffix}`;
}

function normalizeDocumentNumber(documentNumber: string): string {
  return documentNumber.replace(/\D/g, '');
}

function normalizeEmail(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

export async function registerNewUserAction(
  payload: UserRegistrationType
): Promise<{ success: boolean; data?: RegistrationSuccessPayload; error?: string }> {
  try {
    const validationResult = UserRegistrationSchema.safeParse(payload);

    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Erro de validação no formulário de registo.'
      };
    }

    const validatedData = validationResult.data;
    const hashedPassword = hashPlainPassword(validatedData.password);
    const normalizedDocumentNumber = normalizeDocumentNumber(validatedData.documentNumber);
    const normalizedEmailAddress = normalizeEmail(validatedData.emailAddress);

    const createdUser = await prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmailAddress },
            { document: normalizedDocumentNumber }
          ]
        }
      });

      if (existingUser) {
        throw new Error("Já existe um utilizador registado com este E-mail ou Documento.");
      }

      const createdUserRecord = await transaction.user.create({
        data: {
          name: validatedData.fullName,
          email: normalizedEmailAddress,
          whatsapp: validatedData.phoneNumber,
          address: validatedData.physicalAddress,
          documentType: validatedData.documentType,
          document: normalizedDocumentNumber,
          passwordHash: hashedPassword,
          role: "customer"
        }
      });

      await transaction.store.create({
        data: {
          name: `${validatedData.fullName.split(' ')[0] || 'Minha'} Store`,
          slug: buildStoreSlug(validatedData.fullName, createdUserRecord.id),
          nicheType: 'clothing',
          ownerId: createdUserRecord.id,
        },
      });

      return createdUserRecord;
    });

    return {
      success: true,
      data: {
        userId: createdUser.id,
        fullName: createdUser.name ?? validatedData.fullName,
        documentType: (createdUser.documentType === 'CNPJ' ? 'CNPJ' : 'CPF'),
        documentNumber: createdUser.document,
        role: createdUser.role,
        emailAddress: createdUser.email ?? normalizedEmailAddress,
        phoneNumber: createdUser.whatsapp ?? validatedData.phoneNumber,
      },
    };
  } catch (error) {
    console.error(`[Registration Action Error]:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao registar o utilizador.' 
    };
  }
}
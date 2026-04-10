'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  UserRegistrationSchema,
  buildFullAddressLine,
  type UserRegistrationPayloadInput,
} from '@/schemas/registration-schema';
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

export type RegisterNewUserActionResult = {
  success: boolean;
  data?: RegistrationSuccessPayload;
  error?: string;
};

function buildStoreSlug(fullName: string, userIdentifier: string): string {
  const normalizedBase = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const storeSlugTail = userIdentifier.slice(-6);
  const slugBody = normalizedBase.length > 0 ? normalizedBase : 'loja';
  return `${slugBody}-${storeSlugTail}`;
}

function normalizeDocumentNumber(documentNumber: string): string {
  return documentNumber.replace(/\D/g, '');
}

function normalizeEmailAddress(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

function mapStoredDocumentTypeToRegistrationLabel(
  storedDocumentType: string
): 'CPF' | 'CNPJ' {
  if (storedDocumentType === 'CNPJ') {
    return 'CNPJ';
  }
  return 'CPF';
}

export async function registerNewUserAction(
  payload: UserRegistrationPayloadInput
): Promise<RegisterNewUserActionResult> {
  try {
    const validationResult = UserRegistrationSchema.safeParse(payload);

    if (!validationResult.success) {
      const firstIssueMessage = validationResult.error.issues[0]?.message;
      return {
        success: false,
        error:
          firstIssueMessage ??
          'Erro de validação no formulário de registo.',
      };
    }

    const validatedData = validationResult.data;
    const hashedPassword = hashPlainPassword(validatedData.password);
    const normalizedDocumentNumber = normalizeDocumentNumber(
      validatedData.documentNumber
    );
    const normalizedEmailAddress = normalizeEmailAddress(
      validatedData.emailAddress
    );

    const createdUserRecord = await prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmailAddress },
            { document: normalizedDocumentNumber },
          ],
        },
      });

      if (existingUser !== null) {
        throw new Error(
          'Já existe um utilizador registado com este E-mail ou Documento.'
        );
      }

      const fullAddressLine = buildFullAddressLine(validatedData);

      const newUser = await transaction.user.create({
        data: {
          name: validatedData.fullName,
          email: normalizedEmailAddress,
          whatsapp: validatedData.phoneNumber,
          address: fullAddressLine,
          street: validatedData.street.trim(),
          addressNumber: validatedData.addressNumber?.trim() ?? null,
          addressComplement: validatedData.addressComplement?.trim() ?? null,
          district: validatedData.district.trim(),
          city: validatedData.city.trim(),
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          documentType: validatedData.documentType,
          document: normalizedDocumentNumber,
          passwordHash: hashedPassword,
          role: validatedData.registerAsSeller ? 'seller' : 'customer',
        },
      });

      const firstNameToken = validatedData.fullName.split(' ')[0];
      const storeDisplayName =
        firstNameToken !== undefined && firstNameToken.length > 0
          ? firstNameToken
          : 'Minha';

      await transaction.store.create({
        data: {
          name: `${storeDisplayName} Store`,
          slug: buildStoreSlug(validatedData.fullName, newUser.id),
          nicheType: 'clothing',
          ownerId: newUser.id,
        },
      });

      return newUser;
    });

    revalidatePath('/admin/manage');
    revalidatePath('/login');
    revalidatePath('/');

    const resolvedFullName =
      createdUserRecord.name ?? validatedData.fullName;
    const resolvedEmailAddress =
      createdUserRecord.email ?? normalizedEmailAddress;
    const resolvedPhoneNumber =
      createdUserRecord.whatsapp ?? validatedData.phoneNumber;

    return {
      success: true,
      data: {
        userId: createdUserRecord.id,
        fullName: resolvedFullName,
        documentType: mapStoredDocumentTypeToRegistrationLabel(
          createdUserRecord.documentType
        ),
        documentNumber: createdUserRecord.document,
        role: createdUserRecord.role,
        emailAddress: resolvedEmailAddress,
        phoneNumber: resolvedPhoneNumber,
      },
    };
  } catch (error) {
    console.error('[Registration Action Error]', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro interno ao registar o utilizador.';
    return {
      success: false,
      error: message,
    };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  UserRegistrationSchema,
  buildFullAddressLine,
  formatDocumentForStorage,
  onlyDigits,
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

    // Dígitos puros — usados para a verificação de duplicidade
    const rawDocumentDigits = onlyDigits(validatedData.documentNumber);

    // Documento formatado com pontuação — o que fica visível no Neon SQL
    // Ex.: '12345678901' + CPF → '123.456.789-01'
    // Ex.: '12345678000195' + CNPJ → '12.345.678/0001-95'
    const formattedDocument = formatDocumentForStorage(
      rawDocumentDigits,
      validatedData.documentType
    );

    const normalizedEmailAddress = normalizeEmailAddress(
      validatedData.emailAddress
    );

    // Telefone formatado para salvar legível no banco
    // Ex.: '11987654321' → '(11) 98765-4321'
    const rawPhone = onlyDigits(validatedData.phoneNumber);
    const formattedPhone =
      rawPhone.length === 11
        ? `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 7)}-${rawPhone.slice(7, 11)}`
        : rawPhone.length === 10
        ? `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 6)}-${rawPhone.slice(6, 10)}`
        : validatedData.phoneNumber;

    const createdUserRecord = await prisma.$transaction(async (transaction) => {
      // Verificação de duplicidade: aceita tanto o formato com pontuação quanto apenas dígitos
      const existingUser = await transaction.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmailAddress },
            { document: formattedDocument },
            { document: rawDocumentDigits },
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
          // Telefone com máscara → ex.: "(11) 98765-4321"
          whatsapp: formattedPhone,
          address: fullAddressLine,
          street: validatedData.street.trim(),
          addressNumber: validatedData.addressNumber?.trim() ?? null,
          addressComplement: validatedData.addressComplement?.trim() ?? null,
          district: validatedData.district.trim(),
          city: validatedData.city.trim(),
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          documentType: validatedData.documentType,
          // CPF ex.: "123.456.789-01" | CNPJ ex.: "12.345.678/0001-95"
          document: formattedDocument,
          passwordHash: hashedPassword,
          role: validatedData.registerAsSeller ? 'seller' : 'customer',
        },
      });

      const firstNameToken = validatedData.fullName.split(' ')[0];
      const defaultStoreName =
        firstNameToken !== undefined && firstNameToken.length > 0
          ? `${firstNameToken} Store`
          : 'Minha Store';

      // Nome da loja: campo explícito se preenchido; caso contrário, deriva do primeiro nome.
      const resolvedStoreName =
        typeof validatedData.storeName === 'string' && validatedData.storeName.trim().length > 0
          ? validatedData.storeName.trim()
          : defaultStoreName;

      await transaction.store.create({
        data: {
          name: resolvedStoreName,
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

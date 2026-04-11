'use server';

import { revalidatePath } from 'next/cache';
import { Prisma, type FormVideoConfig } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  VideoBackgroundSchema,
  VideoBackgroundMetadataRecordSchema,
  type VideoBackgroundType,
  SaveVideoReferencePayloadSchema,
  type SaveVideoReferencePayloadType,
  FORM_VIDEO_CONFIG_ROW_IDENTIFIER,
} from '@/schemas/video-bg-schema';

function mapPrismaJsonToOptionalMetadataRecord(
  value: Prisma.JsonValue | null
): Record<string, unknown> | undefined {
  if (value === null) {
    return undefined;
  }
  const parsed = VideoBackgroundMetadataRecordSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function mapFormVideoConfigRowToVideoBackgroundType(
  row: FormVideoConfig
): VideoBackgroundType {
  return {
    videoUrl: row.videoUrl,
    cloudinaryPublicId: row.cloudinaryPublicId,
    isActive: row.isActive,
    metadata: mapPrismaJsonToOptionalMetadataRecord(row.metadata),
  };
}

function cloneMetadataForPrismaInput(
  metadata: Record<string, unknown>
): Prisma.InputJsonValue {
  const serialized = JSON.stringify(metadata);
  const deserialized: unknown = JSON.parse(serialized);
  if (deserialized === null || typeof deserialized !== 'object' || Array.isArray(deserialized)) {
    return {};
  }
  return deserialized as Prisma.InputJsonValue;
}

function mapVideoBackgroundToFormVideoConfigWritePayload(
  data: VideoBackgroundType
): Prisma.FormVideoConfigUncheckedCreateInput {
  const metadataValue: Prisma.InputJsonValue | typeof Prisma.JsonNull =
    data.metadata === undefined ? Prisma.JsonNull : cloneMetadataForPrismaInput(data.metadata);

  return {
    id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER,
    videoUrl: data.videoUrl,
    cloudinaryPublicId: data.cloudinaryPublicId,
    isActive: data.isActive,
    metadata: metadataValue,
  };
}

function sanitizeVideoBackgroundForPersistence(data: VideoBackgroundType): VideoBackgroundType {
  const trimmedUrl = data.videoUrl.trim();
  if (trimmedUrl.length === 0) {
    return {
      ...data,
      videoUrl: '',
      cloudinaryPublicId: '',
      metadata: undefined,
    };
  }

  const isCloudinaryDeliveryUrl = trimmedUrl.includes('res.cloudinary.com');
  if (!isCloudinaryDeliveryUrl) {
    return {
      ...data,
      videoUrl: trimmedUrl,
      cloudinaryPublicId: '',
      metadata: undefined,
    };
  }

  return {
    ...data,
    videoUrl: trimmedUrl,
  };
}

async function upsertFormVideoConfigWithinTransaction(
  transactionClient: Prisma.TransactionClient,
  payload: VideoBackgroundType
): Promise<void> {
  const writePayload = mapVideoBackgroundToFormVideoConfigWritePayload(payload);

  await transactionClient.formVideoConfig.upsert({
    where: { id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER },
    update: {
      videoUrl: writePayload.videoUrl,
      cloudinaryPublicId: writePayload.cloudinaryPublicId,
      isActive: writePayload.isActive,
      metadata: writePayload.metadata,
    },
    create: writePayload,
  });
}

export async function saveVideoReferenceAction(
  payload: SaveVideoReferencePayloadType
): Promise<{ success: boolean; data?: null; error?: string }> {
  try {
    const validationResult = SaveVideoReferencePayloadSchema.safeParse(payload);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message ?? 'Validação do vídeo enviado falhou.',
      };
    }

    const validated = validationResult.data;

    const rowPayload: VideoBackgroundType = {
      videoUrl: validated.videoUrl,
      cloudinaryPublicId: validated.cloudinaryPublicId,
      isActive: true,
      metadata: validated.metadata,
    };

    const sanitizedPayload = sanitizeVideoBackgroundForPersistence(rowPayload);

    await prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {
      await upsertFormVideoConfigWithinTransaction(transactionClient, sanitizedPayload);
    });

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[saveVideoReferenceAction]', errorMessage);
    return { success: false, error: 'Erro interno ao guardar a referência do vídeo.' };
  }
}

export async function updateFormVideoAction(
  payload: VideoBackgroundType
): Promise<{ success: boolean; data?: null; error?: string }> {
  try {
    const validationResult = VideoBackgroundSchema.safeParse(payload);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message ?? 'Erro de validação na configuração do vídeo.',
      };
    }

    const sanitizedPayload = sanitizeVideoBackgroundForPersistence(validationResult.data);

    await prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {
      await upsertFormVideoConfigWithinTransaction(transactionClient, sanitizedPayload);
    });

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[updateFormVideoAction]', errorMessage);
    return { success: false, error: 'Erro interno ao atualizar as configurações do vídeo.' };
  }
}

export async function getFormVideoAction(): Promise<{
  success: boolean;
  data?: VideoBackgroundType;
  error?: string;
}> {
  try {
    const videoConfiguration = await prisma.formVideoConfig.findUnique({
      where: { id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER },
    });

    if (!videoConfiguration) {
      return {
        success: true,
        data: {
          videoUrl: '',
          cloudinaryPublicId: '',
          isActive: false,
          metadata: undefined,
        },
      };
    }

    return {
      success: true,
      data: mapFormVideoConfigRowToVideoBackgroundType(videoConfiguration),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[getFormVideoAction]', errorMessage);
    return { success: false, error: 'Erro interno ao ler a configuração do vídeo.' };
  }
}

export async function getActiveVideoConfigAction(): Promise<{
  success: boolean;
  data?: VideoBackgroundType;
  error?: string;
}> {
  return getFormVideoAction();
}



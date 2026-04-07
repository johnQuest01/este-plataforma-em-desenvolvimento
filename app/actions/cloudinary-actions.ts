'use server';

import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

const ADMIN_ACCESS_ROW_IDENTIFIER = 'admin-access-single-record';

function parseTruthyEnvironmentFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? '';
  return (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes' ||
    normalized === 'on'
  );
}

/**
 * Unsigned: não enviar api_key/signature ao Cloudinary (preset "Unsigned" no dashboard).
 * Aceita CLOUDINARY_UNSIGNED_UPLOAD ou NEXT_PUBLIC_CLOUDINARY_UNSIGNED_UPLOAD (útil se o servidor não expuser a var sem NEXT_PUBLIC).
 */
function resolveUnsignedUploadFromEnv(): boolean {
  return (
    parseTruthyEnvironmentFlag(process.env.CLOUDINARY_UNSIGNED_UPLOAD) ||
    parseTruthyEnvironmentFlag(process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_UPLOAD)
  );
}

export type CloudinaryVideoUploadPreparationUnsigned = {
  mode: 'unsigned';
  cloudName: string;
  uploadPreset: string;
};

export type CloudinaryVideoUploadPreparationSigned = {
  mode: 'signed';
  cloudName: string;
  uploadPreset: string;
  timestamp: number;
  signature: string;
  apiKey: string;
};

export type CloudinaryVideoUploadPreparationData =
  | CloudinaryVideoUploadPreparationUnsigned
  | CloudinaryVideoUploadPreparationSigned;

export type PrepareCloudinaryVideoUploadResult =
  | { success: true; data: CloudinaryVideoUploadPreparationData }
  | { success: false; error: string };

function resolveUnsignedEnvironment(): { cloudName: string; uploadPreset: string } | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? '';

  if (cloudName.length === 0 || uploadPreset.length === 0) {
    return null;
  }

  return { cloudName, uploadPreset };
}

function resolveSignedEnvironment(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
} | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '';
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? '';

  if (
    cloudName.length === 0 ||
    apiKey.length === 0 ||
    apiSecret.length === 0 ||
    uploadPreset.length === 0
  ) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, uploadPreset };
}

/**
 * Prepara o upload de vídeo: modo unsigned (apenas preset) ou signed (timestamp + assinatura).
 * Em ambos os casos exige painel admin desbloqueado (AdminAccess).
 */
export async function prepareCloudinaryVideoUploadAction(): Promise<PrepareCloudinaryVideoUploadResult> {
  const adminAccessRecord = await prisma.adminAccess.findUnique({
    where: { id: ADMIN_ACCESS_ROW_IDENTIFIER },
  });

  if (!adminAccessRecord?.isUnlocked) {
    return {
      success: false,
      error:
        'O painel de administração tem de estar desbloqueado para iniciar o upload de vídeo no Cloudinary.',
    };
  }

  if (resolveUnsignedUploadFromEnv()) {
    const environment = resolveUnsignedEnvironment();
    if (!environment) {
      return {
        success: false,
        error:
          'Configuração Cloudinary incompleta para upload unsigned: defina CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
      };
    }

    return {
      success: true,
      data: {
        mode: 'unsigned',
        cloudName: environment.cloudName,
        uploadPreset: environment.uploadPreset,
      },
    };
  }

  const signedEnvironment = resolveSignedEnvironment();
  if (!signedEnvironment) {
    return {
      success: false,
      error:
        'Configuração Cloudinary incompleta para upload signed: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. Ou defina CLOUDINARY_UNSIGNED_UPLOAD=true para preset unsigned.',
    };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const parametersToSign: Record<string, string | number> = {
    timestamp,
    upload_preset: signedEnvironment.uploadPreset,
  };

  const signature = cloudinary.utils.api_sign_request(
    parametersToSign,
    signedEnvironment.apiSecret
  );

  return {
    success: true,
    data: {
      mode: 'signed',
      cloudName: signedEnvironment.cloudName,
      uploadPreset: signedEnvironment.uploadPreset,
      timestamp,
      signature,
      apiKey: signedEnvironment.apiKey,
    },
  };
}

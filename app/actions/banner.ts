// app/actions/banner.ts
'use server';

/**
 * 🎨 BANNER MANAGEMENT - SERVER ACTIONS
 * 
 * Server Actions para gerenciar banners da Dashboard.
 * Inclui validação Zod, upload de mídia e persistência no banco.
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { 
  BannerCreatorSchema, 
  BannerDeleteSchema,
  type BannerCreatorInput 
} from '@/schemas/blocks/banner-creator-schema';
import { uploadImageToCloud } from '@/lib/upload-service';

// ========================================
// TYPES
// ========================================

export interface BannerActionResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    title: string;
    mediaUrl: string;
  };
  error?: string;
}

export interface BannerData {
  id: string;
  title: string;
  mediaType: string;
  mediaUrl: string;
  aspectRatio: string;
  orderIndex: number;
  isVisible: boolean;
  linkUrl?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// HELPER: Converter File para Base64
// ========================================

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// ========================================
// ACTION: SALVAR BANNER
// ========================================

export async function saveBannerBlock(formData: FormData): Promise<BannerActionResult> {
  try {
    // 1. Extrair dados do FormData
    const rawData = {
      title: formData.get('title'),
      mediaType: formData.get('mediaType'),
      aspectRatio: formData.get('aspectRatio'),
      file: formData.get('file'),
      linkUrl: formData.get('linkUrl') || '',
      description: formData.get('description') || '',
    };

    // 2. Validar com Zod
    const validatedData = BannerCreatorSchema.parse(rawData);

    // 3. Converter file para Base64
    const base64Media = await fileToBase64(validatedData.file);

    // 4. Upload (usa serviço existente que aceita Base64)
    const mediaUrl = await uploadImageToCloud(base64Media, validatedData.title);

    // 5. Buscar o maior orderIndex atual
    const maxOrderBanner = await prisma.banner.findFirst({
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const nextOrderIndex = (maxOrderBanner?.orderIndex ?? -1) + 1;

    // 6. Salvar no banco
    const banner = await prisma.banner.create({
      data: {
        title: validatedData.title,
        mediaType: validatedData.mediaType,
        mediaUrl: mediaUrl,
        aspectRatio: validatedData.aspectRatio,
        orderIndex: nextOrderIndex,
        isVisible: true,
        linkUrl: validatedData.linkUrl || null,
        description: validatedData.description || null,
      },
    });

    // 7. Revalidar cache
    revalidatePath('/dashboard');
    revalidatePath('/');

    console.log('✅ [Banner] Banner criado com sucesso:', banner.id);

    return {
      success: true,
      message: 'Banner criado com sucesso!',
      data: {
        id: banner.id,
        title: banner.title,
        mediaUrl: banner.mediaUrl,
      },
    };
  } catch (error) {
    console.error('❌ [Banner] Erro ao salvar banner:', error);

    // Tratamento de erros Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        message: 'Dados inválidos',
        error: error.message,
      };
    }

    return {
      success: false,
      message: 'Erro ao criar banner',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ========================================
// ACTION: LISTAR BANNERS
// ========================================

export async function getBannersAction(): Promise<BannerData[]> {
  try {
    const banners = await prisma.banner.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: 'asc' },
    });

    console.log('📋 [Banner] Banners carregados:', banners.length);

    return banners;
  } catch (error) {
    console.error('❌ [Banner] Erro ao carregar banners:', error);
    return [];
  }
}

// ========================================
// ACTION: DELETAR BANNER
// ========================================

export async function deleteBannerBlock(bannerId: string): Promise<BannerActionResult> {
  try {
    // 1. Validar ID
    const validatedData = BannerDeleteSchema.parse({ id: bannerId });

    // 2. Buscar banner
    const banner = await prisma.banner.findUnique({
      where: { id: validatedData.id },
    });

    if (!banner) {
      return {
        success: false,
        message: 'Banner não encontrado',
        error: 'BANNER_NOT_FOUND',
      };
    }

    // 3. Deletar do banco
    await prisma.banner.delete({
      where: { id: validatedData.id },
    });

    // 4. TODO: Deletar mídia do storage (se usar S3/R2)
    // await deleteFileFromCloud(banner.mediaUrl);

    // 5. Revalidar cache
    revalidatePath('/dashboard');
    revalidatePath('/');

    console.log('✅ [Banner] Banner deletado com sucesso:', bannerId);

    return {
      success: true,
      message: 'Banner deletado com sucesso!',
    };
  } catch (error) {
    console.error('❌ [Banner] Erro ao deletar banner:', error);

    return {
      success: false,
      message: 'Erro ao deletar banner',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ========================================
// ACTION: ATUALIZAR VISIBILIDADE
// ========================================

export async function toggleBannerVisibility(bannerId: string): Promise<BannerActionResult> {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
      select: { isVisible: true },
    });

    if (!banner) {
      return {
        success: false,
        message: 'Banner não encontrado',
      };
    }

    await prisma.banner.update({
      where: { id: bannerId },
      data: { isVisible: !banner.isVisible },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Banner ${banner.isVisible ? 'ocultado' : 'exibido'} com sucesso!`,
    };
  } catch (error) {
    console.error('❌ [Banner] Erro ao atualizar visibilidade:', error);

    return {
      success: false,
      message: 'Erro ao atualizar visibilidade',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ========================================
// ACTION: REORDENAR BANNERS
// ========================================

export async function reorderBanners(bannerIds: string[]): Promise<BannerActionResult> {
  try {
    // Atualiza orderIndex de cada banner
    const updatePromises = bannerIds.map((id, index) =>
      prisma.banner.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await Promise.all(updatePromises);

    revalidatePath('/dashboard');

    console.log('✅ [Banner] Banners reordenados:', bannerIds.length);

    return {
      success: true,
      message: 'Ordem atualizada com sucesso!',
    };
  } catch (error) {
    console.error('❌ [Banner] Erro ao reordenar banners:', error);

    return {
      success: false,
      message: 'Erro ao reordenar banners',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

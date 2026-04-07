import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_ACCESS_ROW_IDENTIFIER = 'admin-access-single-record';

function resolveBlobReadWriteToken(): string | undefined {
  const primaryToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (primaryToken && primaryToken.length > 0) {
    return primaryToken;
  }
  return undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const blobReadWriteToken = resolveBlobReadWriteToken();
  if (!blobReadWriteToken) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN não está definido no ambiente do servidor.' },
      { status: 503 }
    );
  }

  const adminAccessRecord = await prisma.adminAccess.findUnique({
    where: { id: ADMIN_ACCESS_ROW_IDENTIFIER },
  });

  if (!adminAccessRecord?.isUnlocked) {
    return NextResponse.json(
      {
        error:
          'O painel de administração tem de estar desbloqueado para gerar o token de upload de vídeo.',
      },
      { status: 403 }
    );
  }

  let requestBody: HandleUploadBody;
  try {
    requestBody = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 });
  }

  try {
    const handleUploadResult = await handleUpload({
      token: blobReadWriteToken,
      request,
      body: requestBody,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
          maximumSizeInBytes: 512 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(handleUploadResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no handshake de upload.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

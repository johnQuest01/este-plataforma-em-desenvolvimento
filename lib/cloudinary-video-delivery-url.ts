const CLOUDINARY_VIDEO_UPLOAD_PATH_SEGMENT = '/video/upload/';

const CLOUDINARY_AUTO_FORMAT_QUALITY_TRANSFORMATION = 'f_auto,q_auto';

/**
 * Insere f_auto,q_auto no caminho de entrega de vídeo do Cloudinary para formato e qualidade adaptativos.
 * URLs que não seguem o padrão res.cloudinary.com/.../video/upload/ são devolvidas sem alteração.
 */
export function buildOptimizedCloudinaryVideoDeliveryUrl(secureUrl: string): string {
  const markerIndex = secureUrl.indexOf(CLOUDINARY_VIDEO_UPLOAD_PATH_SEGMENT);
  if (markerIndex === -1) {
    return secureUrl;
  }

  const prefixIncludingMarker = secureUrl.slice(
    0,
    markerIndex + CLOUDINARY_VIDEO_UPLOAD_PATH_SEGMENT.length
  );
  const suffixAfterUpload = secureUrl.slice(
    markerIndex + CLOUDINARY_VIDEO_UPLOAD_PATH_SEGMENT.length
  );

  if (
    suffixAfterUpload.startsWith(`${CLOUDINARY_AUTO_FORMAT_QUALITY_TRANSFORMATION}/`) ||
    suffixAfterUpload.startsWith(`${CLOUDINARY_AUTO_FORMAT_QUALITY_TRANSFORMATION},`)
  ) {
    return secureUrl;
  }

  return `${prefixIncludingMarker}${CLOUDINARY_AUTO_FORMAT_QUALITY_TRANSFORMATION}/${suffixAfterUpload}`;
}

/**
 * Aplica otimização de entrega apenas quando a URL é claramente um vídeo hospedado no Cloudinary.
 */
export function ensureCloudinaryVideoPreviewUrl(videoUrl: string): string {
  if (!videoUrl.includes('res.cloudinary.com')) {
    return videoUrl;
  }
  return buildOptimizedCloudinaryVideoDeliveryUrl(videoUrl);
}

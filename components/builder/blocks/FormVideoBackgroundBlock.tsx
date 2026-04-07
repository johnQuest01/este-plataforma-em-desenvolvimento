'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Film, Save, Smartphone, Loader2 } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import { useCloudinaryVideo } from '@/hooks/useCloudinaryVideo';

function FormVideoBackgroundBlockBase({ config }: BlockComponentProps): React.JSX.Element {
  const { data, style } = config;
  const title = (data.videoFormTitle as string) || 'Vídeo do login';
  const description =
    (data.videoFormDescription as string) ||
    'Upload Cloudinary ou URL. Pré-visualização abaixo.';
  const helperText = (data.videoFormHelperText as string) || '';

  const {
    videoUrl,
    setVideoUrl,
    isVideoActiveOnLogin,
    setIsVideoActiveOnLogin,
    isLoadingInitialConfiguration,
    isSavingConfiguration,
    isUploadingVideo,
    uploadProgressPercentage,
    persistSuccessVisible,
    uploadErrorMessage,
    configurationSaveErrorMessage,
    videoFileInputAcceptAttribute,
    fileInputReference,
    requestGalleryFileSelection,
    handleVideoFileInputChange,
    saveVideoConfiguration,
    previewVideoSourceUrl,
  } = useCloudinaryVideo();

  const feedbackMessage =
    uploadErrorMessage ??
    configurationSaveErrorMessage ??
    (persistSuccessVisible ? 'Alterações guardadas.' : null);

  return (
    <div
      className="w-full rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
      style={{
        ...(style.bgColor ? { backgroundColor: style.bgColor } : {}),
        ...(style.padding ? { padding: style.padding } : {}),
      }}
    >
      <input
        ref={fileInputReference}
        type="file"
        accept={videoFileInputAcceptAttribute}
        className="sr-only"
        onChange={handleVideoFileInputChange}
      />

      <div className="mb-3 flex items-center gap-2">
        <Film className="h-5 w-5 text-[#5874f6]" />
        <div>
          <h4 className="text-sm font-black text-gray-900">{title}</h4>
          <p className="text-[11px] font-semibold text-gray-500">{description}</p>
        </div>
      </div>

      {isLoadingInitialConfiguration ? (
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isUploadingVideo}
            onClick={requestGalleryFileSelection}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-dashed border-[#5874f6]/50 bg-blue-50/60 text-[11px] font-bold text-[#5874f6] disabled:opacity-50"
          >
            {isUploadingVideo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
            {isUploadingVideo ? 'A enviar…' : 'Escolher da galeria'}
          </button>

          {uploadProgressPercentage !== null ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#5874f6]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgressPercentage}%` }}
                transition={{ type: 'tween', duration: 0.15 }}
              />
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#5874f6]"
              checked={isVideoActiveOnLogin}
              onChange={(event) => setIsVideoActiveOnLogin(event.target.checked)}
            />
            Ativo no login
          </label>

          <input
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#5874f6]"
          />

          {helperText ? <p className="text-[10px] text-gray-500">{helperText}</p> : null}

          {videoUrl.length > 0 && isVideoActiveOnLogin ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                key={previewVideoSourceUrl}
                src={previewVideoSourceUrl}
                autoPlay
                muted
                loop
                playsInline
                className="max-h-36 w-full object-contain"
              />
            </div>
          ) : null}

          <button
            type="button"
            disabled={isSavingConfiguration}
            onClick={() => {
              void saveVideoConfiguration();
            }}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#5874f6] text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSavingConfiguration ? 'Salvando…' : 'Salvar'}
          </button>

          {feedbackMessage ? (
            <p className="text-center text-[11px] font-bold text-gray-600">{feedbackMessage}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const FormVideoBackgroundBlock = withGuardian(
  FormVideoBackgroundBlockBase,
  'components/builder/blocks/FormVideoBackgroundBlock.tsx',
  'UI_COMPONENT',
  { label: 'Formulário vídeo de fundo (login)', description: 'Cloudinary + URL + pré-visualização.' }
);

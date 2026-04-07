'use client';

import React, { useCallback, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Video, Save, CheckCircle, Smartphone, Link2, Loader2 } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import { useCloudinaryVideo } from '@/hooks/useCloudinaryVideo';
import { ClientVideoFileSelectionSchema } from '@/schemas/video-bg-schema';

function VideoBackgroundManagerBlockBase({ config }: BlockComponentProps): React.JSX.Element {
  const [clientVideoFileRuleErrorMessage, setClientVideoFileRuleErrorMessage] = useState<
    string | null
  >(null);

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

  const requestGalleryFileSelectionWithClearClientErrors = useCallback(() => {
    setClientVideoFileRuleErrorMessage(null);
    requestGalleryFileSelection();
  }, [requestGalleryFileSelection]);

  const handleVideoFileInputChangeWithClientZodValidation = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedVideoFile = event.target.files?.[0];
      if (selectedVideoFile) {
        const validationResult = ClientVideoFileSelectionSchema.safeParse(selectedVideoFile);
        if (!validationResult.success) {
          const messageFromIssue = validationResult.error.issues[0]?.message;
          setClientVideoFileRuleErrorMessage(
            typeof messageFromIssue === 'string' && messageFromIssue.length > 0
              ? messageFromIssue
              : 'Ficheiro de vídeo inválido.'
          );
          event.target.value = '';
          return;
        }
      }
      setClientVideoFileRuleErrorMessage(null);
      void handleVideoFileInputChange(event);
    },
    [handleVideoFileInputChange]
  );

  const combinedUploadRelatedErrorMessage =
    clientVideoFileRuleErrorMessage ?? uploadErrorMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm"
      style={{
        padding: config.style?.padding ?? '1.5rem',
        backgroundColor: config.style?.bgColor,
      }}
    >
      <input
        ref={fileInputReference}
        type="file"
        accept={videoFileInputAcceptAttribute}
        className="sr-only"
        onChange={handleVideoFileInputChangeWithClientZodValidation}
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Video size={20} className="text-[#5874f6]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Vídeo de fundo (login)</h3>
          <p className="text-xs text-gray-500">
            Formatos suportados: MP4, WebM e MOV (máx. 30MB). Upload via Cloudinary (preset no
            dashboard); o painel admin tem de estar desbloqueado.
          </p>
        </div>
      </div>

      {isLoadingInitialConfiguration ? (
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {persistSuccessVisible ? (
              <motion.div
                key="persist-success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-800"
              >
                <CheckCircle size={18} strokeWidth={2.5} />
                Alterações guardadas com sucesso
              </motion.div>
            ) : null}
          </AnimatePresence>

          <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-bold text-gray-800">
            <input
              type="checkbox"
              checked={isVideoActiveOnLogin}
              onChange={(event) => setIsVideoActiveOnLogin(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#5874f6] focus:ring-[#5874f6]"
            />
            Exibir vídeo na tela de login
          </label>

          <button
            type="button"
            disabled={isUploadingVideo}
            onClick={requestGalleryFileSelectionWithClearClientErrors}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#5874f6]/40 bg-blue-50/50 text-sm font-bold text-[#5874f6] transition-all hover:bg-blue-50 disabled:opacity-50"
          >
            {isUploadingVideo ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                A enviar vídeo…
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5" />
                Escolher da galeria (celular)
              </>
            )}
          </button>

          <AnimatePresence>
            {uploadProgressPercentage !== null ? (
              <motion.div
                key="upload-progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full rounded-full bg-[#5874f6]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgressPercentage}%` }}
                    transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-center text-[11px] font-bold tabular-nums text-gray-600">
                  Envio: {Math.round(uploadProgressPercentage)}% concluído
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {combinedUploadRelatedErrorMessage ? (
              <motion.p
                key="upload-error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700"
                role="alert"
              >
                {combinedUploadRelatedErrorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {configurationSaveErrorMessage ? (
              <motion.p
                key="save-error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-900"
                role="alert"
              >
                {configurationSaveErrorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="relative flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              ou URL manual
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex items-start gap-2">
            <Link2 className="mt-3 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <input
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-800 outline-none transition-all focus:border-[#5874f6]"
            />
          </div>

          {videoUrl.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                key={previewVideoSourceUrl}
                muted
                playsInline
                controls
                className="max-h-40 w-full object-contain"
                src={previewVideoSourceUrl}
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void saveVideoConfiguration();
            }}
            disabled={isSavingConfiguration}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5874f6] font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isSavingConfiguration ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                A guardar configuração…
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar URL e estado
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export const VideoBackgroundManagerBlock = withGuardian(
  VideoBackgroundManagerBlockBase,
  'components/builder/blocks/admin/VideoBackgroundManagerBlock.tsx',
  'UI_COMPONENT',
  {
    label: 'Gerenciador de Vídeo de Fundo',
    description: 'UI pura; lógica em useCloudinaryVideo (Cloudinary + Neon).',
  }
);

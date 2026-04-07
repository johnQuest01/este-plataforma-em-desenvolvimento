'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';
import { Film, Save, Smartphone, Loader2 } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import {
  updateFormVideoAction,
  getActiveVideoConfigAction,
  saveVideoReferenceAction,
} from '@/app/actions/video-bg-actions';

function buildBlobPathnameForLoginVideo(selectedFile: File): string {
  const trimmedName = selectedFile.name.trim();
  const baseName = trimmedName.length > 0 ? trimmedName : 'video.mp4';
  const safeCharactersOnly = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cappedLength = safeCharactersOnly.slice(0, 100);
  const nameWithExtension = cappedLength.includes('.') ? cappedLength : `${cappedLength}.mp4`;
  return `login-background/${nameWithExtension}`;
}

function FormVideoBackgroundBlockBase({ config }: BlockComponentProps): React.JSX.Element {
  const { data, style } = config;
  const title = (data.videoFormTitle as string) || 'Vídeo do login';
  const description =
    (data.videoFormDescription as string) || 'Blob direto (celular) ou URL. Pré-visualização abaixo.';
  const helperText = (data.videoFormHelperText as string) || '';

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fileInputReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVideoConfiguration = async () => {
      const response = await getActiveVideoConfigAction();
      if (response.success && response.data) {
        setVideoUrl(response.data.videoUrl);
        setIsActive(response.data.isActive ?? true);
      }
      setIsLoading(false);
    };

    fetchVideoConfiguration();
  }, []);

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    setFeedbackMessage(null);

    const response = await updateFormVideoAction({ videoUrl, isActive });

    setIsSaving(false);
    setFeedbackMessage(response.success ? 'Salvo com sucesso.' : response.error || 'Erro ao salvar.');
  };

  const handleFileSelectionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) return;

    setIsUploading(true);
    setFeedbackMessage(null);
    setUploadProgress(0);

    try {
      const blobPathname = buildBlobPathnameForLoginVideo(selectedFile);

      const uploadResult = await upload(blobPathname, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload/video',
        multipart: true,
        contentType: selectedFile.type.length > 0 ? selectedFile.type : undefined,
        onUploadProgress: (progressEvent: { loaded: number; total: number; percentage: number }) => {
          setUploadProgress(progressEvent.percentage);
        },
      });

      const persistResponse = await saveVideoReferenceAction(uploadResult.url);

      if (!persistResponse.success) {
        setFeedbackMessage(persistResponse.error ?? 'Erro ao guardar a URL.');
        return;
      }

      setVideoUrl(uploadResult.url);
      setIsActive(true);
      setFeedbackMessage('Vídeo enviado e aplicado.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no envio.';
      setFeedbackMessage(
        message.includes('403')
          ? 'Desbloqueie o admin antes de enviar.'
          : message
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

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
        accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
        className="sr-only"
        onChange={handleFileSelectionChange}
      />

      <div className="mb-3 flex items-center gap-2">
        <Film className="h-5 w-5 text-[#5874f6]" />
        <div>
          <h4 className="text-sm font-black text-gray-900">{title}</h4>
          <p className="text-[11px] font-semibold text-gray-500">{description}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputReference.current?.click()}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-dashed border-[#5874f6]/50 bg-blue-50/60 text-[11px] font-bold text-[#5874f6] disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            {isUploading ? 'A enviar…' : 'Escolher da galeria'}
          </button>

          {uploadProgress !== null ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#5874f6]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: 'tween', duration: 0.15 }}
              />
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#5874f6]"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Ativo no login
          </label>

          <input
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://exemplo.com/fundo.mp4"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#5874f6]"
          />

          {helperText ? <p className="text-[10px] text-gray-500">{helperText}</p> : null}

          {videoUrl && isActive ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                key={videoUrl}
                src={videoUrl}
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
            disabled={isSaving}
            onClick={handleSaveConfiguration}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#5874f6] text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando…' : 'Salvar'}
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
  { label: 'Formulário vídeo de fundo (login)', description: 'Blob + URL + pré-visualização.' }
);

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Save, CheckCircle, Smartphone, Link2, Loader2 } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import {
  updateFormVideoAction,
  getFormVideoAction,
  uploadLoginBackgroundVideoAction,
} from '@/app/actions/video-bg-actions';

function VideoBackgroundManagerBlockBase({ config }: BlockComponentProps): React.JSX.Element {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const response = await getFormVideoAction();
      if (response.success && response.data) {
        setVideoUrl(response.data.videoUrl);
        setIsActive(response.data.isActive ?? true);
      }
      setIsLoading(false);
    };
    fetchVideo();
  }, []);

  const handleSaveVideo = async () => {
    setIsSaving(true);
    setSuccessMessage(false);

    const response = await updateFormVideoAction({ videoUrl, isActive });

    setIsSaving(false);
    if (response.success) {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } else {
      alert(response.error);
    }
  };

  const handlePickFile = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.set('video', file);

    const response = await uploadLoginBackgroundVideoAction(formData);
    setIsUploading(false);

    if (response.success && response.videoUrl) {
      setVideoUrl(response.videoUrl);
      setIsActive(true);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } else {
      setUploadError(response.error || 'Falha no envio.');
    }
  };

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
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Video size={20} className="text-[#5874f6]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Vídeo de fundo (login)</h3>
          <p className="text-xs text-gray-500">
            Envie do celular (galeria ou câmera) ou cole uma URL. MP4, WebM ou MOV.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-bold text-gray-800">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#5874f6] focus:ring-[#5874f6]"
            />
            Exibir vídeo na tela de login
          </label>

          <button
            type="button"
            disabled={isUploading}
            onClick={handlePickFile}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#5874f6]/40 bg-blue-50/50 text-sm font-bold text-[#5874f6] transition-all hover:bg-blue-50 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5" /> Escolher vídeo no celular / galeria
              </>
            )}
          </button>

          {uploadError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700">
              {uploadError}
            </p>
          ) : null}

          <div className="relative flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              ou URL
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex items-start gap-2">
            <Link2 className="mt-3 h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="url"
              placeholder="https://…/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-800 outline-none transition-all focus:border-[#5874f6]"
            />
          </div>

          {videoUrl ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                key={videoUrl}
                muted
                playsInline
                controls
                className="max-h-40 w-full object-contain"
                src={videoUrl}
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSaveVideo}
            disabled={isSaving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5874f6] font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              'Salvando…'
            ) : successMessage ? (
              <>
                <CheckCircle size={18} /> Salvo
              </>
            ) : (
              <>
                <Save size={18} /> Salvar URL / estado
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-400">
            O envio grava o arquivo e define este vídeo no login. “Salvar URL / estado” atualiza a URL manual e o interruptor liga/desliga.
          </p>
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
    description: 'Upload do telemóvel ou URL para o vídeo de login.',
  }
);

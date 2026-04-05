'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Film, Save, Smartphone, Loader2 } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import {
  updateFormVideoAction,
  getFormVideoAction,
  uploadLoginBackgroundVideoAction,
} from '@/app/actions/video-bg-actions';

function FormVideoBackgroundBlockBase({ config }: BlockComponentProps): React.JSX.Element {
  const { data, style } = config;
  const title = (data.videoFormTitle as string) || 'Vídeo do login';
  const description =
    (data.videoFormDescription as string) || 'Envie do celular ou URL (MP4 / WebM / MOV).';
  const helperText = (data.videoFormHelperText as string) || '';

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  const fileInputReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVideoConfiguration = async () => {
      const response = await getFormVideoAction();
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
    
    const formData = new FormData();
    formData.set('video', selectedFile);
    
    const response = await uploadLoginBackgroundVideoAction(formData);
    
    setIsUploading(false);
    
    // CORREÇÃO AQUI: Acessando response.data.videoUrl seguindo o contrato estrito
    if (response.success && response.data?.videoUrl) {
      setVideoUrl(response.data.videoUrl);
      setIsActive(true);
      setFeedbackMessage('Vídeo enviado e aplicado com sucesso.');
    } else {
      setFeedbackMessage(response.error || 'Erro no envio do vídeo.');
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
            {isUploading ? 'Enviando vídeo...' : 'Vídeo do celular'}
          </button>

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
          
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveConfiguration}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#5874f6] text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
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
  { label: 'Formulário vídeo de fundo (login)', description: 'Upload ou URL do vídeo global.' }
);
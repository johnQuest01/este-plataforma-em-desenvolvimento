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

  const [videoUrl, setVideoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const res = await getFormVideoAction();
      if (res.success && res.data) {
        setVideoUrl(res.data.videoUrl);
        setIsActive(res.data.isActive ?? true);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await updateFormVideoAction({ videoUrl, isActive });
    setSaving(false);
    setMsg(res.success ? 'Salvo.' : res.error || 'Erro ao salvar.');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setMsg(null);
    const fd = new FormData();
    fd.set('video', file);
    const res = await uploadLoginBackgroundVideoAction(fd);
    setUploading(false);
    if (res.success && res.videoUrl) {
      setVideoUrl(res.videoUrl);
      setIsActive(true);
      setMsg('Vídeo enviado e aplicado.');
    } else {
      setMsg(res.error || 'Erro no envio.');
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
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov"
        className="sr-only"
        onChange={onFile}
      />

      <div className="mb-3 flex items-center gap-2">
        <Film className="h-5 w-5 text-[#5874f6]" />
        <div>
          <h4 className="text-sm font-black text-gray-900">{title}</h4>
          <p className="text-[11px] font-semibold text-gray-500">{description}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-dashed border-[#5874f6]/50 bg-blue-50/60 text-[11px] font-bold text-[#5874f6] disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            {uploading ? 'Enviando…' : 'Vídeo do celular'}
          </button>

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#5874f6]"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Ativo no login
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://…/fundo.mp4"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#5874f6]"
          />
          {helperText ? <p className="text-[10px] text-gray-500">{helperText}</p> : null}
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#5874f6] text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          {msg ? <p className="text-center text-[11px] font-bold text-gray-600">{msg}</p> : null}
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

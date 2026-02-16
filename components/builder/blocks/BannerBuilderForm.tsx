'use client';

/**
 * 🎨 BANNER BUILDER FORM
 * 
 * Formulário completo para criação de banners com:
 * - Validação Zod
 * - Preview em "Celular Virtual"
 * - Seletor visual de Aspect Ratio
 * - Upload de imagem/vídeo
 * - Feedback visual em tempo real
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Check, Loader2, Image as ImageIcon, 
  Video, Monitor, Square, Smartphone, Maximize 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  ASPECT_RATIO_METADATA, 
  type AspectRatioKey,
  MediaTypeEnum 
} from '@/schemas/blocks/banner-creator-schema';
import { saveBannerBlock } from '@/app/actions/banner';

// ========================================
// TYPES
// ========================================

interface BannerBuilderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type MediaType = 'image' | 'video';

// ========================================
// COMPONENT
// ========================================

export const BannerBuilderForm: React.FC<BannerBuilderFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('16/9');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [description, setDescription] = useState('');

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // HANDLERS
  // ========================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validação de tipo
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const allValidTypes = [...validImageTypes, ...validVideoTypes];

    if (!allValidTypes.includes(selectedFile.type)) {
      setError('Formato inválido. Use JPEG, PNG, WebP, GIF ou MP4/WebM');
      return;
    }

    // Validação de tamanho
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Criar preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    // Simular input change
    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      handleFileSelect({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validação básica
      if (!file) {
        setError('Selecione um arquivo');
        setIsSubmitting(false);
        return;
      }

      // Criar FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('mediaType', mediaType);
      formData.append('aspectRatio', aspectRatio);
      formData.append('file', file);
      formData.append('linkUrl', linkUrl);
      formData.append('description', description);

      // Chamar server action
      const result = await saveBannerBlock(formData);

      if (result.success) {
        console.log('✅ Banner criado:', result.data);
        onSuccess?.();
      } else {
        setError(result.message || 'Erro ao criar banner');
      }
    } catch (err) {
      console.error('❌ Erro no submit:', err);
      setError('Erro inesperado ao criar banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 p-6 max-h-[85vh]">
      {/* Coluna Esquerda: Formulário */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2">
            Título do Banner *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Promoção de Verão"
            required
            minLength={3}
            maxLength={100}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium"
          />
        </div>

        {/* Tipo de Mídia */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3">
            Tipo de Mídia *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all',
                'border-2 flex items-center justify-center gap-2',
                mediaType === 'image'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              )}
            >
              <ImageIcon size={18} />
              Imagem
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all',
                'border-2 flex items-center justify-center gap-2',
                mediaType === 'video'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              )}
            >
              <Video size={18} />
              Vídeo
            </button>
          </div>
        </div>

        {/* Seletor de Aspect Ratio */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3">
            Proporção (Aspect Ratio) *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ASPECT_RATIO_METADATA) as AspectRatioKey[]).map((ratio) => {
              const meta = ASPECT_RATIO_METADATA[ratio];
              const isSelected = aspectRatio === ratio;

              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    'hover:scale-105 active:scale-95',
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{meta.icon}</span>
                    <span className="font-black text-sm">{meta.label}</span>
                  </div>
                  <p className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-white/90' : 'text-gray-500'
                  )}>
                    {meta.description}
                  </p>
                  <p className={cn(
                    'text-xs font-black mt-1',
                    isSelected ? 'text-white/70' : 'text-gray-400'
                  )}>
                    {ratio}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload de Arquivo */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2">
            {mediaType === 'image' ? 'Imagem' : 'Vídeo'} *
          </label>
          
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed border-gray-300 rounded-xl p-8',
                'flex flex-col items-center justify-center gap-3',
                'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all',
                'min-h-[160px]'
              )}
            >
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload size={32} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700 mb-1">
                  Clique ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {mediaType === 'image' 
                    ? 'JPEG, PNG, WebP ou GIF (máx 10MB)' 
                    : 'MP4 ou WebM (máx 10MB)'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border-2 border-green-300 bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Check size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={mediaType === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm'}
            className="hidden"
          />
        </div>

        {/* Link (Opcional) */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2">
            Link de Destino (Opcional)
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com/produto"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium"
          />
        </div>

        {/* Descrição (Opcional) */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do banner..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
          />
          <p className="text-xs text-gray-400 font-medium mt-1 text-right">
            {description.length}/500
          </p>
        </div>

        {/* Mensagem de Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-bold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !file || !title}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Check size={18} />
                Salvar Banner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coluna Direita: Preview "Celular Virtual" */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-0">
          <label className="block text-sm font-black text-gray-700 mb-3">
            Preview (Celular Virtual)
          </label>
          
          {/* Moldura do Celular */}
          <div className="relative bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden">
            {/* Notch (Entalhes Superior) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-10" />
            
            {/* Área de Preview */}
            <div className="bg-white w-full aspect-[9/19.5] overflow-y-auto scrollbar-hide">
              <div className="p-4">
                {previewUrl ? (
                  <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
                    {mediaType === 'image' ? (
                      <div className={cn(
                        'relative w-full',
                        ASPECT_RATIO_METADATA[aspectRatio].tailwindClass
                      )}>
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 320px) 100vw, 320px"
                        />
                      </div>
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        className={cn(
                          'w-full',
                          ASPECT_RATIO_METADATA[aspectRatio].tailwindClass,
                          'object-cover'
                        )}
                      />
                    )}
                    
                    {/* Badge de Aspect Ratio */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-lg backdrop-blur-sm">
                      {aspectRatio}
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    'relative w-full bg-gray-100 rounded-xl flex items-center justify-center',
                    ASPECT_RATIO_METADATA[aspectRatio].tailwindClass
                  )}>
                    <div className="text-center p-6">
                      <div className="p-4 bg-gray-200 rounded-full inline-flex mb-3">
                        {mediaType === 'image' ? (
                          <ImageIcon size={32} className="text-gray-400" />
                        ) : (
                          <Video size={32} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-400">
                        Nenhum arquivo selecionado
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {ASPECT_RATIO_METADATA[aspectRatio].label}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informações do Preview */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Proporção:</span>
                    <span className="font-black text-gray-700">
                      {ASPECT_RATIO_METADATA[aspectRatio].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Tipo:</span>
                    <span className="font-black text-gray-700 capitalize">
                      {mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                    </span>
                  </div>
                  {title && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">Título:</p>
                      <p className="font-bold text-sm text-gray-900">{title}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão Home (Indicador) */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full" />
          </div>

          {/* Legenda */}
          <p className="text-xs text-gray-500 font-medium text-center mt-3">
            Visualização exata do corte no mobile
          </p>
        </div>
      </div>
    </form>
  );
};

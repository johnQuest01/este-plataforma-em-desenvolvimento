'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryItem } from '@/types/builder';

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CategoryItem | null;
}

export const ReelsModal = ({ isOpen, onClose, item }: ReelsModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // --- ESTADOS ---
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Importante para UX

  // --- 1. LISTA DE STORIES (Memoizada) ---
  const stories = useMemo(() => {
    if (!item?.videoUrl) return [];
    return [
      item.videoUrl,
      // Vídeos de exemplo para testar a navegação
      'https://videos.pexels.com/video-files/5309381/5309381-hd_720_1280_25fps.mp4',
      'https://videos.pexels.com/video-files/855018/855018-hd_1280_720_30fps.mp4'
    ];
  }, [item]);

  const activeVideoUrl = stories[currentStoryIndex];

  // --- 2. RESET AO ABRIR ---
  useEffect(() => {
    if (isOpen) {
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsPlaying(true);
      setIsLoading(true);
      setIsMuted(false); 
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isOpen]);

  // --- 3. CONTROLE DE REPRODUÇÃO ROBUSTO (Correção Técnica) ---
  useEffect(() => {
    if (!isOpen || !videoRef.current || !activeVideoUrl) return;

    const videoEl = videoRef.current;
    
    // Reseta visualmente
    setProgress(0);
    setIsLoading(true);

    const playVideo = async () => {
      try {
        videoEl.currentTime = 0;
        await videoEl.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn("Autoplay bloqueado. Tentando modo mudo...", error);
        // Fallback: Se o navegador bloquear o som, muta e tenta de novo
        setIsMuted(true);
        try {
          videoEl.muted = true;
          await videoEl.play();
          setIsPlaying(true);
        } catch (retryError) {
          console.error("Erro fatal no vídeo:", retryError);
          setIsPlaying(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    playVideo();

    // Cleanup: Pausa se mudar de vídeo ou fechar
    return () => {
      videoEl.pause();
    };
  }, [isOpen, activeVideoUrl, currentStoryIndex]);

  // --- HANDLERS ---

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration > 0) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    }
  };

  // Eventos de Loading do Vídeo
  const handleVideoLoadStart = () => setIsLoading(true);
  const handleVideoLoadedData = () => setIsLoading(false);

  const nextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose(); // Fecha no último
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      // Reinicia o primeiro vídeo
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentStoryIndex]);

  // Toque estilo Instagram (Esq = Voltar, Dir = Avançar)
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const clickX = e.nativeEvent.offsetX;

    if (clickX < width * 0.3) {
      prevStory();
    } else {
      nextStory();
    }
  };

  // Pausa ao segurar o clique
  const handlePointerDown = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handlePointerUp = () => {
    videoRef.current?.play().catch(() => setIsMuted(true));
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
        
        {/* Backdrop (Clica fora para fechar) */}
        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* O POPUP (Visual "Card" que você gosta) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className={cn(
            "pointer-events-auto relative bg-black overflow-hidden flex flex-col shadow-2xl shadow-black/50 z-10",
            // AQUI ESTÁ A CONFIGURAÇÃO VISUAL QUE VOCÊ PEDIU:
            "w-[95%] h-[85vh] rounded-[1.5rem]", 
            "lg:w-[400px] lg:h-[750px]"
          )}
        >
            {/* --- TIMELINE --- */}
            <div className="absolute top-0 left-0 w-full p-2 z-30 flex gap-1 pt-4 px-3 pointer-events-none">
              {stories.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ 
                      width: idx < currentStoryIndex ? '100%' : 
                             idx === currentStoryIndex ? `${progress}%` : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* --- VÍDEO --- */}
            <div 
              className="absolute inset-0 z-0 bg-gray-900 cursor-pointer"
              onClick={handleVideoClick}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
            >
                {activeVideoUrl ? (
                    <video
                        ref={videoRef}
                        src={activeVideoUrl}
                        className="w-full h-full object-cover"
                        playsInline
                        webkit-playsinline="true" // Essencial para iPhone
                        muted={isMuted}
                        onLoadStart={handleVideoLoadStart}
                        onLoadedData={handleVideoLoadedData}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={nextStory}
                    />
                ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                        <span className="text-white/30 font-bold text-sm">Sem Vídeo</span>
                     </div>
                )}
                
                {/* Gradientes para leitura de texto */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                
                {/* Loader Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
                  </div>
                )}
            </div>

            {/* --- BOTÕES TOPO --- */}
            <div className="absolute top-4 left-0 w-full p-4 pt-6 flex justify-between items-start z-20 pointer-events-none">
                <button 
                    onClick={toggleMute}
                    className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors pointer-events-auto"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors pointer-events-auto"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* --- RODAPÉ INFO --- */}
            <div className="absolute bottom-0 w-full p-5 pb-8 flex flex-col gap-4 z-20 pointer-events-none">
                <div className="pointer-events-auto text-left px-1 animate-in slide-in-from-bottom-4 duration-500">
                    <span 
                        className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 text-white shadow-lg border border-white/20"
                        style={{ backgroundColor: item.videoColor || '#5874f6' }}
                    >
                        {item.label}
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase leading-none drop-shadow-xl mb-2 tracking-tight">
                        {currentStoryIndex === 0 ? "Coleção Exclusiva" : `Look ${currentStoryIndex + 1}`}
                    </h2>
                    <p className="text-white/80 text-sm font-medium leading-snug drop-shadow-md line-clamp-2 max-w-[95%]">
                        Toque na tela para ver mais detalhes deste produto incrível.
                    </p>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        // Aqui você pode disparar a abertura do produto específico
                        console.log("Comprar Clicado:", item.label);
                    }}
                    className="w-full h-14 bg-white rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-transform pointer-events-auto group mt-2 ring-1 ring-white/50"
                >
                    <div 
                        className="p-1.5 rounded-full text-white transition-colors"
                        style={{ backgroundColor: item.videoColor || '#000' }}
                    >
                        <ShoppingBag size={16} strokeWidth={3} />
                    </div>
                    <span 
                        className="font-black text-base uppercase tracking-widest"
                        style={{ color: item.videoColor || '#000' }}
                    >
                        Ver Produtos
                    </span>
                </button>
            </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Sparkles, Share2, Upload, Loader2 } from 'lucide-react';
import { generateVirtualTryOn } from '@/app/actions/try-on';
import { addWatermarkToImage } from '@/lib/watermark-helper';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
  productCategory?: string;
}

type Step = 'upload' | 'processing' | 'result';

// --- HELPER PARA DESCOBRIR A CATEGORIA DA IA ---
const getIACategory = (name: string, category?: string): 'upper_body' | 'lower_body' | 'dresses' => {
  const text = (name + ' ' + (category || '')).toLowerCase();

  if (text.includes('vestido') || text.includes('dress') || text.includes('longo') || text.includes('body')) {
    return 'dresses';
  }

  if (
    text.includes('calça') || text.includes('short') || text.includes('saia') || 
    text.includes('bermuda') || text.includes('jeans') || text.includes('legging') ||
    text.includes('calca')
  ) {
    return 'lower_body';
  }

  return 'upper_body';
};

export const TryOnModal = ({ isOpen, onClose, productImage, productName, productCategory }: TryOnModalProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [userPreview, setUserPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNÇÃO DE COMPRESSÃO (VERSÃO PNG) ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          const MAX_WIDTH = 1024;
          const scaleSize = MAX_WIDTH / img.width;
          const finalScale = scaleSize < 1 ? scaleSize : 1;

          canvas.width = img.width * finalScale;
          canvas.height = img.height * finalScale;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL('image/png');
            resolve(compressedBase64);
          } else {
            resolve(event.target?.result as string);
          }
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await compressImage(file);
        setUserPreview(compressedBase64);
      } catch (err) {
        console.error("Erro ao processar imagem", err);
        alert("Erro ao ler a imagem. Tente outra foto.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!userPreview) return;
    setStep('processing');

    const targetCategory = getIACategory(productName, productCategory);
    console.log(`🤖 IA Configurada para: ${targetCategory} (Produto: ${productName})`);

    try {
        const response = await generateVirtualTryOn({
            userImage: userPreview,
            garmentImage: productImage,
            category: targetCategory
        });

        if (response.success && response.imageUrl) {
            setResultImage(response.imageUrl);
            setStep('result');
        } else {
            const msg = response.error || "Erro ao gerar look. Tente uma foto com fundo mais limpo!";
            alert(`⚠️ ${msg}`);
            setStep('upload');
        }
    } catch (error) {
        console.error("Erro no front:", error);
        alert("Erro de conexão. Verifique sua internet.");
        setStep('upload');
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;

    try {
      const blobWithWatermark = await addWatermarkToImage(resultImage, "LOJA MARYLAND");
      if (!blobWithWatermark) return;

      const file = new File([blobWithWatermark], "meu-look-maryland.jpg", { type: "image/jpeg" });

      if (navigator.share) {
        await navigator.share({
          title: `Olha esse look da Maryland!`,
          text: `Provei virtualmente essa roupa: ${productName}. O que acharam?`,
          files: [file]
        });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blobWithWatermark);
        a.download = "meu-look.jpg";
        a.click();
      }
    } catch (error) {
      console.error("Erro ao compartilhar", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop Escuro */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}
          />

          {/* Card do Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-[#5874f6] to-[#4a63d6] text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                <span className="font-black uppercase tracking-wide text-sm">Provador Mágico</span>
              </div>
              <button onClick={onClose}><X size={20}/></button>
            </div>

            <div className="p-5 flex flex-col items-center flex-1 overflow-y-auto">

              {/* TELA 1: UPLOAD */}
              {step === 'upload' && (
                <div className="flex flex-col gap-4 w-full animate-in fade-in">
                  <div className="bg-blue-50 p-3 rounded-xl flex gap-3 items-center border border-blue-100">
                    <div className="relative w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border overflow-hidden">
                      <Image 
                        src={productImage} 
                        alt="Roupa" 
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <p className="text-xs text-blue-800 font-bold leading-tight">
                      Vamos provar:<br/>
                      <span className="text-black">{productName}</span>
                    </p>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
                  >
                    {userPreview ? (
                      <Image 
                        src={userPreview} 
                        alt="Preview" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                          <Camera size={32} />
                        </div>
                        <h3 className="font-bold text-gray-700">Tire uma foto sua</h3>
                        <p className="text-xs text-gray-400 mt-1">De corpo inteiro e em local iluminado</p>
                      </div>
                    )}

                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                    
                    {userPreview && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <span className="text-white font-bold flex gap-2"><Upload size={16}/> Trocar Foto</span>
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={!userPreview}
                    onClick={handleGenerate}
                    className="w-full py-4 bg-[#00c853] text-white font-black uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Gerar Look Agora
                  </button>
                </div>
              )}

              {/* TELA 2: PROCESSANDO */}
              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 gap-6 text-center w-full h-full animate-in zoom-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <Loader2 size={64} className="text-[#5874f6] animate-spin relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 mb-1">Costurando seu Look...</h3>
                    <p className="text-sm text-gray-500 px-4">A IA está vestindo a roupa em você. Isso leva cerca de 15 a 30 segundos.</p>
                  </div>
                </div>
              )}

              {/* TELA 3: RESULTADO */}
              {step === 'result' && resultImage && (
                <div className="flex flex-col gap-4 w-full animate-in slide-in-from-bottom-10">
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-md border border-gray-100">
                    <Image 
                      src={resultImage} 
                      alt="Resultado" 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-bold z-10">
                       Criado com IA Maryland
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep('upload')}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase active:scale-95 transition-transform"
                    >
                      Tentar Outra
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex-[2] py-3 bg-[#5874f6] text-white font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Compartilhar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
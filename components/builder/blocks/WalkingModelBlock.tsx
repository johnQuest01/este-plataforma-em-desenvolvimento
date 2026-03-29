'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';

export const WalkingModelBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { data, style } = config;
  
  const imagesArray: string[] = Array.isArray(data.walkingModelImages) 
    ? data.walkingModelImages 
    :[];
    
  const animationDuration: number = typeof data.animationDurationSeconds === 'number' 
    ? data.animationDurationSeconds 
    : 30;

  // Se não houver imagens, não renderiza o bloco para evitar quebras na UI
  if (imagesArray.length === 0) {
    return null;
  }

  // Duplicamos o array de imagens para criar a ilusão de um loop infinito perfeito.
  // Quando a primeira metade termina de passar, a segunda metade já está na tela.
  const duplicatedImagesArray: string[] = [...imagesArray, ...imagesArray];

  return (
    <section 
      className="w-full overflow-hidden py-6 relative flex items-center"
      style={{ backgroundColor: style.bgColor || 'transparent' }}
      aria-label="Modelos em movimento"
    >
      {/* Gradientes laterais para suavizar a entrada e saída das imagens */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-4 w-max pl-4"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          ease: 'linear',
          duration: animationDuration,
          repeat: Infinity,
        }}
      >
        {duplicatedImagesArray.map((imageUrl, currentIndex) => (
          <div 
            key={`walking-model-${currentIndex}`} 
            // ✅ DIMENSÕES EXATAS DO CARD DE PRODUTO: w-44 e aspect-[4/4.5]
            className="relative w-44 aspect-[4/4.5] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-gray-100 bg-gray-100 group"
          >
            {/* Utilizamos a tag img padrão para evitar erros de configuração de domínios no next/image. */}
            <img 
              src={imageUrl} 
              alt={`Modelo em movimento ${currentIndex + 1}`} 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
};
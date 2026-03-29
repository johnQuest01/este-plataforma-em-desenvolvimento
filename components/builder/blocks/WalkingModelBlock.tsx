'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';

export const WalkingModelBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { data, style } = config;

  // Imagens padrão localizadas em /public/models/
  const defaultImages: string[] = [
    '/models/modelo.1.png', '/models/modelo.2.png', '/models/modelo.3.png',
    '/models/modelo.4.png', '/models/modelo.5.png', '/models/modelo.6.png'
  ];

  const imagesArray: string[] = Array.isArray(data.walkingModelImages) && data.walkingModelImages.length > 0
    ? data.walkingModelImages
    : defaultImages;

  const animationDuration: number = typeof data.animationDurationSeconds === 'number'
    ? data.animationDurationSeconds
    : 12;

  const [frameIndex, setFrameIndex] = useState<number>(0);

  // Ciclo de Sprite (Troca de PNGs)
  useEffect(() => {
    if (imagesArray.length <= 1) return;
    const intervalId = setInterval(() => {
      setFrameIndex((current) => (current + 1) % imagesArray.length);
    }, 100); // 100ms para um passo fluido
    return () => clearInterval(intervalId);
  }, [imagesArray.length]);

  if (imagesArray.length === 0) return null;

  return (
    <section 
      className="w-full overflow-hidden py-2 relative flex items-center pointer-events-none"
      style={{ backgroundColor: style.bgColor || 'transparent' }}
    >
      {/* 🚀 ANTI-FLICKER: Força o browser a manter as imagens em cache */}
      <div className="hidden">
        {imagesArray.map((img) => (
          <img key={img} src={img} alt="preload" />
        ))}
      </div>

      <motion.div
        initial={{ x: '110vw' }} // Começa fora da tela (Direita)
        animate={{ x: '-20vw' }}  // Termina fora da tela (Esquerda)
        transition={{
          repeat: Infinity,
          duration: animationDuration,
          ease: 'linear',
        }}
        // 📏 TAMANHO SINCRONIZADO: w-24 (96px) para bater com seus Product Cards
        className="relative w-24 flex-shrink-0 pointer-events-auto"
        style={{
          aspectRatio: '271 / 920',
          backgroundImage: `url(${imagesArray[frameIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </section>
  );
};
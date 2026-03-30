'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';

export const WalkingModelBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { data, style } = config;
  
  // 🛡️ ZERO-ERROR FALLBACK
  const defaultImages: string[] =[
    '/models/modelo.1.png',
    '/models/modelo.2.png',
    '/models/modelo.3.png',
    '/models/modelo.4.png',
    '/models/modelo.5.png',
    '/models/modelo.6.png'
  ];

  const imagesArray: string[] = Array.isArray(data.walkingModelImages) && data.walkingModelImages.length > 0
    ? data.walkingModelImages 
    : defaultImages;
    
  // ✅ Lógica do Banner
  const bannerImage: string | null = typeof data.walkingModelBanner === 'string' && data.walkingModelBanner.trim() !== ''
    ? data.walkingModelBanner
    : '/models/maryland-banner.png'; // Fallback para a imagem que enviaste
    
  const animationDuration: number = typeof data.animationDurationSeconds === 'number' 
    ? data.animationDurationSeconds 
    : 12;

  const [frameIndex, setFrameIndex] = useState<number>(0);

  useEffect(() => {
    if (imagesArray.length === 0) return;

    const intervalId = setInterval(() => {
      setFrameIndex((current) => (current + 1) % imagesArray.length);
    }, 120);

    return () => clearInterval(intervalId);
  }, [imagesArray.length]);

  if (imagesArray.length === 0) return null;

  return (
    <section 
      className="w-full overflow-hidden py-4 relative flex items-center pointer-events-none min-h-[350px]"
      style={{ backgroundColor: style.bgColor || 'transparent' }}
      aria-label="Modelo e Banner em movimento"
    >
      <motion.div
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{
          repeat: Infinity,
          duration: animationDuration,
          ease: 'linear',
        }}
        // ✅ w-max garante que o contêiner estique para caber a modelo + banner
        className="flex items-center gap-6 w-max pointer-events-auto"
      >
        {/* 🚶‍♀️ A MODELO (Liderando a caminhada) */}
        <div className="relative h-[320px] aspect-[271/920] flex-shrink-0 bg-transparent">
          {imagesArray.map((imgSrc, index) => (
            <img 
              key={`sprite-frame-${index}`}
              src={imgSrc} 
              alt={`Frame da modelo ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-contain transition-none ${
                index === frameIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              loading="eager" 
              decoding="sync"
            />
          ))}
        </div>

        {/* 🎀 O BANNER (Seguindo a modelo) */}
        {bannerImage && (
          <img 
            src={bannerImage} 
            alt="Maryland Banner" 
            // Altura proporcional à modelo (100px fica elegante ao lado de 320px)
            className="h-[100px] object-contain flex-shrink-0 drop-shadow-xl"
            loading="lazy"
            decoding="async"
          />
        )}
      </motion.div>
    </section>
  );
};
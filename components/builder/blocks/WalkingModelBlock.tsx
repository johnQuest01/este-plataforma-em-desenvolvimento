'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';

export const WalkingModelBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { data, style } = config;

  const defaultImages: string[] = [
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

  const animationDuration: number = typeof data.animationDurationSeconds === 'number'
    ? data.animationDurationSeconds
    : 12;

  const frameCount = imagesArray.length;
  const [frameIndex, setFrameIndex] = useState<number>(0);

  useEffect(() => {
    if (frameCount <= 1) return;
    const intervalId = setInterval(() => {
      setFrameIndex((current) => (current + 1) % frameCount);
    }, 80); 
    return () => clearInterval(intervalId);
  }, [frameCount]);

  if (frameCount === 0) return null;

  return (
    <section
      className="w-full overflow-hidden py-2 relative flex items-center pointer-events-none"
      style={{ backgroundColor: style.bgColor || 'transparent' }}
    >
      {/* 🚀 SOLUÇÃO ANTI-FLICKER: Preloading das imagens */}
      <div className="hidden">
        {imagesArray.map((img) => (
          <img key={img} src={img} alt="preload" />
        ))}
      </div>

      <motion.div
        initial={{ x: '110vw' }}
        animate={{ x: '-20vw' }}
        transition={{
          repeat: Infinity,
          duration: animationDuration,
          ease: 'linear',
        }}
        className="relative w-24 flex-shrink-0 pointer-events-auto"
        style={{ 
            aspectRatio: '271 / 920',
            // Usamos backgroundImage com swap instantâneo para performance máxima
            backgroundImage: `url(${imagesArray[frameIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      />
    </section>
  );
};
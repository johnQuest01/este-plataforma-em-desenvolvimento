'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// --- Sub-component for Animated Dots (Zero Layout Shift) ---
const LoadingDots = () => {
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <span className="inline-flex ml-0.5 w-2 justify-start">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
          variants={dotVariants}
        >
          .
        </motion.span>
      ))}
    </span>
  );
};

export const DevelopmentCard = () => {
  const [percentage, setPercentage] = useState(69);

  useEffect(() => {
    // setTimeout(..., 0) move a atualização para o próximo ciclo de eventos,
    // resolvendo o erro de "setState synchronously within an effect".
    const timer = setTimeout(() => {
      // LOGIC: 1% every 2 days starting from 01/01/2026
      const startDate = new Date('2026-01-01').getTime();
      const now = new Date().getTime();

      const diffTime = Math.abs(now - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const increment = Math.floor(diffDays / 2);
      const finalPercentage = Math.min(69 + increment, 100);

      setPercentage(finalPercentage);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[280px] aspect-square flex items-center justify-center shrink-0"
    >
      {/* 1. BACKGROUND: card-bg-blue.svg */}
      <Image
        src="/card-bg-blue.svg"
        alt="Background"
        fill
        priority
        className="object-contain z-0 drop-shadow-2xl"
        sizes="(max-width: 768px) 100vw, 280px"
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full p-6 py-8">
        
        {/* Top Text */}
        <h3 className="text-2xl font-black text-black tracking-tight mt-1">
          Plataforma
        </h3>

        {/* 2. BANNER + TEXT */}
        <div className="relative w-full flex items-center justify-center py-1 h-12">
          {/* Banner Red */}
          <Image
            src="/card-banner-red.svg"
            alt="Banner Red"
            width={300}
            height={100}
            className="absolute w-[95%] h-auto object-contain z-0 transform -rotate-1"
          />
          {/* Maryland Text */}
          <Image
            src="/text-maryland-outline.svg"
            alt="Maryland"
            width={300}
            height={100}
            className="relative z-10 w-[75%] h-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* 3. PROGRESS BAR: Strictly Contained Architecture */}
        <div className="w-full relative h-11 flex items-center justify-center mt-1">
          
          {/* A. Outer Frame (SVG) - The "Shell" */}
          <Image
            src="/ui-progress-container.svg"
            alt="Progress Container"
            fill
            className="object-contain z-10 pointer-events-none"
            sizes="280px"
          />

          {/* B. Inner Content Area - The "Pill Interior" */}
          <div className="absolute inset-[4px] z-20 rounded-full overflow-hidden bg-white">
            
            {/* C. Green Fill (Clean, No Border) */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-[#4ade80] rounded-l-full"
            />

            {/* D. Text Overlay (Centered absolutely over the fill) */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex items-center text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wide"
              >
                <span className="whitespace-nowrap">Em Desenvolvimento</span>
                <LoadingDots />
                <span className="ml-1">{percentage}%</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-lg font-bold text-black mb-0 leading-tight">
          Lançaremos em Breve
        </p>
      </div>
    </motion.div>
  );
};
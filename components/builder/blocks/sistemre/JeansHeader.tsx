'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- CONSTANTES DE MOTION (PREMIUM) ---
const floatingCrownMotion = {
  animate: { 
    y: [0, -15, 0], 
    rotate: [0, 5, -5, 0],
    filter: [
      "drop-shadow(0 0 0px rgba(255,215,0,0))", 
      "drop-shadow(0 0 20px rgba(255,215,0,0.6))", 
      "drop-shadow(0 0 0px rgba(255,215,0,0))"
    ]
  },
  transition: { 
    repeat: Infinity, 
    duration: 5,
    // CORREÇÃO: 'as const' garante que o TS entenda que é um Easing válido, não uma string qualquer
    ease: "easeInOut" as const 
  }
};

export const JeansHeader = () => {
  return (
    <div className="relative w-full max-w-[340px] h-40 flex items-center justify-center mb-8 mt-6 shrink-0 pointer-events-none">
      {/* Background com Entrada Suave */}
      <motion.img
        src="/background.svg"
        alt="Background Card"
        className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem] drop-shadow-xl z-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Logo com Spring Pop-up */}
      <motion.img
        src="/logo-maryland.svg"
        alt="Maryland Logo"
        className="relative z-10 w-[125%] object-contain -mt-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 15 }}
      />
      
      {/* Coroa com Motion Flutuante (Signature) */}
      <motion.img
        src="/crown.svg"
        alt="Golden Crown"
        className="absolute -top-44 left-1/2 -translate-x-1/2 z-20 w-[32rem] h-[32rem] object-contain"
        initial={{ y: -50, opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, ...floatingCrownMotion.animate }}
        transition={{
          // Espalha as propriedades de loop (repeat, duration, ease)
          ...floatingCrownMotion.transition,
          // Sobrescreve apenas a opacidade para a entrada inicial
          opacity: { duration: 0.5, delay: 0.4 }
        }}
      />
    </div>
  );
};
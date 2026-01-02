// components/builder/blocks/StandardButtonBlock.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { StandardButtonDataSchema } from '@/schemas/blocks/button-schema';

export const StandardButtonBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  // Validação Segura dos Dados do Bloco
  const result = StandardButtonDataSchema.safeParse(config.data);
  
  if (!result.success) {
    return (
      <div className="p-2 text-[10px] text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
        Erro de Configuração no Botão: {result.error.message}
      </div>
    );
  }

  const { label, variant, size, actionType, fullWidthMobile } = result.data;

  // Mapeamento de Estilos via Tailwind 4
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
    outline: "bg-transparent border-2 border-zinc-800 text-zinc-300 hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-4 text-sm",
    lg: "px-8 py-5 text-base"
  };

  return (
    <div className="p-2 w-full flex justify-center">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAction?.(actionType, config.data)}
        className={`
          ${variants[variant]} 
          ${sizes[size]}
          ${fullWidthMobile ? "w-full md:w-auto" : "w-auto"}
          rounded-2xl font-black uppercase tracking-widest
          transition-all duration-200 cursor-pointer
          flex items-center justify-center gap-3
        `}
      >
        {label}
        <span className="opacity-50 text-[10px]">→</span>
      </motion.button>
    </div>
  );
};
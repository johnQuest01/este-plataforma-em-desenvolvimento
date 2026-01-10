// components/builder/blocks/StandardButtonBlock.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { StandardButtonDataSchema } from '@/schemas/blocks/button-schema';

/**
 * StandardButtonBlock: Componente Lego para botões padronizados.
 * Implementa validação via Zod e animações Framer Motion.
 */
export const StandardButtonBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  // Validação dos dados do bloco conforme o contrato do Schema
  const result = StandardButtonDataSchema.safeParse(config.data);
  
  if (!result.success) {
    return (
      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
        {/* ✅ CORREÇÃO: No Zod, os erros de validação ficam em .issues, não em .errors */}
        [LEGO_ERR]: {result.error.issues[0].message}
      </div>
    );
  }

  const { label, variant, size, actionType, fullWidthMobile, payload } = result.data;

  /**
   * Mapeamento de Estilos (Strict Typing)
   * ✅ ADICIONADO: Variantes 'ghost', 'link' e tamanho 'icon' para satisfazer o schema.
   */
  const styles = {
    variants: {
      primary: "bg-[#5874f6] text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500",
      secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
      outline: "bg-transparent border-2 border-zinc-800 text-zinc-400 hover:bg-zinc-800",
      danger: "bg-red-600 text-white hover:bg-red-500",
      ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
      link: "bg-transparent text-[#5874f6] hover:underline px-0 h-auto"
    },
    sizes: {
      sm: "h-10 px-6 text-xs",
      md: "h-14 px-8 text-sm",
      lg: "h-16 px-12 text-base",
      icon: "h-12 w-12 p-0"
    }
  };

  return (
    <div className="w-full p-2 flex justify-center">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onAction?.(actionType, payload)}
        className={`
          ${styles.variants[variant]} 
          ${styles.sizes[size]}
          ${fullWidthMobile ? "w-full md:w-auto" : "w-auto"}
          rounded-[1.4rem] font-black uppercase tracking-[0.15em]
          transition-all duration-300 cursor-pointer
          flex items-center justify-center gap-3
        `}
      >
        {label}
        {variant !== 'link' && <span className="opacity-30 text-xs">→</span>}
      </motion.button>
    </div>
  );
};
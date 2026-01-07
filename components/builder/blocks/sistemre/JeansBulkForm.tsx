'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface JeansBulkFormProps {
  bulkTextInput: string;
  setBulkTextInput: (val: string) => void;
  handleBulkProcess: () => void;
  isPending: boolean;
}

export const JeansBulkForm = ({
  bulkTextInput,
  setBulkTextInput,
  handleBulkProcess,
  isPending
}: JeansBulkFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Card Estilo "Mayra" - Agora sempre expandido */}
      <div className="w-full bg-white border-[3px] border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
        
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-black text-black leading-tight">
              2. Arquivo bruto bagunçado
            </span>
            <span className="text-xs font-bold text-gray-500">
              Joga aqui que eu me viro (Mayra)
            </span>
          </div>
          <div className="text-2xl font-black text-[#5874f6] animate-pulse">
            +
          </div>
        </div>

        {/* Área de Texto (Sempre visível) */}
        <div className="relative">
          <textarea
            value={bulkTextInput}
            onChange={(e) => setBulkTextInput(e.target.value)}
            placeholder={`Exemplo:\nCalça Skinny, 38, 10, REF001\nShorts Jeans, 40, 5, REF002`}
            className={twMerge(
              "w-full h-48 bg-gray-50 border-2 border-gray-200 rounded-xl p-4",
              "text-sm font-bold text-black resize-none",
              "focus:border-[#5874f6] focus:bg-white outline-none transition-all",
              "placeholder:text-gray-400 placeholder:font-normal"
            )}
          />
          
          {/* Dica flutuante */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <span className="text-[10px] font-black text-gray-300 uppercase">
              Cole sua lista aqui
            </span>
          </div>
        </div>

        {/* Botão de Ação */}
        <button
          onClick={handleBulkProcess}
          disabled={isPending}
          className={twMerge(
            "w-full bg-[#5874f6] text-white font-black text-lg py-4 rounded-xl uppercase tracking-wide",
            "shadow-md active:scale-[0.98] transition-all hover:bg-[#4660d6]",
            isPending && "opacity-70 cursor-wait"
          )}
        >
          {isPending ? 'Processando Estoque...' : 'Processar Estoque'}
        </button>

      </div>
    </motion.div>
  );
};
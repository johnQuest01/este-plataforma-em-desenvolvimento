'use client';

import React, { useState } from 'react';
import { BlockConfig } from '@/types/builder';
import { CheckCircle2, Crown, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const AdminUserCardBlock = ({ config }: { config: BlockConfig }) => {
  // Extração de dados com fallbacks seguros
  const userName = (config.data.userName as string) || 'Admin';
  const roleLabel = (config.data.roleLabel as string) || 'Gerente';
  const userImage = (config.data.userImage as string) || '';
  
  // Estado local para interatividade imediata (simulação)
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div 
      className="w-full px-4 pt-2 pb-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {/* Container Principal: Card Branco com Sombra Suave e Borda Fina */}
      <div className="bg-white rounded-3xl p-3 pr-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between relative overflow-hidden">
        
        {/* Efeito de Fundo Decorativo (Opcional, dá um toque premium) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none" />

        {/* ESQUERDA: Avatar e Identificação */}
        <div className="flex items-center gap-3 relative z-10">
          
          {/* Avatar com Anel de Status */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#5874f6] to-blue-300">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-50">
                <img
                  src={userImage || 'https://placehold.co/150x150/e0f2fe/5874f6?text=M'}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Badge de Verificado Absoluto */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" strokeWidth={3} />
            </div>
          </div>

          {/* Textos */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-gray-900 text-lg leading-none tracking-tight">
                {userName}
              </h3>
              {/* Badge de Cargo (Pequeno e Discreto) */}
              <span className="px-1.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-100 text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
                <Crown size={10} className="fill-yellow-500 text-yellow-600" />
                {roleLabel}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-400 mt-1">
              Loja Oficial Maryland
            </span>
          </div>
        </div>

        {/* DIREITA: Toggle de Status "iPhone Style" */}
        <div className="flex flex-col items-end gap-1 relative z-10">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center px-1 shadow-inner",
              isOnline ? "bg-[#00c853]" : "bg-gray-200"
            )}
          >
            {/* Bolinha do Toggle */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className={cn(
                "w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center",
                isOnline ? "ml-auto" : "ml-0"
              )}
            >
              <Power size={12} className={cn("font-bold", isOnline ? "text-[#00c853]" : "text-gray-400")} strokeWidth={3} />
            </motion.div>
          </button>
          
          {/* Label do Status */}
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider transition-colors mr-1",
            isOnline ? "text-[#00c853]" : "text-gray-400"
          )}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

      </div>
    </div>
  );
};
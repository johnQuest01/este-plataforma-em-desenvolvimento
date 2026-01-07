'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface JeansSessionCardProps {
  sessionRefs: { ref: string; hasImage: boolean }[];
}

export const JeansSessionCard = ({ sessionRefs }: JeansSessionCardProps) => {
  if (!sessionRefs || sessionRefs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full bg-zinc-900 text-white rounded-xl p-4 shadow-xl mb-4 flex flex-col gap-3 border border-zinc-800"
    >
      <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/>
          Sessão Atual
        </span>
        <span className="text-lg font-black">
          {sessionRefs.length} <span className="text-[10px] font-normal text-zinc-400">refs</span>
        </span>
      </div>
      
      <div className="max-h-32 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-hide">
        {sessionRefs.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center text-xs bg-black/40 px-3 py-2 rounded-lg border border-zinc-800"
          >
            <span className="font-mono font-bold text-white text-sm">{item.ref}</span>
            {item.hasImage ? (
              <span className="text-[9px] font-bold text-[#00c853] bg-[#00c853]/10 px-2 py-0.5 rounded border border-[#00c853]/30 uppercase tracking-wider">
                Imagem OK
              </span>
            ) : (
              <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/30 uppercase tracking-wider">
                Sem Imagem
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
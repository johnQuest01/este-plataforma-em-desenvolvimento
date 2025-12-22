'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';

export const HistorySearchBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string, payload?: unknown) => void }) => {
  return (
    <div className="w-full px-6 py-6 flex flex-col items-center gap-6 bg-white">
      <h2 className="text-lg font-black text-black uppercase tracking-wide">
        {config.data.title as string || 'Histórico'}
      </h2>

      <div className="w-full flex flex-col gap-2">
        <label className="text-base font-bold text-black">
          Nome / Gmail / ou id do cliente
        </label>
        <input 
          type="text" 
          placeholder="Digite para buscar..."
          onChange={(e) => onAction && onAction('search_input', e.target.value)}
          className="w-full h-12 border-2 border-black rounded-xl px-4 text-sm font-bold focus:border-[#5874f6] outline-none transition-colors"
        />
      </div>

      <div className="flex items-center gap-4 w-full justify-center">
        <span className="text-xl font-bold text-black">data</span>
        <div className="flex gap-2 items-center">
            <input type="text" placeholder="DD" className="w-12 text-center border-b-2 border-black font-bold outline-none focus:border-[#5874f6]" />
            <span className="font-black text-xl">/</span>
            <input type="text" placeholder="MM" className="w-12 text-center border-b-2 border-black font-bold outline-none focus:border-[#5874f6]" />
            <span className="font-black text-xl">/</span>
            <input type="text" placeholder="AAAA" className="w-16 text-center border-b-2 border-black font-bold outline-none focus:border-[#5874f6]" />
        </div>
      </div>

      <button 
        onClick={() => onAction && onAction('search_click')}
        className="bg-[#5874f6] text-white font-bold text-lg px-12 py-2 rounded-xl shadow-md active:scale-95 transition-transform mt-2"
      >
        Buscar
      </button>
    </div>
  );
};
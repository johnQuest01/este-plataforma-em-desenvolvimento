'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface JeansLinkFormProps {
  refImageInput: string;
  setRefImageInput: (val: string) => void;
  handleLinkImage: () => void;
  isPending: boolean;
}

export const JeansLinkForm = ({
  refImageInput,
  setRefImageInput,
  handleLinkImage,
  isPending
}: JeansLinkFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col gap-3"
    >
      <div className="flex justify-between items-center">
        <label className="text-xs font-black uppercase text-gray-500 tracking-wider">
          1. Vincular Fotos (Em Massa)
        </label>
        <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">
          REF + URL
        </span>
      </div>

      <textarea
        value={refImageInput}
        onChange={(e) => setRefImageInput(e.target.value)}
        placeholder={`REF01 https://site.com/img1.jpg\nREF02 https://site.com/img2.jpg`}
        className={twMerge(
          "w-full h-24 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2",
          "text-xs font-bold text-black outline-none focus:border-[#5874f6] transition-colors resize-none",
          "placeholder:text-gray-400 placeholder:font-normal"
        )}
      />

      <div className="flex justify-between items-center">
        <p className="text-[9px] text-gray-400">
          Cole várias linhas: <b>REFERENCIA URL</b>
        </p>
        <button
          onClick={handleLinkImage}
          disabled={isPending}
          className="bg-black text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase active:scale-95 transition-transform disabled:opacity-50 hover:bg-gray-900"
        >
          {isPending ? 'Salvando...' : 'Salvar Fotos'}
        </button>
      </div>
    </motion.div>
  );
};
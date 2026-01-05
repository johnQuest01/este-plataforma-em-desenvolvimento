// components/builder/blocks/ClientHistoryCard.tsx
'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { CheckCircle2 } from 'lucide-react';


export const ClientHistoryCardBlock = ({ config }: { config: BlockConfig }) => {
  const name = config.data.name as string;
  const role = config.data.role as string;
  const address = config.data.address as string;
  const since = config.data.since as string;
  const contact = config.data.contact as string;
  const image = config.data.image as string;

  return (
    <div className="w-full px-4 pb-3">
      {/* Container Principal: Padding reduzido (p-2) para compensar o texto maior */}
      <div className="border border-black rounded-lg p-2 flex gap-3 relative bg-white shadow-sm items-center">
        
        {/* Avatar com Badge */}
        <div className="relative shrink-0 self-start mt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
            <img 
              src={image || 'https://placehold.co/100x100'} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
            <CheckCircle2 size={14} strokeWidth={4} />
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col w-full min-w-0 justify-center">
          
          {/* NOME: Aumentado para Extra Large (20px) e Negrito Pesado */}
          <span className="uppercase text-xl font-black text-black leading-none tracking-tight block">
            {name}
          </span> 
          
          {/* CARGO: Aumentado para Small (14px) */}
          <span className="text-gray-600 text-sm font-bold block leading-tight mt-0.5">
            {role}
          </span>
          
          {/* ENDEREÇO: Aumentado para Small (14px) */}
          <div className="text-sm font-bold text-black truncate leading-tight mt-1">
             {address}
          </div>

          {/* BADGE VERDE: Fonte aumentada e mais 'cheia' */}
          <div className="bg-[#00c853] text-white text-xs font-black px-2 py-0.5 rounded w-fit uppercase leading-none mt-1.5 shadow-sm">
            {since}
          </div>

          {/* BOX DE CONTATO: Fonte aumentada e espaçamento otimizado */}
          <div className="border border-black rounded px-2 py-0.5 mt-1.5 bg-white w-full">
            <span className="text-xs font-bold text-black truncate block">
              {contact}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
// components/builder/blocks/ClientHistoryCard.tsx
'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';

/**
 * Resultado da busca por cliente na tela Histórico (sem foto/avatar e sem botões de ação).
 */
export const ClientHistoryCardBlock = ({ config }: { config: BlockConfig }) => {
  const name = config.data.name as string;
  const role = config.data.role as string;
  const address = config.data.address as string;
  const since = config.data.since as string;
  const contact = config.data.contact as string;

  return (
    <div className="w-full pb-3">
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden">
        <div className="flex flex-col w-full min-w-0 justify-center mt-1">
          <span className="uppercase text-xl font-black text-black leading-none tracking-tight block">
            {name}
          </span>

          <span className="text-gray-600 text-sm font-bold block leading-tight mt-0.5">
            {role}
          </span>

          <div className="text-sm font-bold text-black truncate leading-tight mt-1">{address}</div>

          <div className="bg-[#00c853] text-white text-xs font-black px-2 py-0.5 rounded w-fit uppercase leading-none mt-1.5 shadow-sm">
            {since}
          </div>

          <div className="border border-black rounded px-2 py-0.5 mt-1.5 bg-white w-full">
            <span className="text-xs font-bold text-black truncate block">{contact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

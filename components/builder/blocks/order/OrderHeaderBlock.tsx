// components/builder/blocks/order/OrderHeaderBlock.tsx
'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';

export const OrderHeaderBlock = ({ config }: { config: BlockConfig }) => {
  const title = (config.data.title as string) || 'Pedido';

  return (
    <div 
      className="w-full pt-5 pb-2 px-4 text-center shrink-0 border-b border-gray-50"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <h2 
        className="font-black text-sm uppercase tracking-wider text-gray-400"
        style={{ color: config.style.textColor }}
      >
        {title}
      </h2>
    </div>
  );
};
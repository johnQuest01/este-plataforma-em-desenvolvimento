'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';

interface StockModalHeaderProps {
  blocks: BlockConfig[];
  onAction: (action: string, payload?: unknown) => void;
}

export const StockModalHeader = ({ blocks, onAction }: StockModalHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 bg-[#eeeeee]">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} config={block} onAction={onAction} />
      ))}
    </div>
  );
};
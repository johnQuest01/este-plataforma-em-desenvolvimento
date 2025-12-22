'use client';

import React from 'react';
import { BlockConfig, StockCategoryItem } from '@/types/builder';
import { cn } from '@/lib/utils';

interface StockCategoryGridProps {
  config: BlockConfig;
  // CORREÇÃO DO ANY: Usamos 'unknown' que é o tipo seguro para payloads genéricos
  onAction?: (action: string, payload?: unknown) => void;
}

const getStatusColors = (status: StockCategoryItem['status']) => {
  switch (status) {
    case 'high': return 'bg-[#28a745]';
    case 'low': return 'bg-[#dc3545]';
    case 'medium': default: return 'bg-[#ffc107]';
  }
};

export const StockCategoryGridBlock = ({ config, onAction }: StockCategoryGridProps) => {
  const categories = (config.data.categories as StockCategoryItem[]) || [];
  const columns = (config.data.gridColumns as number) || 2;
  const paddingClass = config.style.padding || 'pt-4 pb-24';

  return (
    <div
      className={cn("w-full px-4", paddingClass)}
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {categories.map((category, idx) => {
          const badgeColor = getStatusColors(category.status);

          return (
            <button
              key={idx}
              // AQUI: Dispara a ação enviando o nome da categoria
              onClick={() => onAction && onAction('openCategory', category.label)}
              className={cn(
                "relative flex items-center justify-center h-14 p-2 rounded-xl shadow-sm bg-white",
                "border border-gray-200 transition-transform active:scale-95 overflow-hidden",
                "hover:border-[#5874f6] hover:shadow-md"
              )}
            >
              <span className="text-sm font-extrabold text-gray-700 text-center leading-none tracking-tight">
                {category.label}
              </span>

              <div
                className={cn(
                  "absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-white shadow-sm",
                  badgeColor
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
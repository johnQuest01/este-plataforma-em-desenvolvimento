'use client';

import React from 'react';
import { Sun, Star, Zap, LayoutGrid, Umbrella, Flame, Heart, Play } from 'lucide-react';
import { BlockConfig, CategoryItem } from '@/types/builder';
import { cn } from '@/lib/utils';

interface CategoriesBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const CategoriesBlock = ({ config, onAction }: CategoriesBlockProps): React.JSX.Element => {
  const items = (config.data.items as CategoryItem[]) ||[];

  const renderIcon = (iconName: string) => {
    const iconProps = { size: 20, strokeWidth: 2, className: "text-gray-800" };
    switch (iconName) {
      case 'sun': return <Sun {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'fire': return <Flame {...iconProps} />;
      case 'umbrella': return <Umbrella {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      default: return <LayoutGrid {...iconProps} />;
    }
  };

  return (
    <div
      className="w-full py-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="flex px-4 gap-3 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item, idx) => {
          const hasReels = !!item.videoUrl;
          const ringColor = item.videoColor || '#f97316'; 

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 min-w-[60px] group cursor-pointer"
              onClick={() => {
                if (hasReels && onAction) {
                  onAction('openReels', item);
                }
              }}
            >
              <div 
                className={cn(
                  "rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95",
                  !hasReels && "border border-gray-200 p-0"
                )}
                style={hasReels ? { 
                  background: `linear-gradient(45deg, ${ringColor}, ${adjustColor(ringColor)})` 
                } : {}}
              >
                <div className={cn(
                  "w-[56px] h-[56px] rounded-full bg-white border-[2px] border-white overflow-hidden flex items-center justify-center shadow-sm relative",
                  !hasReels && "border-0 w-[60px] h-[60px]"
                )}>
                   <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      {renderIcon(item.icon)}
                   </div>
                   
                   {hasReels && (
                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-black text-white rounded-full border-[1.5px] border-white z-10 flex items-center justify-center shadow-sm">
                        <Play size={6} fill="white" className="ml-[1px]" />
                     </div>
                   )}
                </div>
              </div>

              <span
                className="text-[10px] font-bold text-center leading-tight max-w-[64px] truncate"
                style={{ color: config.style.textColor || '#1f2937' }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function adjustColor(color: string): string {
    return color; 
}
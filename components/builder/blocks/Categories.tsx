'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Star, Zap, LayoutGrid, Umbrella, Flame, Heart, Play } from 'lucide-react';
import { BlockConfig, CategoryItem } from '@/types/builder';
import { cn } from '@/lib/utils';
import { getAppConfigAction } from '@/app/actions/app-config-actions';
import { defaultAppConfig, AppConfigType } from '@/schemas/app-config-schema';

interface CategoriesBlockProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}

export const CategoriesBlock = ({ config, onAction }: CategoriesBlockProps): React.JSX.Element => {
  const items = (config.data.items as CategoryItem[]) || [];
  const [cfg, setCfg] = useState<AppConfigType>(defaultAppConfig);

  useEffect(() => {
    getAppConfigAction().then(setCfg);
  }, []);

  const circleSize = cfg.categoriesCircleSize;
  const iconSize   = Math.round(circleSize * 0.36);

  const renderIcon = (iconName: string) => {
    const iconProps = { size: iconSize, strokeWidth: 2, className: "text-gray-800" };
    switch (iconName) {
      case 'sun':      return <Sun {...iconProps} />;
      case 'star':     return <Star {...iconProps} />;
      case 'zap':      return <Zap {...iconProps} />;
      case 'fire':     return <Flame {...iconProps} />;
      case 'umbrella': return <Umbrella {...iconProps} />;
      case 'heart':    return <Heart {...iconProps} />;
      default:         return <LayoutGrid {...iconProps} />;
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
          const outerSize = circleSize + 4; // inclui o anel gradiente

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              style={{ minWidth: `${outerSize}px` }}
              onClick={() => {
                if (hasReels && onAction) onAction('openReels', item);
              }}
            >
              <div
                className={cn(
                  "rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95",
                  !hasReels && "border border-gray-200 p-0"
                )}
                style={{
                  width: `${outerSize}px`,
                  height: `${outerSize}px`,
                  ...(hasReels
                    ? { background: `linear-gradient(45deg, ${ringColor}, ${adjustColor(ringColor)})` }
                    : {}),
                }}
              >
                <div
                  className="rounded-full bg-white border-[2px] border-white overflow-hidden flex items-center justify-center shadow-sm relative"
                  style={{ width: `${circleSize}px`, height: `${circleSize}px` }}
                >
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

              {cfg.categoriesShowLabel && (
                <span
                  className="font-bold text-center leading-tight truncate"
                  style={{
                    color: config.style.textColor || '#1f2937',
                    fontSize: `${cfg.categoriesLabelSize}px`,
                    maxWidth: `${outerSize + 8}px`,
                  }}
                >
                  {item.label}
                </span>
              )}
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
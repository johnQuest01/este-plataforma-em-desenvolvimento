'use client';

import React from 'react';
import { Sun, Star, Zap, LayoutGrid, Umbrella, Flame, Heart, Play } from 'lucide-react'; // Adicionado Play aqui
import { BlockConfig, CategoryItem } from '@/types/builder';
import { cn } from '@/lib/utils';

// CORREÇÃO: Substituído 'any' por 'unknown'
export const CategoriesBlock = ({ config, onAction }: { config: BlockConfig, onAction?: (action: string, payload?: unknown) => void }) => {
  const items = (config.data.items as CategoryItem[]) || [];

  const renderIcon = (iconName: string) => {
    const iconProps = { size: 24, strokeWidth: 2, className: "text-gray-800" };
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
      className="w-full py-4"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="flex px-4 gap-4 overflow-x-auto scrollbar-hide touch-pan-x pb-2">
       
        {items.map((item, idx) => {
          // Se tiver videoUrl, consideramos como "Story"
          const hasReels = !!item.videoUrl;
          // Cor do anel (fallback para gradiente padrão se não tiver cor específica)
          const ringColor = item.videoColor || '#f97316'; 

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer"
              onClick={() => {
                  if (hasReels && onAction) {
                      onAction('openReels', item);
                  }
              }}
            >
              {/* Círculo com Anel */}
              <div 
                className={cn(
                    "rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95",
                    // Se não tiver vídeo, anel cinza simples ou transparente
                    !hasReels && "border border-gray-200 p-0"
                )}
                style={hasReels ? { 
                    background: `linear-gradient(45deg, ${ringColor}, ${adjustColor(ringColor, 40)})` 
                } : {}}
              >
                <div className={cn(
                    "w-[70px] h-[70px] rounded-full bg-white border-[3px] border-white overflow-hidden flex items-center justify-center shadow-sm relative",
                    !hasReels && "border-0 w-[74px] h-[74px]" // Ajuste fino de tamanho sem anel
                )}>
                   {/* Fundo Icone */}
                   <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      {renderIcon(item.icon)}
                   </div>
                   
                   {/* Indicador de "LIVE" ou Vídeo (opcional, bolinha pulsante) */}
                   {hasReels && (
                       <div className="absolute bottom-1 right-1 w-5 h-5 bg-black text-white rounded-full border-2 border-white z-10 flex items-center justify-center shadow-sm">
                          <Play size={8} fill="white" />
                       </div>
                   )}
                </div>
              </div>

              {/* Label */}
              <span
                className="text-[11px] font-bold text-center leading-tight max-w-[80px] truncate"
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

// Helper simples para clarear cor (para o gradiente)
function adjustColor(color: string, amount: number) {
    return color; // Simplificação. Em prod, usar lib de cor ou manter cor sólida.
}
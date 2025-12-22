import React from 'react';
import { BlockConfig } from '@/types/builder';

export const BannerBlock = ({ config }: { config: BlockConfig }) => {
  // Se futuramente você tiver uma URL de imagem no JSON, pode usar aqui.
  // Por enquanto, simulamos o box vazio da imagem.
  
  return (
    <div 
      className="w-full px-4 pt-4 pb-2"
      style={{ backgroundColor: 'transparent' }} 
    >
      <div 
        className="w-full aspect-[16/10] shadow-sm relative overflow-hidden flex flex-col items-center justify-center"
        style={{ 
          backgroundColor: config.style.bgColor || '#ffffff',
          // Borda sólida e escura conforme a imagem (border-gray-900)
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: '#111827', // gray-900
          borderRadius: config.style.borderRadius || '1rem' 
        }}
      >
        {/* Placeholder visual para indicar área de imagem */}
        <div className="opacity-10 pointer-events-none select-none">
             {/* Opcional: Se quiser deixar vazio como na imagem, remova este span */}
            {/* <span className="font-bold text-lg uppercase tracking-widest">Banner</span> */}
        </div>
      </div>
    </div>
  );
};
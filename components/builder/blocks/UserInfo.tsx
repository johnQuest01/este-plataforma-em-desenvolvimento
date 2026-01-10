import React from 'react';
import Image from 'next/image';
import { BlockConfig } from '@/types/builder';
import { Check } from 'lucide-react';

export const UserInfoBlock = ({ config }: { config: BlockConfig }) => {
  const userName = config.data.userName as string || 'Usuário';
  const mainTitle = config.data.mainTitle as string || 'Meu Inventário';

  const bagPinkTitle = config.data.bagPinkTitle as string || 'BAG COMPRAS';
  const bagBlueTitle = config.data.bagBlueTitle as string || 'BAG MOCHILA';

  return (
    <div
      className="w-full px-4 py-2 mt-2"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-stretch shadow-sm overflow-hidden relative min-h-[100px]">

        {/* Lado Esquerdo: Avatar e Nome */}
        <div className="flex items-center gap-3 pr-2 border-r border-gray-100 w-[45%] shrink-0">
          <div className="relative shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src="https://placehold.co/100x100/e5e7eb/a3a3a3?text=User"
                alt="User"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm z-10">
              <Check size={12} strokeWidth={3} />
            </div>
          </div>
          {/* Nome mais suave */}
          <span className="font-bold text-gray-800 text-lg leading-tight truncate">
            {userName}
          </span>
        </div>

        {/* Lado Direito: Botões de Bag */}
        <div className="flex-1 flex gap-2 pl-2 overflow-hidden items-stretch">
          
          {/* Botões com font-bold ao invés de font-black e tracking leve */}
          <button className="flex-1 bg-[#ff69b4] rounded-xl border border-black/5 shadow-sm flex items-center justify-center active:scale-95 transition-transform group relative overflow-hidden">
             <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10 pointer-events-none" />
             <span className="text-white font-bold text-[13px] uppercase text-center leading-tight drop-shadow-sm px-1 tracking-wide">
                {bagPinkTitle.replace(' ', '\n')}
             </span>
          </button>

          <button className="flex-1 bg-[#5874f6] rounded-xl border border-black/5 shadow-sm flex items-center justify-center active:scale-95 transition-transform group relative overflow-hidden">
             <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10 pointer-events-none" />
             <span className="text-white font-bold text-[13px] uppercase text-center leading-tight drop-shadow-sm px-1 tracking-wide">
                {bagBlueTitle.replace(' ', '\n')}
             </span>
          </button>

        </div>
      </div>

      {/* Título Principal */}
      <h2 className="text-center font-extrabold text-xl sm:text-2xl mt-5 mb-2 text-gray-800 uppercase tracking-tight">
        {mainTitle}
      </h2>
    </div>
  );
};
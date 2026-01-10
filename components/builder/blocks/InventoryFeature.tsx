import React, { useState } from 'react';
import Image from 'next/image';
import { BlockConfig } from '@/types/builder';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InventoryFeatureBlock = ({ config }: { config: BlockConfig }) => {
  const leftTitle = (config.data.featureTitleLeft as string) || 'Meu Inventario';
  const rightTitle = (config.data.featureTitleRight as string) || 'Status do Pedido';
  const boxLabel = (config.data.boxLabel as string) || 'Box Maryland';
  const boxTitle = (config.data.boxTitle as string) || 'Box de Maryland';
  
  // IMAGEM CADASTRADA: Vem da "Memória" do App
  const boxImage = config.data.boxImage as string | undefined;

  // ESTADO LOCAL: Controla se o box está aberto ou fechado
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenBox = () => {
    // Só abre se tiver uma imagem para mostrar
    if (boxImage) {
      setIsOpen(true);
    } else {
      // Opcional: Feedback se não tiver imagem (ex: alerta ou shake)
      console.log("Nenhuma imagem cadastrada para exibir.");
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
          100% { transform: translateY(0px) translateX(-50%); }
        }
        .animate-float {
          animation: float 1s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-white border border-gray-400 rounded-xl p-3 pb-6 shadow-sm">
        {/* Abas Superiores */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 border border-gray-400 rounded-lg py-3 flex items-center justify-center bg-white shadow-sm">
            <span className="font-extrabold text-sm text-gray-900 uppercase tracking-tight">
              {leftTitle}
            </span>
          </div>
          <div className="flex-1 bg-[#5874f6] rounded-lg py-3 flex items-center justify-center shadow-md ring-1 ring-blue-700/10">
            <span className="font-bold text-sm text-white capitalize tracking-tight">
              {rightTitle}
            </span>
          </div>
        </div>

        {/* O Box Principal */}
        <div className="flex justify-center w-full">
          <div className={cn(
            "w-[94%] border border-gray-400 rounded-xl flex flex-col items-center justify-center pt-2 pb-4 px-4 relative bg-white aspect-[4/4] shadow-[0_0_15px_rgba(0,0,0,0.02)] overflow-hidden",
            // Se estiver aberto e tiver imagem, removemos padding
            (isOpen && boxImage) && "p-0" 
          )}>
           
            {/* Label Vermelha (Sempre visível) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#ff4d6d] text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm z-20 uppercase tracking-wide">
              {boxLabel}
            </div>

            <div className="relative flex-1 flex items-center justify-center w-full h-full">
              
              {/* LÓGICA DE EXIBIÇÃO: Aberto vs Fechado */}
              {isOpen && boxImage ? (
                // --- CENÁRIO 1: ABERTO (Mostra a Foto) ---
                <div className="w-full h-full absolute inset-0 z-0 animate-in zoom-in-95 duration-300">
                  <Image 
                    src={boxImage} 
                    alt="Produto no Box" 
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 90vw, 400px"
                  />
                  <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                  
                  {/* Botão para Fechar/Resetar (Opcional, mas boa UX) */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                    className="absolute bottom-3 right-3 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-30"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                // --- CENÁRIO 2: FECHADO (Animação Padrão) ---
                <>
                  <div className="text-[#ff4d6d] drop-shadow-xl transform transition-transform duration-300 relative z-0 mt-6">
                    <PackageOpen size={130} strokeWidth={1} className="fill-[#ff4d6d]" />
                  </div>
                  <div className="absolute top-[35%] left-1/2 text-white/95 font-black text-6xl select-none drop-shadow-md z-10 animate-float pointer-events-none">
                    ?
                  </div>
                  
                  {/* Botão Abrir (Apenas visível quando fechado) */}
                  <button 
                    onClick={handleOpenBox}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#5874f6] text-white font-black text-lg px-8 py-1.5 rounded-lg border-2 border-white shadow-lg active:scale-95 transition-transform z-30 hover:bg-[#4660d6]"
                  >
                    Abrir
                  </button>
                </>
              )}
             
            </div>

            {/* Texto do rodapé (Apenas se não estiver aberto/imagem) */}
            {(!isOpen || !boxImage) && (
              <span className="text-sm font-black text-gray-900 mt-5 uppercase tracking-tight z-10 relative">
                {boxTitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
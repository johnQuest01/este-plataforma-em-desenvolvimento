// components/builder/blocks/JeansRegistrationBlock.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { BlockConfig } from '@/types/builder';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { processSmartJeansEntry } from '@/app/actions/jeans-registration';
import { RegisteredProductResult } from '@/schemas/jeans-registration-schema';

// --- COMPONENTE DE CARD DE RESULTADO ---
const ResultCard = ({ product }: { product: RegisteredProductResult }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full bg-white border border-black rounded-lg p-3 flex gap-3 items-stretch shadow-sm mb-3 shrink-0"
  >
    {/* LADO ESQUERDO: Imagem */}
    <div className="w-28 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative">
       <img 
         src={product.imageUrl || 'https://placehold.co/300x400?text=No+Image'} 
         alt={product.name}
         className="w-full h-full object-cover"
       />
    </div>

    {/* LADO DIREITO: Conteúdo */}
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <h3 className="font-bold text-black text-[14px] leading-tight mb-2 truncate">
        {product.name}
      </h3>

      {/* CAIXA DE DETALHES */}
      <div className="border border-black rounded-md p-2 flex-1 mb-2 bg-white overflow-hidden flex flex-col gap-1">
         <div className="flex flex-col gap-1">
           <span className="text-[11px] font-bold text-black leading-tight">
             Ref: {product.reference}
           </span>
           {product.variations.map((v, idx) => (
             <div key={idx} className="flex justify-between items-center border-t border-gray-100 pt-1 mt-1">
                <span className="text-[11px] font-bold text-black">Tam: {v.size}</span>
                <span className="text-[11px] font-bold text-[#00c853]">
                  Estoque: {v.qty} un.
                </span>
             </div>
           ))}
         </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
         <span className="font-black text-sm text-black">
            R$ {product.price.toFixed(2).replace('.', ',')}
         </span>
         <button className="bg-[#00c853] text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-[4px] shadow-sm">
            Ver Detalhes
         </button>
      </div>
    </div>
  </motion.div>
);

export const JeansRegistrationBlock = ({ 
  config, 
  onAction 
}: { 
  config: BlockConfig, 
  onAction?: (action: string, payload?: unknown) => void 
}) => {
  
  const title = (config.data.title as string) || 'Jeans';
  const placeholder = (config.data.placeholder as string) || 'Ex: Calça Mow, 38, 10, BF660';
  
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<RegisteredProductResult[]>([]);
  const [isPending, startTransition] = useTransition();

  // --- LÓGICA DE PARSER INTELIGENTE ---
  const handleSmartInput = () => {
    if (!inputValue.trim()) return;

    const lines = inputValue.split('\n');
    const parsedItems = [];

    for (const line of lines) {
      const parts = line.split(/,|;/).map(s => s.trim());
      
      if (parts.length >= 4) {
        const name = parts[0];
        const size = parts[1];
        const qty = parseInt(parts[2].replace(/\D/g, '')) || 0;
        const ref = parts[3];

        if (name && size && qty > 0 && ref) {
          parsedItems.push({ name, size, quantity: qty, reference: ref });
        }
      }
    }

    if (parsedItems.length > 0) {
      startTransition(async () => {
        const response = await processSmartJeansEntry({
          storeSlug: 'maryland-gestao',
          items: parsedItems,
          rawText: inputValue
        });

        if (response.success && response.results) {
          setResults(prev => [...response.results!, ...prev]);
          setInputValue(""); 
          alert(`Processado com sucesso! ${response.results.length} itens atualizados.`);
        } else {
          alert("Erro ao processar: " + response.message);
        }
      });
    } else {
      onAction?.('search_click', inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSmartInput();
    }
  };

  return (
    // Container Principal com Scroll
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      
      {/* Área Rolável */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="w-full px-6 py-6 flex flex-col items-center gap-5 min-h-[80vh]">
          
          {/* --- BANNER MARYLAND (Proporções Restauradas) --- */}
          <div className="relative w-full max-w-[340px] h-40 flex items-center justify-center mb-8 mt-6 shrink-0">
            
            {/* Camada 1: Background SVG */}
            <motion.img
              src="/background.svg"
              alt="Background Card"
              className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem] drop-shadow-xl z-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Camada 2: Logo Maryland SVG (Restaurado: w-[125%] -mt-4) */}
            <motion.img
              src="/logo-maryland.svg"
              alt="Maryland Logo"
              className="relative z-10 w-[125%] object-contain -mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            />

            {/* Camada 3: Coroa Dourada SVG (Restaurado: w-[32rem] -top-44) */}
            <motion.img
              src="/crown.svg"
              alt="Golden Crown"
              className="absolute -top-44 left-1/2 -translate-x-1/2 z-20 w-[32rem] h-[32rem] object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              initial={{ y: -50, opacity: 0, rotate: -10 }}
              animate={{
                y: [0, -10, 0], 
                rotate: [0, 5, -5, 0], 
                opacity: 1
              }}
              transition={{
                opacity: { duration: 0.4, delay: 0.4 },
                y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
            />
          </div>

          {/* Subtítulo */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black text-black uppercase tracking-wide mt-2 shrink-0"
          >
            {title}
          </motion.h2>

          {/* Campo de Busca Inteligente (Textarea) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-2 shrink-0"
          >
            <label className="text-base font-bold text-black ml-1">
              {placeholder}
            </label>
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Calça Mow, 38, 10, BF660"
              className={twMerge(
                "w-full h-24 border-[3px] border-black rounded-xl px-4 py-3",
                "text-sm font-bold text-black bg-white resize-none",
                "focus:border-[#5874f6] focus:shadow-[0_0_0_2px_#5874f6] outline-none transition-all",
                "placeholder:text-gray-400"
              )}
            />
            <span className="text-[10px] text-gray-500 font-medium ml-1">
              Dica: Digite "Nome, Tamanho, Qtd, Referência" e aperte Enter.
            </span>
          </motion.div>

          {/* Botão Buscar/Processar */}
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSmartInput}
            disabled={isPending}
            className={twMerge(
              "bg-[#5874f6] text-white font-black text-lg px-12 py-2.5 rounded-xl",
              "border-[3px] border-transparent hover:border-black",
              "shadow-md active:scale-95 transition-all w-full sm:w-auto shrink-0",
              isPending && "opacity-70 cursor-wait"
            )}
          >
            {isPending ? 'Processando...' : 'Buscar / Registrar'}
          </motion.button>

          {/* Divisor Visual */}
          <div className="w-full h-px bg-gray-200 my-2 shrink-0"></div>

          {/* Botão de Registro em Bloco (Modal) */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onAction?.('open_registration_modal')}
            className={twMerge(
              "w-full border-[3px] border-black rounded-xl p-6 mt-2 shrink-0",
              "flex flex-col items-center justify-center gap-1",
              "bg-white hover:bg-gray-50 active:scale-[0.98] transition-all",
              "cursor-pointer group shadow-sm hover:shadow-md"
            )}
          >
            <span className="text-lg font-extrabold text-black text-center leading-tight group-hover:text-[#5874f6] transition-colors">
              Registrar Referencias <br /> brutas e imagens
            </span>
            <span className="text-5xl font-black text-black mt-1 group-hover:text-[#5874f6] transition-colors">
              +
            </span>
          </motion.button>

          {/* --- ÁREA DE RESULTADOS (CARDS) --- */}
          <div className="w-full mt-6 flex flex-col gap-3 pb-10">
            <AnimatePresence>
              {results.map((product, idx) => (
                <ResultCard key={`${product.id}-${idx}`} product={product} />
              ))}
            </AnimatePresence>
            
            {results.length === 0 && !isPending && (
              <div className="text-center text-gray-400 text-sm font-medium mt-4">
                Nenhum registro recente.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
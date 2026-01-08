'use client';

import React, { useState, useTransition, useRef } from 'react';
import { BlockConfig } from '@/types/builder';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { linkReferenceImageAction, processBulkJeansAction } from '@/app/actions/jeans-registration';
import { RegisteredProductResult } from '@/schemas/jeans-registration-schema';

// Imports Modulares
import { JeansHeader } from './sistemre/JeansHeader';
import { JeansResultCard } from './sistemre/JeansResultCard';
import { JeansBulkForm } from './sistemre/JeansBulkForm';
import { JeansLinkForm } from './sistemre/JeansLinkForm';
import { JeansSessionCard } from './sistemre/JeansSessionCard';
import { DevelopmentCard } from './sistemre/DevelopmentCard';

export const JeansRegistrationBlock = ({
  config,
  onAction
}: {
  config: BlockConfig,
  onAction?: (action: string, payload?: unknown) => void
}) => {
 
  const title = (config.data.title as string) || 'Jeans';
 
  // Inputs
  const [refImageInput, setRefImageInput] = useState("");
  const [bulkTextInput, setBulkTextInput] = useState("");
 
  // Histórico e Resultados
  const [sessionRefs, setSessionRefs] = useState<{ ref: string; hasImage: boolean }[]>([]);
  const [results, setResults] = useState<RegisteredProductResult[]>([]);
  const [isPending, startTransition] = useTransition();

  // --- CONFIGURAÇÃO DO SCROLL FADE ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  // Mapeia o scroll (0 a 200px) para Opacidade (1 a 0) e Escala (1 a 0.9)
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.9]);
  const headerY = useTransform(scrollY, [0, 200], [0, -50]);
  
  // LÓGICA 1: VINCULAR REFERÊNCIA E IMAGEM
  const handleLinkImage = () => {
    if (!refImageInput.trim()) return;
    const lines = refImageInput.split('\n').filter(line => line.trim().length > 0);
   
    startTransition(async () => {
      let successCount = 0;
      const newSessionRefs: { ref: string; hasImage: boolean }[] = [];

      for (const line of lines) {
        const parts = line.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
        if (parts.length < 2) continue;
        const reference = parts[0];
        const imageUrl = parts[1];

        const res = await linkReferenceImageAction({ reference, imageUrl, storeSlug: 'maryland-gestao' });
        if (res.success && 'reference' in res) {
          successCount++;
          newSessionRefs.push({ ref: res.reference!, hasImage: res.hasImage! });
        }
      }

      if (successCount > 0) {
        setRefImageInput("");
        setSessionRefs(prev => [...newSessionRefs, ...prev]);
        alert(`${successCount} imagens vinculadas!`);
      } else {
        alert("Formato inválido. Use: REF URL");
      }
    });
  };

  // LÓGICA 2: PROCESSAR TEXTO BRUTO
  const handleBulkProcess = () => {
    if (!bulkTextInput.trim()) return;
    startTransition(async () => {
      const res = await processBulkJeansAction({ rawText: bulkTextInput, storeSlug: 'maryland-gestao' });
      if (res.success && res.results) {
        setResults(prev => [...res.results!, ...prev]);
        setBulkTextInput("");
        alert(`Sucesso! ${res.results.length} itens processados.`);
      } else {
        const errorMessage = 'error' in res ? res.error : "Erro desconhecido.";
        alert("Erro: " + errorMessage);
      }
    });
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">
     
      {/* --- HEADER ANIMADO (FADE ON SCROLL) --- */}
      <motion.div
        style={{
          opacity: headerOpacity,
          scale: headerScale,
          y: headerY,
        }}
        className="shrink-0 w-full flex flex-col items-center z-50 pt-4 origin-top pointer-events-none absolute top-0 left-0 right-0"
      >
        {/* AJUSTE: Reduzido gap-8 para gap-2 para aproximar os cards no mobile */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-2 px-4">
         
          {/* 1. Header Original (Card Rosa) */}
          <div className="flex flex-col items-center">
            <JeansHeader />
            {/* AJUSTE: Alterado de mt-2 para -mt-6 para puxar o título para cima, colando no card rosa */}
            <motion.h2 className="text-xl font-black text-black uppercase tracking-wide -mt-6 shrink-0 relative z-10">
              {title}
            </motion.h2>
          </div>

          {/* 2. Card de Desenvolvimento (Azul) */}
          <div className="hidden md:block">
             <DevelopmentCard />
          </div>
         
          {/* Versão Mobile do Card Azul (Escalado) */}
          <div className="md:hidden scale-90 -mt-2">
             <DevelopmentCard />
          </div>

        </div>
      </motion.div>

      {/* --- ÁREA DE SCROLL (CONTEÚDO) --- */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide w-full absolute inset-0 z-40 pt-[510px] md:pt-[380px]"
      >
        <div className="w-full px-6 pb-32 flex flex-col items-center gap-5 min-h-full pointer-events-auto">

          {/* 2. Card de Sessão (Histórico) */}
          <div className="w-full max-w-md md:max-w-lg relative z-30">
             <JeansSessionCard sessionRefs={sessionRefs} />
          </div>

          {/* 3. Container de Ações Principais */}
          <div className="w-full max-w-md md:max-w-lg flex flex-col gap-6 relative z-30">
            <JeansLinkForm
              refImageInput={refImageInput}
              setRefImageInput={setRefImageInput}
              handleLinkImage={handleLinkImage}
              isPending={isPending}
            />
            <JeansBulkForm
              bulkTextInput={bulkTextInput}
              setBulkTextInput={setBulkTextInput}
              handleBulkProcess={handleBulkProcess}
              isPending={isPending}
            />
          </div>

          {/* Divisor */}
          <div className="w-full max-w-md md:max-w-lg h-px bg-gray-200 my-2 shrink-0"></div>

          {/* 4. Lista de Resultados */}
          <div className="w-full mt-2 flex flex-col gap-3 max-w-md md:max-w-lg">
            {results.length > 0 && (
               <div className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-2">
                 Estoque Atualizado
               </div>
            )}
            <AnimatePresence mode="popLayout">
              {results.map((product, idx) => (
                <JeansResultCard key={`${product.id}-${idx}`} product={product} />
              ))}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};
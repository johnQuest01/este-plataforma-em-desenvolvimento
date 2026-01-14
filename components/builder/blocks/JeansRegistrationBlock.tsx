'use client';

import React, { useState, useTransition } from 'react';
import { BlockConfig } from '@/types/builder';
import { AnimatePresence } from 'framer-motion';
import { linkReferenceImageAction, processBulkJeansAction } from '@/app/actions/jeans-registration';
import { RegisteredProductResult } from '@/schemas/jeans-registration-schema';

// 🛡️ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// Imports Modulares
import { JeansHeader } from './sistemre/JeansHeader';
import { JeansResultCard } from './sistemre/JeansResultCard';
import { JeansBulkForm } from './sistemre/JeansBulkForm';
import { JeansLinkForm } from './sistemre/JeansLinkForm';
import { JeansSessionCard } from './sistemre/JeansSessionCard';
import { DevelopmentCard } from './sistemre/DevelopmentCard';
// ✅ IMPORTAÇÃO DA NAVEGAÇÃO
import { JeansNavigation } from './sistemre/JeansNavigation';

const JeansRegistrationBlockBase = ({
  config
}: {
  config: BlockConfig
}) => {
 
  const title = (config.data.title as string) || 'Jeans';
 
  // Inputs
  const [refImageInput, setRefImageInput] = useState<string>("");
  const [bulkTextInput, setBulkTextInput] = useState<string>("");
 
  // Histórico e Resultados
  const [sessionRefs, setSessionRefs] = useState<{ ref: string; hasImage: boolean }[]>([]);
  const [results, setResults] = useState<RegisteredProductResult[]>([]);
  const [isPending, startTransition] = useTransition();

 
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
        setResults(prev => {
          const newIds = new Set(res.results!.map(r => r.id));
          const filteredPrev = prev.filter(p => !newIds.has(p.id));
          return [...res.results!, ...filteredPrev];
        });
        setBulkTextInput("");
      } else {
        const errorMessage = 'error' in res ? res.error : "Erro desconhecido.";
        alert("Erro: " + errorMessage);
      }
    });
  };

  return (
    <div className="w-full flex flex-col bg-gray-50 font-sans">
      {/* --- CONTEÚDO COM SCROLL NORMAL --- */}
      <div className="w-full flex flex-col items-center pt-2 md:pt-4 pb-6">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-3 md:gap-4 px-4">
          
          {/* Cards lado a lado no desktop, empilhados no mobile */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
            {/* 1. Card Maryland (JeansHeader) */}
          <div className="flex flex-col items-center">
            <JeansHeader />
              <h2 className="text-xl font-black text-black uppercase tracking-wide -mt-6 shrink-0 relative z-10">
              {title}
              </h2>
            </div>

            {/* 2. Card Plataforma Maryland (DevelopmentCard) */}
            <div className="flex justify-center">
              <div className="hidden md:block"><DevelopmentCard /></div>
              <div className="md:hidden scale-90 mt-1"><DevelopmentCard /></div>
            </div>
          </div>
          
          {/* 3. Barra de Navegação - Abaixo dos Cards */}
          <div className="w-full max-w-3xl flex justify-center mt-2 md:mt-4">
          <JeansNavigation />
        </div>

          {/* 4. Card de Histórico de Referências - Logo abaixo da navegação */}
          {sessionRefs.length > 0 && (
            <div className="w-full max-w-md md:max-w-lg mt-4 md:mt-6 relative z-10">
             <JeansSessionCard sessionRefs={sessionRefs} />
          </div>
          )}
        </div>
      </div>

      {/* --- ÁREA DE CONTEÚDO COM SCROLL --- */}
      <div className="w-full flex flex-col items-center px-4 md:px-6 pb-32 gap-4 md:gap-6">

        <div className="w-full max-w-md md:max-w-lg flex flex-col gap-4 md:gap-6">
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

          <div className="w-full max-w-md md:max-w-lg h-px bg-gray-200 my-2 shrink-0"></div>

          <div className="w-full mt-2 flex flex-col gap-3 max-w-md md:max-w-lg">
            {results.length > 0 && (
               <div className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-2">
                 Estoque Atualizado
               </div>
            )}
            <AnimatePresence mode="popLayout">
              {results.map((product) => (
                <JeansResultCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// 🛡️ GUARDIAN: Exportação com Rastreamento
export const JeansRegistrationBlock = withGuardian(
  JeansRegistrationBlockBase,
  "components/builder/blocks/JeansRegistrationBlock.tsx",
  "UI_COMPONENT", 
  {
    label: "Registro de Jeans (Bulk)",
    description: "Interface de alta performance para cadastro em massa de produtos via texto bruto e vinculação de imagens.",
    orientationNotes: `
⚠️ **Ajustes de Layout**:
- **Scroll Normal**: Todos os componentes rolam normalmente sem elementos fixos.
- **Layout Vertical**: Cards e navegação organizados verticalmente.
- **Responsivo**: Espaçamento adequado para mobile e desktop.
    `.trim(),
    connectsTo: [
      { 
        target: "app/actions/jeans-registration.ts", 
        type: "EXTERNAL", 
        description: "Server Actions" 
      },
      {
        target: "components/builder/blocks/sistemre/JeansNavigation.tsx",
        type: "COMPONENT",
        description: "Navegação Global"
      }
    ],
    tags: ["Inventory", "Bulk Action", "Responsive Fix"]
  }
);
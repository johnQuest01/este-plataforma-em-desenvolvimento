'use client';

import React from 'react';
import { BlockRenderer } from "@/components/builder/BlockRender";
import { BlockConfig } from "@/types/builder"; // Importar o tipo para validação estrita

export default function LegoPlaygroundPage() {
  // ✅ TIPAGEM ADICIONADA: Agora o TS exige todos os campos do contrato
  const demoConfig: BlockConfig = {
    id: "btn-demo-01",
    type: "standard-button",
    isVisible: true,
    data: {
      label: "Finalizar Venda Teste",
      variant: "primary",
      size: "md",
      actionType: "SUBMIT_ORDER",
      fullWidthMobile: true
    },
    // ✅ PROPRIEDADE ADICIONADA: Resolve o erro ts(2741)
    style: {
      borderRadius: "1rem",
      padding: "1rem"
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-center mb-8 font-black uppercase tracking-widest text-xl">
          Degustação Lego
        </h1>
        
        <BlockRenderer 
          config={demoConfig} 
          onAction={(type) => alert(`Ação disparada: ${type}`)} 
        />

        <p className="mt-6 text-[10px] text-zinc-500 text-center leading-relaxed">
          O Master Guardian (canto inferior) deve estar ativo.<br/>
          Reduza a largura da janela para ver o botão se ajustar.
        </p>
      </div>
    </div>
  );
}
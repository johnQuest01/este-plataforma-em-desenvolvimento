'use client';

import React from 'react';
import { BlockRenderer } from "@/components/builder/BlockRender";

export default function LegoPlaygroundPage() {
  // Simulação de Dados vindo do JSON/Banco
  const demoConfig = {
    id: "btn-demo-01",
    type: "standard-button",
    isVisible: true,
    data: {
      label: "Finalizar Venda Teste",
      variant: "primary",
      size: "md",
      actionType: "SUBMIT_ORDER",
      fullWidthMobile: true // O pulo do gato para o mobile
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-center mb-8 font-black uppercase tracking-widest text-xl">
          Degustação Lego
        </h1>
        
        {/* Renderizador de Bloco Único */}
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
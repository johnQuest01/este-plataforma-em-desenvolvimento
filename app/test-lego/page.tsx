// path: src/app/test-lego/page.tsx
'use client';

import React from 'react';
import { BlockRenderer } from "@/components/builder/BlockRender";
import { BlockConfig } from "@/types/builder";
// ✅ Importação do HOC Guardian
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// 1. Definimos o componente base (sem export default)
function LegoPlaygroundPageBase() {
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

// 2. Exportamos o componente "embalado" com a etiqueta inteligente
export default withGuardian(
  LegoPlaygroundPageBase,
  "app/test-lego/page.tsx",
  "LAYOUT" // Tipo LAYOUT pois é uma página
);
// app/product/jeans/page.tsx
'use client';

import React from 'react';

// 🛡️ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { HeaderBlock } from '@/components/builder/blocks/Header';
import { JeansRegistrationBlock } from '@/components/builder/blocks/JeansRegistrationBlock';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';
import { BlockConfig, FooterItem } from '@/types/builder';

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
  { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
];

/**
 * Página de Cadastro de Jeans.
 * Utiliza montagem estática seguindo o contrato BlockConfig.
 */
function JeansRegistrationPageBase() {
  // Configuração estática para o Header nesta página
  // Correção: Adicionado 'isVisible' obrigatório conforme types/builder.ts
  const headerConfig: BlockConfig = {
    id: 'header-jeans',
    type: 'header',
    isVisible: true, 
    data: {
      title: 'Cadastro Jeans',
      address: 'Maryland Gestão',
      showBack: true
    },
    style: {
      bgColor: '#5874f6',
      textColor: '#ffffff'
    }
  };

  // Configuração do Bloco de Registro
  // Correção: Adicionados 'isVisible' e 'style' obrigatórios conforme types/builder.ts
  const jeansConfig: BlockConfig = {
    id: 'jeans-block-1',
    type: 'jeans-registration',
    isVisible: true, 
    data: {
      title: 'Jeans',
      placeholder: 'Pesquise por nome, ou referência'
    },
    style: {} // Objeto vazio permitido para satisfazer a tipagem BlockStyle
  };


  return (
    <main className="fixed inset-0 w-full h-full overflow-y-auto bg-gray-50 overscroll-contain">
      <div className="w-full flex flex-col min-h-full relative pb-24">
        {/* Header Principal Fixo */}
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <HeaderBlock config={headerConfig} />
        </div>
        
        {/* Conteúdo com scroll - padding-top para compensar header fixo */}
        <div className="w-full pt-[120px] pb-24">
          <JeansRegistrationBlock config={jeansConfig} />
        </div>
        
        {/* Footer Fixo */}
        <div className="fixed bottom-0 left-0 w-full z-50 pb-safe-bottom bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: '#5874f6' }} />
          </div>
        </div>
      </div>
    </main>
  );
}

// 🛡️ GUARDIAN: Exportação com metadados
export default withGuardian(
  JeansRegistrationPageBase,
  "app/product/jeans/page.tsx",
  "PAGE",
  {
    label: "Página de Cadastro de Jeans",
    description: "Tela dedicada para cadastro e gestão de produtos Jeans com sistema de referências e histórico.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Layout**: Header e Footer fixos, conteúdo scrollável
- **Z-Index**: Header (z-100), Footer (z-50)
- **Dependências**: JeansRegistrationBlock, HeaderBlock, ButtonsFooter
- **Fluxo**: Acessada via botão no footer ou navegação direta
    `.trim(),
    connectsTo: [
      {
        target: "components/builder/blocks/JeansRegistrationBlock.tsx",
        type: "COMPONENT",
        description: "Componente principal de cadastro de jeans"
      },
      {
        target: "components/builder/blocks/Header.tsx",
        type: "COMPONENT",
        description: "Header da página"
      },
      {
        target: "components/builder/ui/ButtonsFooter.tsx",
        type: "COMPONENT",
        description: "Footer de navegação"
      }
    ]
  }
);
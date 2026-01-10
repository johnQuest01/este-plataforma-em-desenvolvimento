// app/product/jeans/page.tsx
import React from 'react';
import { HeaderBlock } from '@/components/builder/blocks/Header';
import { JeansRegistrationBlock } from '@/components/builder/blocks/JeansRegistrationBlock';
import { BlockConfig } from '@/types/builder';

/**
 * Página de Cadastro de Jeans.
 * Utiliza montagem estática seguindo o contrato BlockConfig.
 */
export default function JeansRegistrationPage() {
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
    <main className="min-h-screen bg-gray-50 pb-20">
      <HeaderBlock config={headerConfig} />
      <JeansRegistrationBlock config={jeansConfig} />
    </main>
  );
}
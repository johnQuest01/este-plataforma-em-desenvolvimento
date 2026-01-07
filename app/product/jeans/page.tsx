import React from 'react';
import { HeaderBlock } from '@/components/builder/blocks/Header';
import { JeansRegistrationBlock } from '@/components/builder/blocks/JeansRegistrationBlock';
import { BlockConfig } from '@/types/builder';

export default function JeansRegistrationPage() {
  // Configuração estática para o Header nesta página
  const headerConfig: BlockConfig = {
    id: 'header-jeans',
    type: 'header',
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
  const jeansConfig: BlockConfig = {
    id: 'jeans-block-1',
    type: 'jeans-registration',
    data: {
      title: 'Jeans',
      placeholder: 'Pesquise por nome, ou referência'
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <HeaderBlock config={headerConfig} />
      <JeansRegistrationBlock config={jeansConfig} />
    </main>
  );
}
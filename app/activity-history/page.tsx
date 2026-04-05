import React from 'react';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';

export const dynamic = 'force-dynamic';

export default async function ActivityHistoryPage(): Promise<React.JSX.Element> {
  
  // 🧱 1. Configuração do Bloco Lego: HEADER GLOBAL
  const headerBlockConfiguration: BlockConfig = {
    id: 'activity-header-block',
    type: 'header',
    isVisible: true,
    data: {
      title: 'Histórico',
      address: 'Maryland Gestão',
      showBack: true // Ativa o botão de voltar no Header
    },
    style: {
      bgColor: '#5874f6',
      textColor: '#ffffff',
    }
  };

  // 🧱 2. Configuração do Bloco Lego: TELA DE HISTÓRICO
  const activityHistoryBlockConfiguration: BlockConfig = {
    id: 'activity-history-main-block',
    type: 'activity-history',
    isVisible: true,
    data: {},
    style: {
      bgColor: '#ffffff',
      textColor: '#000000'
    }
  };

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      {/* Renderiza o Header fixo no topo */}
      <BlockRenderer config={headerBlockConfiguration} />
      
      {/* Renderiza o Bloco de Histórico de Atividades */}
      <BlockRenderer config={activityHistoryBlockConfiguration} />
    </main>
  );
}
import React from 'react';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';

export const dynamic = 'force-dynamic';

export default async function AccountPage(): Promise<React.JSX.Element> {
  
  // 🧱 1. Configuração do Bloco Lego: HEADER GLOBAL
  const headerBlockConfiguration: BlockConfig = {
    id: 'account-header-block',
    type: 'header',
    isVisible: true,
    data: {
      title: 'Minha Conta',
      address: 'Maryland Gestão',
      showBack: true // Ativa o botão de voltar no Header
    },
    style: {
      bgColor: '#5874f6', // ✅ CORREÇÃO: Cor azul original do Header
      textColor: '#ffffff', // ✅ CORREÇÃO: Texto branco original
    }
  };

  // 🧱 2. Configuração do Bloco Lego: TELA DE CONTA
  const accountBlockConfiguration: BlockConfig = {
    id: 'account-screen-main-block',
    type: 'account-screen',
    isVisible: true,
    data: {},
    style: {
      bgColor: '#ffffff',
      padding: '0px',
    }
  };

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      {/* Renderiza o Header fixo no topo com as cores corretas */}
      <BlockRenderer config={headerBlockConfiguration} />
      
      {/* Renderiza o Menu da Conta perfeitamente enquadrado */}
      <BlockRenderer config={accountBlockConfiguration} />
    </main>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';

export default function AccountPage(): React.JSX.Element {
  const router = useRouter();
  
  // Estado que controla qual bloco Lego está visível na tela
  const [currentActiveView, setCurrentActiveView] = useState<'account' | 'history'>('account');

  // Função central de controle de ações (Flow Manager)
  const handleFlowAction = (action: string, payload?: unknown) => {
    // 1. Intercepta a navegação para o histórico (Alterna o bloco sem reload)
    if (action === 'NAVIGATE' && payload === '/activity-history') {
      setCurrentActiveView('history');
      return;
    }
    
    // 2. Intercepta a ação de voltar (Botão Back do Header)
    if (action === 'BACK' || action === 'GO_BACK') {
      if (currentActiveView === 'history') {
        // Se estiver no histórico, volta para o menu da conta
        setCurrentActiveView('account');
        return;
      } else {
        // Se estiver na conta, volta para a página anterior do navegador
        router.back();
        return;
      }
    }

    // 3. Navegação padrão para outras rotas (ex: /cart, /status)
    if (action === 'NAVIGATE' && typeof payload === 'string') {
      router.push(payload);
    }
  };

  // 🧱 Configuração Dinâmica do Header (Muda o título e o botão de voltar conforme a view)
  const headerBlockConfiguration: BlockConfig = {
    id: 'account-header-block',
    type: 'header',
    isVisible: true,
    data: {
      title: currentActiveView === 'account' ? 'Minha Conta' : 'Histórico',
      address: 'Maryland Gestão',
      showBack: currentActiveView === 'history', // Mostra o botão voltar apenas no histórico
    },
    style: {
      bgColor: '#5874f6', 
      textColor: '#ffffff', 
    }
  };

  // 🧱 Configuração do Bloco: TELA DE CONTA
  const accountBlockConfiguration: BlockConfig = {
    id: 'account-screen-main-block',
    type: 'account-screen',
    isVisible: currentActiveView === 'account',
    data: {},
    style: {
      bgColor: '#ffffff',
      padding: '0px',
    }
  };

  // 🧱 Configuração do Bloco: HISTÓRICO DE ATIVIDADES
  const activityHistoryBlockConfiguration: BlockConfig = {
    id: 'activity-history-main-block',
    type: 'activity-history',
    isVisible: currentActiveView === 'history',
    data: {},
    style: {
      bgColor: '#ffffff',
      textColor: '#000000'
    }
  };

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      {/* Header Global interceptando ações */}
      <BlockRenderer 
        config={headerBlockConfiguration} 
        onAction={handleFlowAction} 
      />
      
      {/* Renderização Condicional SPA (Zero-Reload) */}
      {currentActiveView === 'account' && (
        <BlockRenderer 
          config={accountBlockConfiguration} 
          onAction={handleFlowAction} 
        />
      )}

      {currentActiveView === 'history' && (
        <BlockRenderer 
          config={activityHistoryBlockConfiguration} 
          onAction={handleFlowAction} 
        />
      )}
    </main>
  );
}
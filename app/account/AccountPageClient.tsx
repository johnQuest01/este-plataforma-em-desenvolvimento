'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';

export interface AccountPageClientProps {
  /** Definido no servidor a partir de ?view=history (ex.: redirect de /activity-history). */
  initialOpenHistory?: boolean;
}

export function AccountPageClient({
  initialOpenHistory = false,
}: AccountPageClientProps): React.JSX.Element {
  const router = useRouter();

  const [currentActiveView, setCurrentActiveView] = useState<'account' | 'history'>(() =>
    initialOpenHistory ? 'history' : 'account'
  );
  /** Após o 1º acesso ao histórico, o bloco permanece montado (só alterna visibilidade — sem remount). */
  const [historyLayerMounted, setHistoryLayerMounted] = useState(() => initialOpenHistory);

  useEffect(() => {
    if (!initialOpenHistory) return;
    router.replace('/account', { scroll: false });
  }, [initialOpenHistory, router]);

  const showAccountPanel = currentActiveView === 'account';
  const showHistoryPanel = currentActiveView === 'history';

  const handleFlowAction = useCallback(
    (action: string, payload?: unknown) => {
      if (action === 'navigate_history') {
        setHistoryLayerMounted(true);
        setCurrentActiveView('history');
        return;
      }

      if (action === 'NAVIGATE' && payload === '/activity-history') {
        setHistoryLayerMounted(true);
        setCurrentActiveView('history');
        return;
      }

      if (action === 'BACK' || action === 'GO_BACK') {
        if (currentActiveView === 'history') {
          setCurrentActiveView('account');
          return;
        }
        router.back();
        return;
      }

      if (action === 'NAVIGATE' && typeof payload === 'string') {
        router.push(payload);
      }
    },
    [router, currentActiveView]
  );

  const headerBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'account-header-block',
      type: 'header',
      isVisible: true,
      data: {
        title: currentActiveView === 'account' ? 'Minha Conta' : 'Histórico',
        address: 'Maryland Gestão',
        showBack: false,
      },
      style: {
        bgColor: '#5874f6',
        textColor: '#ffffff',
      },
    }),
    [currentActiveView]
  );

  const accountBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'account-screen-main-block',
      type: 'account-screen',
      isVisible: true,
      data: {},
      style: {
        bgColor: '#ffffff',
        padding: '0px',
      },
    }),
    []
  );

  const activityHistoryBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'activity-history-main-block',
      type: 'activity-history',
      isVisible: true,
      data: {},
      style: {
        bgColor: '#ffffff',
        textColor: '#000000',
      },
    }),
    []
  );

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      <BlockRenderer config={headerBlockConfiguration} onAction={handleFlowAction} />

      <div
        className={showAccountPanel ? 'block w-full' : 'hidden'}
        aria-hidden={!showAccountPanel}
      >
        <BlockRenderer config={accountBlockConfiguration} onAction={handleFlowAction} />
      </div>

      {historyLayerMounted ? (
        <div
          className={showHistoryPanel ? 'block w-full' : 'hidden'}
          aria-hidden={!showHistoryPanel}
        >
          <BlockRenderer
            config={activityHistoryBlockConfiguration}
            onAction={handleFlowAction}
          />
        </div>
      ) : null}
    </main>
  );
}

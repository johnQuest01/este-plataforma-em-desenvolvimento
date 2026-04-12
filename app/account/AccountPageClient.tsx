'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';
import { LocalDB } from '@/lib/local-db';

export interface AccountPageClientProps {
  /** Definido no servidor a partir de ?view=history (ex.: redirect de /activity-history). */
  initialOpenHistory?: boolean;
}

type AccountView = 'account' | 'history' | 'personal-info' | 'payments' | 'catalog';

const VIEW_TITLES: Record<AccountView, string> = {
  'account': 'Minha Conta',
  'history': 'Histórico',
  'personal-info': 'Informações Pessoais',
  'payments': 'Formas de Pagamento',
  'catalog': 'Meus Favoritos',
};

export function AccountPageClient({
  initialOpenHistory = false,
}: AccountPageClientProps): React.JSX.Element {
  const router = useRouter();

  const [currentActiveView, setCurrentActiveView] = useState<AccountView>(() =>
    initialOpenHistory ? 'history' : 'account'
  );

  // Cada camada só é montada na 1ª visita (sem remount ao navegar de volta)
  const [mountedViews, setMountedViews] = useState<Set<AccountView>>(() => {
    const initial: Set<AccountView> = new Set(['account']);
    if (initialOpenHistory) initial.add('history');
    return initial;
  });

  // Dados do usuário para preencher o bloco de perfil
  const localUser = useMemo(() => LocalDB.getUser(), []);

  useEffect(() => {
    if (!initialOpenHistory) return;
    router.replace('/account', { scroll: false });
  }, [initialOpenHistory, router]);

  const navigateTo = useCallback((view: AccountView) => {
    setMountedViews((prev) => {
      if (prev.has(view)) return prev;
      const next = new Set(prev);
      next.add(view);
      return next;
    });
    setCurrentActiveView(view);
  }, []);

  const handleFlowAction = useCallback(
    (action: string, payload?: unknown) => {
      // --- Navegação para subpáginas ---
      if (action === 'navigate_personal_info' || action === 'navigate_security') {
        navigateTo('personal-info');
        return;
      }
      if (action === 'navigate_payments') {
        navigateTo('payments');
        return;
      }
      if (action === 'navigate_history') {
        navigateTo('history');
        return;
      }
      if (action === 'navigate_catalog') {
        navigateTo('catalog');
        return;
      }

      // Rota de texto vindo do ActivityHistoryBlock
      if (action === 'NAVIGATE' && payload === '/activity-history') {
        navigateTo('history');
        return;
      }

      // Voltar
      if (action === 'BACK' || action === 'GO_BACK') {
        if (currentActiveView !== 'account') {
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
    [router, currentActiveView, navigateTo]
  );

  // --- BlockConfigs ---

  const headerBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'account-header-block',
      type: 'header',
      isVisible: true,
      data: {
        title: VIEW_TITLES[currentActiveView],
        address: 'Maryland Gestão',
        showBack: currentActiveView !== 'account',
      },
      style: { bgColor: '#5874f6', textColor: '#ffffff' },
    }),
    [currentActiveView]
  );

  const accountBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'account-screen-main-block',
      type: 'account-screen',
      isVisible: true,
      data: {},
      style: { bgColor: '#ffffff', padding: '0px' },
    }),
    []
  );

  const activityHistoryBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'activity-history-main-block',
      type: 'activity-history',
      isVisible: true,
      data: {},
      style: { bgColor: '#ffffff', textColor: '#000000' },
    }),
    []
  );

  const personalInfoBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'user-profile-settings-block',
      type: 'user-profile-settings',
      isVisible: true,
      data: {
        userName: localUser?.name ?? 'Usuário',
        fullName: localUser?.name ?? '',
        emailAddress: localUser?.emailAddress ?? '',
        phoneNumber: localUser?.whatsapp ?? '',
        storeAddress: '',
        documentNumber: localUser?.document ?? '',
        profilePictureUrl: localUser?.profilePictureUrl ?? null,
        backgroundImageUrl: null,
        passwordHint: '',
      },
      style: { bgColor: '#ffffff' },
    }),
    [localUser]
  );

  const paymentsBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'payment-methods-block',
      type: 'payment-methods',
      isVisible: true,
      data: {},
      style: { bgColor: '#ffffff' },
    }),
    []
  );

  const catalogBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'catalog-showcase-block',
      type: 'catalog-showcase',
      isVisible: true,
      data: {},
      style: { bgColor: '#ffffff' },
    }),
    []
  );

  const isVisible = (view: AccountView) => currentActiveView === view;

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      <BlockRenderer config={headerBlockConfiguration} onAction={handleFlowAction} />

      {/* Menu principal */}
      <div className={isVisible('account') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('account')}>
        <BlockRenderer config={accountBlockConfiguration} onAction={handleFlowAction} />
      </div>

      {/* Informações Pessoais */}
      {mountedViews.has('personal-info') && (
        <div className={isVisible('personal-info') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('personal-info')}>
          <BlockRenderer config={personalInfoBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Formas de Pagamento */}
      {mountedViews.has('payments') && (
        <div className={isVisible('payments') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('payments')}>
          <BlockRenderer config={paymentsBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Favoritos / Catálogo */}
      {mountedViews.has('catalog') && (
        <div className={isVisible('catalog') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('catalog')}>
          <BlockRenderer config={catalogBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Histórico de Atividades */}
      {mountedViews.has('history') && (
        <div className={isVisible('history') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('history')}>
          <BlockRenderer config={activityHistoryBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}
    </main>
  );
}

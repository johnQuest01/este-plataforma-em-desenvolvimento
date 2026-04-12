'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig } from '@/types/builder';
import { LocalDB, isSellerUser } from '@/lib/local-db';

export interface AccountPageClientProps {
  /** Definido no servidor a partir de ?view=history (ex.: redirect de /activity-history). */
  initialOpenHistory?: boolean;
}

// Compradores e vendedoras compartilham algumas views; 'salary-methods' e 'seller-dashboard' são exclusivas de vendedoras.
type AccountView =
  | 'account'
  | 'history'
  | 'personal-info'
  | 'security'
  | 'payments'
  | 'salary-methods'
  | 'catalog'
  | 'seller-dashboard';

const VIEW_TITLES: Record<AccountView, string> = {
  'account': 'Minha Conta',
  'history': 'Histórico',
  'personal-info': 'Informações Pessoais',
  'security': 'Login e Senhas',
  'payments': 'Formas de Pagamento',
  'salary-methods': 'Formas de Receber',
  'catalog': 'Meus Favoritos',
  'seller-dashboard': 'Histórico de Vendas',
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

  // Dados do usuário — leitura síncrona para evitar useEffect + setState
  const localUser = useMemo(() => LocalDB.getUser(), []);
  const isSeller = isSellerUser(localUser);

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

      // Ações vindas do AccountScreenBlock (comprador) e AuthorizedSellerMenuBlock (vendedora)
      if (action === 'navigate_personal_info' || action === 'NAVIGATE_PERSONAL_INFO') {
        navigateTo('personal-info');
        return;
      }
      if (action === 'navigate_security' || action === 'NAVIGATE_SECURITY') {
        navigateTo('security');
        return;
      }
      if (action === 'navigate_payments' || action === 'NAVIGATE_PAYMENT_METHODS') {
        navigateTo('payments');
        return;
      }
      if (action === 'navigate_history' || action === 'NAVIGATE_ACTIVITY_HISTORY') {
        navigateTo('history');
        return;
      }
      if (action === 'navigate_catalog') {
        navigateTo('catalog');
        return;
      }
      // Exclusiva de vendedoras: formas de receber salário
      if (action === 'NAVIGATE_SALARY_METHODS') {
        navigateTo('salary-methods');
        return;
      }

      // Exclusiva de vendedoras: histórico de vendas / dashboard
      if (
        action === 'NAVIGATE_SELLER_DASHBOARD' ||
        (action === 'NAVIGATE' && payload === '/seller-dashboard')
      ) {
        navigateTo('seller-dashboard');
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
        address: isSeller ? 'Maryland Vendedora' : 'Maryland Gestão',
        showBack: currentActiveView !== 'account',
      },
      style: {
        bgColor: '#5874f6',
        textColor: '#ffffff',
      },
    }),
    [currentActiveView, isSeller]
  );

  // Menu principal — comprador usa AccountScreenBlock; vendedora usa AuthorizedSellerMenuBlock
  const accountBlockConfiguration: BlockConfig = useMemo(
    () =>
      isSeller
        ? {
            id: 'authorized-seller-menu-block',
            type: 'authorized-seller-menu',
            isVisible: true,
            data: {},
            style: { bgColor: '#ffffff', padding: '0px' },
          }
        : {
            id: 'account-screen-main-block',
            type: 'account-screen',
            isVisible: true,
            data: {},
            style: { bgColor: '#ffffff', padding: '0px' },
          },
    [isSeller]
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

  // Informações pessoais — vendedora usa o bloco de perfil com badge rosa
  const personalInfoBlockConfiguration: BlockConfig = useMemo(
    () =>
      isSeller
        ? {
            id: 'authorized-seller-profile-block',
            type: 'authorized-seller-profile',
            isVisible: true,
            data: {
              title: 'Maryland',
              coverImageUrl: '',
              defaultAvatarUrl: '',
            },
            style: { bgColor: '#ffffff' },
          }
        : {
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
          },
    [isSeller, localUser]
  );

  const loginSecurityBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'login-security-block',
      type: 'login-security',
      isVisible: true,
      data: {},
      style: { bgColor: '#ffffff' },
    }),
    []
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

  // Formas de receber salário (exclusivo vendedoras) — reutiliza o bloco de pagamentos
  // com título diferente no header; no futuro pode ser um bloco próprio.
  const salaryMethodsBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'salary-methods-block',
      type: 'payment-methods',
      isVisible: true,
      data: { isSalaryMode: true },
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

  // Dashboard de vendas — exclusivo vendedoras
  const sellerDashboardBlockConfiguration: BlockConfig = useMemo(
    () => ({
      id: 'seller-dashboard-block',
      type: 'seller-dashboard',
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

      {/* Menu principal (comprador = AccountScreenBlock; vendedora = AuthorizedSellerMenuBlock) */}
      <div className={isVisible('account') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('account')}>
        <BlockRenderer config={accountBlockConfiguration} onAction={handleFlowAction} />
      </div>

      {/* Informações Pessoais (comprador = UserProfileSettings; vendedora = AuthorizedSellerProfile) */}
      {mountedViews.has('personal-info') && (
        <div className={isVisible('personal-info') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('personal-info')}>
          <BlockRenderer config={personalInfoBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Login e Senhas */}
      {mountedViews.has('security') && (
        <div className={isVisible('security') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('security')}>
          <BlockRenderer config={loginSecurityBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Formas de Pagamento */}
      {mountedViews.has('payments') && (
        <div className={isVisible('payments') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('payments')}>
          <BlockRenderer config={paymentsBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}

      {/* Formas de Receber Salário (exclusivo vendedoras) */}
      {mountedViews.has('salary-methods') && (
        <div className={isVisible('salary-methods') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('salary-methods')}>
          <BlockRenderer config={salaryMethodsBlockConfiguration} onAction={handleFlowAction} />
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

      {/* Dashboard de Vendas — exclusivo vendedoras */}
      {mountedViews.has('seller-dashboard') && (
        <div className={isVisible('seller-dashboard') ? 'block w-full' : 'hidden'} aria-hidden={!isVisible('seller-dashboard')}>
          <BlockRenderer config={sellerDashboardBlockConfiguration} onAction={handleFlowAction} />
        </div>
      )}
    </main>
  );
}

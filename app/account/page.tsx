import React from 'react';
import { AccountPageClient } from './AccountPageClient';

type AccountPageProps = {
  searchParams: Promise<{ view?: string | string[] }>;
};

export default async function AccountPage({
  searchParams,
}: AccountPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const raw = params.view;
  const view = Array.isArray(raw) ? raw[0] : raw;
  const initialOpenHistory = view === 'history';

  return <AccountPageClient initialOpenHistory={initialOpenHistory} />;
}

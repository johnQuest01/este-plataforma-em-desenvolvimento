'use client';

import React from 'react';
import { DatabaseManagementPanel } from '@/components/admin/DatabaseManagementPanel';

/**
 * html/body usam overflow:hidden global — o scroll tem de existir nesta coluna.
 */
export default function AdminManagePage(): React.JSX.Element {
  return (
    <div className="flex h-dvh-real max-h-dvh flex-col overflow-hidden bg-slate-100">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-6 pb-28 sm:py-8 ios-scroll-enabled">
        <DatabaseManagementPanel />
      </div>
    </div>
  );
}

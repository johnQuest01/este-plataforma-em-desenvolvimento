'use client';

import React from 'react';
import { DatabaseManagementPanel } from '@/components/admin/DatabaseManagementPanel';

export default function AdminManagePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <DatabaseManagementPanel />
    </div>
  );
}

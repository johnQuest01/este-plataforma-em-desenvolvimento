'use client';

import React from 'react';
import { DatabaseManagementPanel } from '@/components/admin/DatabaseManagementPanel';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function AdminDatabasePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Voltar</span>
        </button>

        {/* Painel de Gerenciamento */}
        <DatabaseManagementPanel />
      </div>
    </main>
  );
}

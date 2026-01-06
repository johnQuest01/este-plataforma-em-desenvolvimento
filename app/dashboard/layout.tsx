'use client';

import React from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Fixa na Esquerda (Desktop) */}
      <Sidebar />
      
      {/* Conteúdo Principal (Ajustado para não ficar atrás da sidebar) */}
      <div className="flex-1 md:ml-64 w-full">
        {children}
      </div>
    </div>
  );
}
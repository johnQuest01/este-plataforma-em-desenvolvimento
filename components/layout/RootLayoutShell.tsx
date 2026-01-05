// path: src/components/layouts/RootLayoutShell.tsx
'use client';

import React from "react";
import { GlobalAdmin } from '@/components/admin/GlobalAdmin';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { MasterGuardianDashboard } from "@/components/builder/blocks/MasterGuardianDashboard";
import { GlobalGuardianObserver } from "@/components/builder/blocks/master/RexRuntimePixel";
import { withGuardian } from "@/components/guardian/GuardianBeacon";

interface RootLayoutShellProps {
  children: React.ReactNode;
}

function RootLayoutShellBase({ children }: RootLayoutShellProps) {
  const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

  return (
    <>
      {/* Camada de Conteúdo Principal */}
      <main className="relative z-0">
        {children}
      </main>
      
      {/* Camada de Utilidades de Admin (Production Ready) */}
      <GlobalAdmin />
      <InstallPrompt />

      {/* GUARDIAN ARCHITECTURE (DEV ONLY) */}
      {isDevelopmentEnvironment && (
        <>
          <GlobalGuardianObserver />
          <MasterGuardianDashboard />
        </>
      )}
    </>
  );
}

// ✅ Exportação com Etiqueta Inteligente
// Agora o Guardian rastreia este "Shell" como o Layout principal da UI.
export const RootLayoutShell = withGuardian(
  RootLayoutShellBase,
  "components/layouts/RootLayoutShell.tsx",
  "LAYOUT"
);
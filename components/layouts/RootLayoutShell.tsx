// path: src/components/layouts/RootLayoutShell.tsx
'use client';

import React from "react";
import { GlobalAdmin } from '@/components/admin/GlobalAdmin';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { PWAHead } from '@/components/pwa/PWAHead';
import { MasterGuardianDashboard } from "@/components/builder/blocks/MasterGuardianDashboard";
import { GlobalGuardianObserver } from "@/components/builder/blocks/master/RexRuntimePixel";
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// ✅ NOVA IMPORTAÇÃO: O Widget Flutuante Global
import { HealthMonitorBlock } from "@/components/builder/blocks/HealthMonitorBlock";

interface RootLayoutShellProps {
  children: React.ReactNode;
}

function RootLayoutShellBase({ children }: RootLayoutShellProps) {
  // Lógica para garantir que o Guardian só rode em desenvolvimento
  const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

  return (
    <>
      {/* PWA Head: Apenas em produção para evitar loops em desenvolvimento */}
      {!isDevelopmentEnvironment && <PWAHead />}
      
      {/* Camada de Conteúdo Principal (Páginas) */}
      <main className="relative z-0">
        {children}
      </main>
      
      {/* Camada de Utilidades de Admin (Production Ready) */}
      <GlobalAdmin />
      
      {/* InstallPrompt: Apenas em produção para evitar loops */}
      {!isDevelopmentEnvironment && <InstallPrompt />}

      {/* 
          ✅ INJEÇÃO DO MONITOR DE SAÚDE 
          Como ele tem position: fixed no CSS dele, ele flutuará sobre tudo.
      */}
      <HealthMonitorBlock />

      {/* GUARDIAN ARCHITECTURE (DEV ONLY) 
          Protege o bundle de produção e performance.
      */}
      {isDevelopmentEnvironment && (
        <>
          <GlobalGuardianObserver />
          <MasterGuardianDashboard />
        </>
      )}
    </>
  );
}

// ✅ Exportação com Etiqueta Inteligente e Metadados
export const RootLayoutShell = withGuardian(
  RootLayoutShellBase,
  "components/layouts/RootLayoutShell.tsx",
  "LAYOUT",
  {
    label: "Shell Principal (Root)",
    description: "Componente Wrapper global da aplicação. Responsável por injetar ferramentas administrativas, PWA e o próprio Guardian System.",
    orientationNotes: "Este é o ponto de entrada do 'Client Side'. Ele envolve todas as páginas (children). Se você remover o Guardian daqui, o painel desaparecerá de todo o app.",
    connectsTo: [
      { target: "components/admin/GlobalAdmin.tsx", type: "COMPONENT", description: "Painel Admin Global" },
      { target: "components/builder/blocks/MasterGuardianDashboard.tsx", type: "COMPONENT", description: "O Painel Guardian" },
      { target: "components/builder/blocks/HealthMonitorBlock.tsx", type: "COMPONENT", description: "Widget de Monitoramento" },
      { target: "app/layout.tsx", type: "EXTERNAL", description: "Invocador (Server Component)" }
    ],
    tags: ["Core", "Layout", "System"]
  }
);
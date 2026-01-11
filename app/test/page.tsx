// path: src/app/test/page.tsx
import { HealthMonitorBlock } from "@/components/builder/blocks/HealthMonitorBlock";

export default function TestHealthPage() {
  return (
    <main className="min-h-screen bg-black p-12 flex flex-col gap-6 relative">
      <h1 className="text-white font-bold text-2xl mb-8">System Health Preview</h1>
      <p className="text-gray-400">O monitor agora é um widget flutuante e arrastável. Veja no canto superior esquerdo.</p>
     
      {/* Renderização direta para teste */}
      <div className="relative w-full h-[400px] border border-gray-800 rounded-xl bg-gray-900 overflow-hidden">
          <HealthMonitorBlock />
          <div className="p-10 text-center text-gray-600">Conteúdo da Aplicação...</div>
      </div>
    </main>
  );
}
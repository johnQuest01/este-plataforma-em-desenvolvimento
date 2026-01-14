'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lógica e Dados
import { STOCK_BLOCKS } from '@/data/inventory-state';
import { getProductsAction, ProductData } from '@/app/actions/product';
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// Componentes de UI
import { StockRegisterView } from '@/components/builder/ui/StockRegisterView';
import { StockModalHeader } from '@/components/builder/ui/stock-modal/StockModalHeader';
import { StockProductList } from '@/components/builder/ui/stock-modal/StockProductList';

// ✅ IMPORTAÇÃO DA NAVEGAÇÃO
import { JeansNavigation } from '@/components/builder/blocks/sistemre/JeansNavigation';

const InventoryDashboardPage = () => {
  const router = useRouter();
  const [dbProducts, setDbProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- 1. Carregamento de Dados ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductsAction();
      setDbProducts(data || []);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- 2. Processamento dos Blocos (Lego Architecture) ---
  const fixedBlocks = useMemo(() => 
    STOCK_BLOCKS.filter(b => b.type === 'stock-header' || b.type === 'stock-search'), 
  []);
  
  const contentBlocks = useMemo(() => 
    STOCK_BLOCKS.filter(b => 
      b.type !== 'stock-header' && 
      b.type !== 'stock-search' && 
      b.type !== 'stock-category-grid' 
    ), 
  []);

  // --- 3. Lógica de Filtro (Client-Side) ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return dbProducts;
    return dbProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, dbProducts]);

  // --- 4. Handlers ---
  const handleAction = useCallback((action: string, payload?: unknown) => {
    if (action === 'live_search' && typeof payload === 'string') {
      setSearchQuery(payload);
    }
  }, []);

  const handleRegisterSuccess = () => {
    loadData();
  };

  // ✅ ROTEAMENTO ESTRITO: VOLTAR PARA A TELA DE JEANS (RAIZ)
  // O conceito de /dashboard foi removido. O fluxo agora é cíclico entre ferramentas.
  const handleBackToHome = () => {
    router.push('/'); 
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center py-6 px-6 font-sans">
      
      {/* --- HEADER DA PÁGINA --- */}
      <div className="w-full max-w-[1600px] flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        
        {/* Lado Esquerdo: Botão Início Pro (Volta para Jeans) */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={handleBackToHome}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 group"
          >
            <Home size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="uppercase text-xs tracking-wide">Início Pro</span>
          </button>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight hidden xl:block">
            Gestão de Estoque
          </h1>
        </div>
        
        {/* ✅ CENTRO: NAVEGAÇÃO INTEGRADA */}
        {/* Exibe apenas PDV e Produção (Estoque oculto automaticamente) */}
        <div className="flex-1 flex justify-center w-full md:w-auto -mt-4 md:mt-0">
          <div className="scale-90 md:scale-100 origin-center">
            <JeansNavigation />
          </div>
        </div>
        
        {/* Lado Direito: Status e Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total de Itens</span>
            <span className="text-lg font-black text-gray-900 leading-none">{dbProducts.length}</span>
          </div>
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 text-blue-600 transition-all active:scale-95 disabled:opacity-50"
            title="Atualizar Lista"
          >
            <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* --- DASHBOARD CARD (SPLIT VIEW) --- */}
      <div className="w-full max-w-[1600px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden grid grid-cols-12" style={{ height: '82vh' }}>
        
        {/* LADO ESQUERDO: LISTA DE ESTOQUE (60%) */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 border-r border-gray-100 flex flex-col bg-[#f8f9fa] h-full overflow-hidden">
          
          {/* Header & Search */}
          <div className="shrink-0 px-6 pt-6 pb-2 bg-white border-b border-gray-100 z-10">
            <StockModalHeader 
              blocks={fixedBlocks} 
              onAction={handleAction} 
            />
          </div>

          {/* Lista de Produtos - Área com Scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ maxHeight: '100%' }}>
            <div className="p-3 md:p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 opacity-50">
                  <RefreshCw size={32} className="animate-spin text-blue-500" />
                  <span className="text-sm font-bold text-gray-400">Carregando estoque...</span>
                </div>
              ) : (
                <StockProductList 
                  searchQuery={searchQuery}
                  contentBlocks={contentBlocks}
                  filteredProducts={filteredProducts}
                  dbProducts={dbProducts}
                  onAction={handleAction}
                />
              )}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE CADASTRO (40%) */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-white relative flex flex-col h-full shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-20">
          <div className="absolute inset-0 overflow-hidden">
            <StockRegisterView 
              onBack={handleBackToHome} 
              onRegister={handleRegisterSuccess}
              isPageMode={true} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// 🛡️ GUARDIAN: Exportação com Rastreamento
export default withGuardian(
  InventoryDashboardPage,
  "app/inventory/register/page.tsx",
  "PAGE",
  {
    label: "Dashboard de Estoque (Desktop)",
    description: "Interface unificada que combina visualização de lista (esquerda) e cadastro rápido (direita). Integra navegação global.",
    orientationNotes: `
📌 **Arquitetura de Navegação**:
- **Início Pro**: Redireciona estritamente para a raiz ('/'), que é a tela de Jeans.
- **Dashboard Geral**: Removido. O fluxo é direto entre as ferramentas de trabalho.
- **Navegação Global**: Integra 'JeansNavigation' no header.
    `.trim(),
    connectsTo: [
      { target: "components/builder/ui/StockRegisterView.tsx", type: "COMPONENT", description: "Painel Direito (Form)" },
      { target: "components/builder/ui/stock-modal/StockProductList.tsx", type: "COMPONENT", description: "Painel Esquerdo (Lista)" },
      { target: "components/builder/blocks/sistemre/JeansNavigation.tsx", type: "COMPONENT", description: "Barra de Navegação" },
      { target: "app/actions/product.ts", type: "EXTERNAL", description: "Fetch & Revalidate" }
    ],
    tags: ["Desktop", "Inventory", "Navigation", "No-Dashboard"]
  }
);
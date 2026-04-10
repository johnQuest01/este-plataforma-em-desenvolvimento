'use client';

import React, { memo, useState } from 'react';
import { ChevronLeft, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlockComponentProps } from '@/types/builder';
import { getActivityLogsAction } from '@/app/actions/activity';
import { ProductSaleCard, ProductSaleRecord } from './ProductSaleCard';

// 🧱 DADOS DE EXEMPLO (Mock) - Exatamente como na imagem solicitada
const MOCK_EXAMPLE_SALE: ProductSaleRecord = {
  id: 'mock-1',
  productName: '4 Grande de Jeans azul',
  status: 'Reprovado',
  sellerName: 'Suzana',
  paymentMethod: 'Pix',
  saleValue: 5856.00,
  productCode: '18564',
  orderNumber: '15475',
  saleDate: '24/01/2026',
  saleTime: '14:65' // Mantido exatamente como na imagem de referência
};

// 🛡️ ADAPTERS SEGUROS (Anti-Corruption Layer)
// Estas funções extraem dados de objetos desconhecidos sem usar "any" ou casts genéricos.
const getStringProperty = (backendObject: object, possibleKeys: string[], fallbackValue: string): string => {
  const objectEntries = Object.entries(backendObject);
  for (const key of possibleKeys) {
    const foundEntry = objectEntries.find(([entryKey]) => entryKey === key);
    if (foundEntry && typeof foundEntry[1] === 'string') {
      return foundEntry[1];
    }
  }
  return fallbackValue;
};

const getNumberProperty = (backendObject: object, possibleKeys: string[], fallbackValue: number): number => {
  const objectEntries = Object.entries(backendObject);
  for (const key of possibleKeys) {
    const foundEntry = objectEntries.find(([entryKey]) => entryKey === key);
    if (foundEntry && typeof foundEntry[1] === 'number') {
      return foundEntry[1];
    }
  }
  return fallbackValue;
};

function ActivityHistoryBlockInner({ config, onAction }: BlockComponentProps): React.JSX.Element {
  const { data, style } = config;
  const router = useRouter();

  const blockTitle = data.title || 'Historico de Atividades';
  const blockSubtitle = data.subtitle || 'Historico de Compras';
  const inputLabel = data.searchFormInputLabel || 'Nome do Produto, código, valor';
  const buttonLabel = data.searchFormButtonLabel || 'Buscar';
  
  const activityButtons = data.activityButtons || [
    { id: 'btn_status', label: 'Status de Pedido', actionRoute: '/status' },
    { id: 'btn_box', label: 'Meu Box Maryland', actionRoute: '/box' },
    { id: 'btn_favorites', label: 'Meus Favoritos', actionRoute: '/favorites' },
    { id: 'btn_bag', label: 'Sacola', actionRoute: '/cart' }
  ];

  const [searchQueryInformation, setSearchQueryInformation] = useState<string>('');
  const [startDateInformation, setStartDateInformation] = useState<string>('');
  const [endDateInformation, setEndDateInformation] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // 🧠 ESTADO INTELIGENTE: 
  // null = Nenhuma busca feita (Mostra Exemplo)
  // [] = Busca feita, sem resultados
  // [...] = Busca feita, com resultados reais
  const [searchResults, setSearchResults] = useState<ProductSaleRecord[] | null>(null);

  // Delega a navegação para o Flow Manager (Pai) ou usa o router como fallback
  const handleNavigation = (route: string) => {
    if (onAction) {
      onAction('NAVIGATE', route);
    } else {
      router.push(route);
    }
  };

  const handleScreenBack = () => {
    if (onAction) {
      onAction('GO_BACK');
      return;
    }
    router.back();
  };

  const handleSearchSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);

    try {
      const response = await getActivityLogsAction({
        searchQueryInformation,
        startDateInformation,
        endDateInformation,
        storeIdentifier: 'current-store-id' 
      });

      if (response.success) {
        // 🔄 ADAPTER: Converte o MappedOrderResult do backend para o ProductSaleRecord do frontend
        // de forma 100% segura, sem casts e sem erros de TypeScript.
        const mappedRealData: ProductSaleRecord[] = Array.isArray(response.data) 
          ? response.data.map((backendItem) => {
              if (typeof backendItem === 'object' && backendItem !== null) {
                return {
                  id: getStringProperty(backendItem, ['id', 'orderId'], String(Math.random())),
                  productName: getStringProperty(backendItem, ['productName', 'name', 'title'], 'Produto não especificado'),
                  status: getStringProperty(backendItem, ['status', 'state'], 'Concluído'),
                  sellerName: getStringProperty(backendItem, ['sellerName', 'seller', 'vendor'], 'Vendedora Padrão'),
                  paymentMethod: getStringProperty(backendItem, ['paymentMethod', 'payment', 'method'], 'Pix'),
                  saleValue: getNumberProperty(backendItem, ['saleValue', 'total', 'amount', 'value'], 0),
                  productCode: getStringProperty(backendItem, ['productCode', 'code', 'sku'], '00000'),
                  orderNumber: getStringProperty(backendItem, ['orderNumber', 'id', 'orderId'], '00000'),
                  saleDate: getStringProperty(backendItem, ['saleDate', 'createdAt', 'date'], new Date().toLocaleDateString('pt-BR')),
                  saleTime: getStringProperty(backendItem, ['saleTime', 'time'], '00:00')
                };
              }
              return MOCK_EXAMPLE_SALE;
            })
          : [];

        setSearchResults(mappedRealData);

        if (onAction) {
          onAction('SEARCH_COMPLETED', response.data);
        }
      } else {
        console.error(response.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro na submissão da busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      // ✅ AJUSTE: Adicionado 'scrollbar-hide' e removido '[scrollbar-gutter:stable]' para ocultar a barra visualmente
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-2 pb-28 bg-white min-h-0 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-y-contain scrollbar-hide"
      style={{
        backgroundColor: style.bgColor,
        color: style.textColor ?? '#374151',
      }}
    >
      <div className="w-full flex justify-start mb-2 shrink-0">
        <button
          type="button"
          onClick={handleScreenBack}
          className="flex items-center gap-0.5 p-1 -ml-3 rounded-full text-gray-700 transition-colors hover:bg-gray-100 active:scale-95"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-xs font-bold">Voltar</span>
        </button>
      </div>

      {/* Cabeçalho e Ícone */}
      <h1 className="mb-2 shrink-0 text-center text-xl font-bold text-gray-800">{blockTitle}</h1>
      
      <div className="flex justify-center items-center mb-4 shrink-0">
        <History className="h-10 w-10 text-gray-600" strokeWidth={2} />
      </div>

      {/* Grid de Botões de Ação */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6 shrink-0">
        {activityButtons.map((buttonItem) => (
          <button
            key={buttonItem.id}
            onClick={() => handleNavigation(buttonItem.actionRoute)}
            className="flex items-center justify-center rounded-lg border border-gray-400 px-2 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {buttonItem.label}
          </button>
        ))}
      </div>

      {/* Seção de Busca */}
      <h2 className="mb-2 shrink-0 text-center text-lg font-bold text-gray-600">{blockSubtitle}</h2>

      <form onSubmit={handleSearchSubmission} className="w-full flex flex-col items-center shrink-0">
        <div className="w-full mb-3">
          <label
            htmlFor="searchQueryInput"
            className="mb-1 block text-center text-sm font-bold text-gray-700"
          >
            {inputLabel}
          </label>
          <input
            id="searchQueryInput"
            type="text"
            value={searchQueryInformation}
            onChange={(e) => setSearchQueryInformation(e.target.value)}
            className="w-full rounded-lg border border-gray-400 px-4 py-2 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/30"
          />
        </div>

        {/* Campos de Data (Período: De / Até) */}
        <div className="flex flex-col items-center justify-center w-full mb-5">
          <span className="mb-1 text-lg font-bold text-gray-700">data</span>
          <div className="flex w-full items-center justify-center gap-2">
            <input
              id="startDateInput"
              type="date"
              value={startDateInformation}
              onChange={(e) => setStartDateInformation(e.target.value)}
              className="w-32 border-b border-gray-400 bg-transparent px-1 py-1 text-center text-sm font-semibold text-gray-800 outline-none focus:border-[#5874f6]"
            />
            <span className="text-sm font-bold text-gray-600">até</span>
            <input
              id="endDateInput"
              type="date"
              value={endDateInformation}
              onChange={(e) => setEndDateInformation(e.target.value)}
              className="w-32 border-b border-gray-400 bg-transparent px-1 py-1 text-center text-sm font-semibold text-gray-800 outline-none focus:border-[#5874f6]"
            />
          </div>
        </div>

        {/* Botão Buscar */}
        <button
          type="submit"
          disabled={isSearching}
          className="bg-[#5874f6] text-white font-bold text-lg px-8 py-1.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {isSearching ? 'Buscando...' : buttonLabel}
        </button>
      </form>

      {/* 🧱 ÁREA DE RESULTADOS (Renderização Condicional) */}
      <div className="w-full mt-8 flex flex-col gap-4">
        {searchResults === null ? (
          // 1. Estado Inicial: Mostra o Card de Exemplo
          <ProductSaleCard data={MOCK_EXAMPLE_SALE} isExample={true} />
        ) : searchResults.length === 0 ? (
          // 2. Busca Feita, mas sem resultados
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="font-bold text-gray-500">Nenhuma venda encontrada para esta busca.</p>
          </div>
        ) : (
          // 3. Busca Feita com Sucesso: Renderiza os dados reais do Backend
          searchResults.map((saleRecord) => (
            <ProductSaleCard key={saleRecord.id} data={saleRecord} />
          ))
        )}
      </div>

    </div>
  );
}

export const ActivityHistoryBlock = memo(ActivityHistoryBlockInner);
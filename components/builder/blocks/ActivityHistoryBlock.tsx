'use client';

import React, { memo, useState } from 'react';
import { ChevronLeft, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlockComponentProps } from '@/types/builder';
import { getActivityLogsAction } from '@/app/actions/activity';

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

      if (response.success && onAction) {
        onAction('SEARCH_COMPLETED', response.data);
      } else if (!response.success) {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Erro na submissão da busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-2 pb-4 bg-white min-h-[200px]"
      style={{ backgroundColor: style.bgColor, color: style.textColor || '#000000' }}
    >
      <div className="w-full flex justify-start mb-2">
        <button
          type="button"
          onClick={handleScreenBack}
          className="flex items-center gap-0.5 p-1 -ml-3 rounded-full hover:bg-gray-100 active:scale-95 transition-colors text-black"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-xs font-bold">Voltar</span>
        </button>
      </div>

      {/* Cabeçalho e Ícone */}
      <h1 className="text-xl font-bold text-center mb-2">{blockTitle}</h1>
      
      <div className="flex justify-center items-center mb-4">
        <History className="w-10 h-10 text-black" strokeWidth={2} />
      </div>

      {/* Grid de Botões de Ação */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {activityButtons.map((buttonItem) => (
          <button
            key={buttonItem.id}
            onClick={() => handleNavigation(buttonItem.actionRoute)}
            className="flex items-center justify-center text-center px-2 py-2 border-2 border-black rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            {buttonItem.label}
          </button>
        ))}
      </div>

      {/* Seção de Busca */}
      <h2 className="text-lg font-bold text-center text-gray-700 mb-2">{blockSubtitle}</h2>

      <form onSubmit={handleSearchSubmission} className="w-full flex flex-col items-center">
        <div className="w-full mb-3">
          <label htmlFor="searchQueryInput" className="block text-center font-bold text-black mb-1">
            {inputLabel}
          </label>
          <input
            id="searchQueryInput"
            type="text"
            value={searchQueryInformation}
            onChange={(e) => setSearchQueryInformation(e.target.value)}
            className="w-full border-2 border-black rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Campos de Data (Período: De / Até) */}
        <div className="flex flex-col items-center justify-center w-full mb-5">
          <span className="font-bold text-black mb-1 text-lg">data</span>
          <div className="flex items-center justify-center gap-2 w-full">
            <input
              id="startDateInput"
              type="date"
              value={startDateInformation}
              onChange={(e) => setStartDateInformation(e.target.value)}
              className="border-b-2 border-black outline-none px-1 py-1 text-center bg-transparent font-semibold text-black w-32 text-sm"
            />
            <span className="font-bold text-black text-sm">até</span>
            <input
              id="endDateInput"
              type="date"
              value={endDateInformation}
              onChange={(e) => setEndDateInformation(e.target.value)}
              className="border-b-2 border-black outline-none px-1 py-1 text-center bg-transparent font-semibold text-black w-32 text-sm"
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
    </div>
  );
}

export const ActivityHistoryBlock = memo(ActivityHistoryBlockInner);
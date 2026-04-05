'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlockComponentProps } from '@/types/builder';
import { getActivityLogsAction } from '@/app/actions/activity';

export const ActivityHistoryBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
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
  const [searchDateInformation, setSearchDateInformation] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Delega a navegação para o Flow Manager (Pai) ou usa o router como fallback
  const handleNavigation = (route: string) => {
    if (onAction) {
      onAction('NAVIGATE', route);
    } else {
      router.push(route);
    }
  };

  const handleSearchSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);

    try {
      const response = await getActivityLogsAction({
        searchQueryInformation,
        searchDateInformation,
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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-8 bg-white"
      style={{ backgroundColor: style.bgColor, color: style.textColor || '#000000' }}
    >
      {/* Cabeçalho e Ícone */}
      <h1 className="text-2xl font-bold text-center mb-6">{blockTitle}</h1>
      
      <div className="flex justify-center items-center mb-8">
        <History className="w-14 h-14 text-black" strokeWidth={2} />
      </div>

      {/* Grid de Botões de Ação */}
      <div className="grid grid-cols-2 gap-3 w-full mb-10">
        {activityButtons.map((buttonItem) => (
          <button
            key={buttonItem.id}
            onClick={() => handleNavigation(buttonItem.actionRoute)}
            className="flex items-center justify-center text-center px-2 py-3 border-2 border-black rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            {buttonItem.label}
          </button>
        ))}
      </div>

      {/* Seção de Busca */}
      <h2 className="text-xl font-bold text-center text-gray-700 mb-6">{blockSubtitle}</h2>

      <form onSubmit={handleSearchSubmission} className="w-full flex flex-col items-center">
        <div className="w-full mb-4">
          <label htmlFor="searchQueryInput" className="block text-center font-bold text-black mb-2">
            {inputLabel}
          </label>
          <input
            id="searchQueryInput"
            type="text"
            value={searchQueryInformation}
            onChange={(e) => setSearchQueryInformation(e.target.value)}
            className="w-full border-2 border-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-center w-full mb-8">
          <label htmlFor="searchDateInput" className="font-bold text-black mr-3 text-lg">
            data
          </label>
          <input
            id="searchDateInput"
            type="date"
            value={searchDateInformation}
            onChange={(e) => setSearchDateInformation(e.target.value)}
            className="border-b-2 border-black outline-none px-2 py-1 text-center bg-transparent font-semibold text-black w-40"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="bg-[#5874f6] text-white font-bold text-lg px-10 py-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {isSearching ? 'Buscando...' : buttonLabel}
        </button>
      </form>
    </motion.div>
  );
};
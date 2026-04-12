'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { getSellerDashboardDataAction } from '@/app/actions/seller-dashboard-actions';
import { SellerDashboardData } from '@/schemas/blocks/seller-dashboard-schema';
import { LocalDB } from '@/lib/local-db';

const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const SellerDashboardBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { style } = config;

  // Lê a sessão local de forma síncrona (evita useEffect + setState)
  const [localSession] = useState(() =>
    typeof window !== 'undefined' ? LocalDB.getUser() : null
  );
  
  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const response = await getSellerDashboardDataAction({
      userId: localSession?.id ?? '',
      startDate: startDateInput,
      endDate: endDateInput,
    });

    if (response.success && response.data) {
      setDashboardData(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchDashboardData();
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28 bg-white"
      style={{
        backgroundColor: style.bgColor ?? '#ffffff',
        maxHeight: 'calc(100dvh - 4rem)',
      }}
    >
      {/* Header Maryland Rosa */}
      <div className="relative w-full bg-[#F5A5C2] pt-6 pb-14 flex justify-center items-start shrink-0 border-b-2 border-black">
        <h1 
          className="text-6xl font-black text-white tracking-normal" 
          style={{ WebkitTextStroke: '2px black' }}
        >
          Maryland
        </h1>
        
        {/* Avatar sobreposto */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-[104px] h-[104px] rounded-full border-[3px] border-[#fb923c] overflow-hidden bg-gray-200 shadow-md">
              {(localSession?.profilePictureUrl || dashboardData?.profilePictureUrl) ? (
                <Image 
                  src={localSession?.profilePictureUrl ?? dashboardData?.profilePictureUrl ?? ''} 
                  alt="Foto de Perfil" 
                  width={104} 
                  height={104} 
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-300 animate-pulse" />
              )}
            </div>
            {/* Badge de verificação azul */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3b82f6] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Vendedora */}
      <div className="mt-16 flex flex-col items-center px-4">
        <h2 className="text-xl font-bold text-black">
          {localSession?.name?.split(' ')[0] || dashboardData?.sellerName || 'Carregando...'}
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-bold text-black">
            {dashboardData?.sellerRole || 'Vendedora Autorizada'} Ativa
          </span>
          {dashboardData?.isActive && (
            <div className="w-4 h-4 bg-[#50E3C2] rounded-full" />
          )}
        </div>
      </div>

      {/* Card de Resumo Principal */}
      <div className="px-4 mt-4">
        <div className="w-full border-[1.5px] border-black rounded-xl p-3 flex justify-between items-center bg-white">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold text-black">Vendas Totais</span>
            <span className="text-xl font-black text-black mt-1">
              {dashboardData ? formatCurrency(dashboardData.summary.totalSalesValue) : 'R$ 0'}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold text-black">Todos os pedidos</span>
            <span className="text-xl font-black text-black mt-1">
              {dashboardData?.summary.totalOrdersCount || 0}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold text-black">Dias</span>
            <span className="text-xl font-black text-black mt-1">
              {dashboardData?.summary.daysCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário de Filtro de Data */}
      <form onSubmit={handleSearchSubmission} className="px-4 mt-6 flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-3 w-full mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-black">data</span>
            <input 
              type="text" 
              placeholder="  /  /  " 
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-24 border-b-[1.5px] border-black bg-transparent text-center text-lg font-bold text-black outline-none focus:border-[#5874f6]"
            />
          </div>
          <span className="text-lg font-bold text-black">a</span>
          <input 
            type="text" 
            placeholder="  /  /  " 
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="w-24 border-b-[1.5px] border-black bg-transparent text-center text-lg font-bold text-black outline-none focus:border-[#5874f6]"
          />
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className="bg-[#5874f6] text-white font-bold text-lg px-8 py-1.5 rounded-2xl disabled:opacity-70"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </motion.button>
      </form>

      {/* Subtítulo do Período */}
      <div className="px-6 mt-6 text-center">
        <p className="text-[17px] font-bold text-black leading-tight">
          {dashboardData?.periodSubtitle || 'Carregando período...'}
        </p>
      </div>

      {/* Grid de Categorias (3 colunas) */}
      <div className="px-4 mt-5 grid grid-cols-3 gap-2">
        {dashboardData && Object.entries(dashboardData.categories).map(([key, category], index) => (
          <motion.div 
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border-[1.5px] border-black rounded-xl p-2 flex flex-col items-center text-center bg-white"
          >
            <span className="text-[13px] font-bold text-black leading-tight h-10 flex items-center justify-center">
              {category.label}
            </span>
            <span className="text-lg font-black text-gray-600 mt-1">
              {formatCurrency(category.totalValue)}
            </span>
            <span className="text-[11px] font-bold text-black mt-2">
              Pedidos Totais
            </span>
            <span className="text-2xl font-black text-black mt-0.5">
              {category.totalOrders}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { getSellerDashboardDataAction } from '@/app/actions/seller-dashboard-actions';
import { SellerDashboardData } from '@/schemas/blocks/seller-dashboard-schema';
import { LocalDB, inferNameGenderFromFullName } from '@/lib/local-db';

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
  const [searchQueryInput, setSearchQueryInput] = useState<string>('');
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const response = await getSellerDashboardDataAction({
      userId: localSession?.id ?? '',
      searchQuery: searchQueryInput,
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

  const sellerName  = localSession?.name?.split(' ')[0] || dashboardData?.sellerName || 'Carregando...';
  const fullName    = localSession?.name || dashboardData?.sellerName || '';
  const gender      = fullName ? inferNameGenderFromFullName(fullName) : 'feminino';
  const sellerLabel = gender === 'feminino' ? 'Vendedora Autorizada' : 'Vendedor Autorizado';
  const profileSrc  = localSession?.profilePictureUrl || dashboardData?.profilePictureUrl || '';

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28 bg-white"
      style={{
        backgroundColor: style.bgColor ?? '#ffffff',
        maxHeight: 'calc(100dvh - 4rem)',
      }}
    >
      {/* ── Capa rosa com escrita Maryland ── */}
      {/* overflow-hidden SOMENTE no wrapper interno do texto; o container externo fica aberto
          para o avatar sobreposto em -bottom-14 não ser cortado */}
      <div className="relative w-full h-36 bg-[#F5A5C2] shrink-0">
        {/* Texto Maryland centralizado — overflow-hidden só aqui */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <h1
            className="text-6xl font-black text-white tracking-normal select-none"
            style={{ WebkitTextStroke: '2px rgba(0,0,0,0.18)' }}
          >
            Maryland
          </h1>
        </div>

        {/* ── Avatar sobreposto — fora do overflow-hidden, pode ultrapassar a borda ── */}
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-10">
          <div className="relative">
            {profileSrc ? (
              <Image
                src={profileSrc}
                alt="Foto de Perfil"
                width={112}
                height={112}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                unoptimized
                sizes="112px"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 shadow-xl animate-pulse" />
            )}

            {/* Badge verificado */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <BadgeCheck className="w-6 h-6 text-[#3b82f6]" fill="#3b82f6" color="white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Badge "Vendedora Autorizada + nome" — igual ao AuthorizedSellerProfileBlock ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-16 flex flex-col items-center gap-1"
      >
        <span className="text-[10px] font-semibold text-[#d4789a] uppercase tracking-wider">
          {sellerLabel}
        </span>
        <span className="bg-[#F5A5C2]/15 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg border border-[#F5A5C2]/40 shadow-sm">
          {sellerName}
        </span>
        {/* Status ativo/ativa */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 bg-[#50E3C2] rounded-full shadow-sm" />
          <span className="text-xs font-medium text-gray-500">
            {gender === 'feminino' ? 'Ativa' : 'Ativo'}
          </span>
        </div>
      </motion.div>

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

      {/* Formulário de Filtro */}
      <form onSubmit={handleSearchSubmission} className="px-4 mt-6 flex flex-col items-center w-full gap-4">

        {/* Campo de busca por produto / código / valor */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="dashboardSearchInput" className="block text-center text-sm font-bold text-gray-700">
            Nome do Produto, código, valor
          </label>
          <input
            id="dashboardSearchInput"
            type="text"
            value={searchQueryInput}
            onChange={(e) => setSearchQueryInput(e.target.value)}
            placeholder="Ex: Jeans azul, 18564, 150,00"
            className="w-full rounded-lg border border-gray-400 px-4 py-2 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/30"
          />
        </div>

        {/* Campos de data com calendário nativo */}
        <div className="flex flex-col items-center w-full gap-2">
          <span className="text-lg font-bold text-black">data</span>
          <div className="flex items-center justify-center gap-3 w-full">
            <input
              id="dashboardStartDate"
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="flex-1 rounded-lg border border-gray-400 bg-transparent px-3 py-2 text-center text-sm font-semibold text-black outline-none focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/30"
            />
            <span className="text-lg font-bold text-black shrink-0">até</span>
            <input
              id="dashboardEndDate"
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="flex-1 rounded-lg border border-gray-400 bg-transparent px-3 py-2 text-center text-sm font-semibold text-black outline-none focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/30"
            />
          </div>
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
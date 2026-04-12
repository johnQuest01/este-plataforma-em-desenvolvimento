'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BlockComponentProps } from '@/types/builder';
import { LocalDB } from '@/lib/local-db';
import { getSellerSalesDashboardAction } from '@/app/actions/seller-sales-actions';
import { SellerSalesDashboardData } from '@/schemas/seller-sales-schema';

export const SellerSalesDashboardBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const { style } = config;

  const [dashboardData, setDashboardData] = useState<SellerSalesDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchDashboardData = useCallback(async (start?: string, end?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const currentUser = LocalDB.getUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const response = await getSellerSalesDashboardAction({
        sellerIdentifier: currentUser.id,
        startDateInformation: start,
        endDateInformation: end,
      });

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.error || 'Falha ao carregar dados de vendas.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ao buscar dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSearchSubmission = () => {
    fetchDashboardData(startDate, endDate);
  };

  const formatCurrencyValue = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28 bg-white min-h-[calc(100dvh-4rem)]"
      style={{ backgroundColor: style.bgColor ?? '#ffffff' }}
    >
      {/* Seção de Cabeçalho e Perfil (Fundo Rosa) */}
      <div className="relative bg-[#F5A5C2] pt-10 pb-16 flex flex-col items-center justify-center border-b-2 border-black">
        <h1 
          className="text-6xl font-black tracking-tighter"
          style={{ 
            WebkitTextStroke: '2px black', 
            color: 'white',
            textShadow: '2px 2px 0px #000'
          }}
        >
          Maryland
        </h1>
        
        {/* Avatar Sobreposto */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative w-24 h-24 rounded-full border-[3px] border-[#ff4d6d] overflow-hidden bg-gray-200 shadow-lg">
            <Image
              src={dashboardData?.profilePictureUrl || 'https://placehold.co/200x200/eeeeee/a3a3a3.png?text=Foto'}
              alt="Foto da Vendedora"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          {/* Badge de Verificação Azul */}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#3b82f6] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Informações da Vendedora */}
      <div className="mt-16 flex flex-col items-center px-4">
        <h2 className="text-xl font-black text-black">
          {dashboardData?.sellerName || 'Carregando...'}
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base font-bold text-black">Vendedora Autorizada Ativa</span>
          <div className="w-3.5 h-3.5 bg-[#50E3C2] rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Card de Estatísticas */}
      <div className="mx-4 mt-6 bg-white border-2 border-black rounded-xl p-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs font-bold text-black mb-1">Vendas Totais</span>
          <span className="text-xl font-black text-black">
            {isLoading ? '...' : formatCurrencyValue(dashboardData?.metrics.totalSalesValue || 0)}
          </span>
        </div>
        <div className="flex flex-col items-center flex-1 border-x-2 border-gray-200 px-2">
          <span className="text-xs font-bold text-black mb-1">Todos os pedidos</span>
          <span className="text-xl font-black text-black">
            {isLoading ? '...' : dashboardData?.metrics.totalOrdersCount || 0}
          </span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs font-bold text-black mb-1">Dias</span>
          <span className="text-xl font-black text-black">
            {isLoading ? '...' : dashboardData?.metrics.daysActive || 0}
          </span>
        </div>
      </div>

      {/* Filtro de Datas */}
      <div className="mt-8 flex flex-col items-center px-4">
        <div className="flex items-center justify-center gap-3 w-full">
          <span className="text-lg font-black text-black">data</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="border-b-2 border-black bg-transparent outline-none text-center font-bold text-black w-32 pb-1"
          />
          <span className="text-lg font-black text-black">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="border-b-2 border-black bg-transparent outline-none text-center font-bold text-black w-32 pb-1"
          />
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearchSubmission}
          disabled={isLoading}
          className="mt-6 bg-[#5874f6] text-white font-bold text-lg px-8 py-2 rounded-full shadow-md disabled:opacity-70 transition-opacity"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </motion.button>
      </div>

      {/* Mensagem de Erro (Se houver) */}
      {errorMessage && (
        <div className="mx-4 mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <span className="text-sm font-bold text-red-500">{errorMessage}</span>
        </div>
      )}

      {/* Lista de Vendas Recentes */}
      <div className="mx-4 mt-10 flex flex-col gap-4">
        <h3 className="text-lg font-black text-black">Vendas Recente</h3>
        
        {dashboardData?.recentSales.length === 0 && !isLoading && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="font-bold text-gray-500">Nenhuma venda encontrada neste período.</p>
          </div>
        )}

        {dashboardData?.recentSales.map((saleRecord, index) => (
          <motion.div
            key={saleRecord.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border-2 border-black rounded-xl p-4 flex justify-between items-center bg-white shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="text-base font-black text-black">{saleRecord.status}</span>
              <span className="text-sm font-medium text-gray-700">{saleRecord.customerName}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-lg font-black text-gray-600">
                {formatCurrencyValue(saleRecord.totalValue)}
              </span>
              <button 
                onClick={() => onAction?.('VIEW_ORDER_DETAILS', { orderId: saleRecord.id })}
                className="border-2 border-black rounded-full px-4 py-0.5 text-xs font-black text-black hover:bg-gray-50 transition-colors"
              >
                Detalhe
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
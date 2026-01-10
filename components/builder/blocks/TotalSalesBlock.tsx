'use client';

import React, { useState } from 'react';
import { BlockComponentProps, SaleRecord } from '@/types/builder';

export const TotalSalesBlock = ({ config, onAction }: BlockComponentProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extração segura de dados
  const sales = (config.data?.sales as SaleRecord[]) || [];
  const primaryColor = (config.style?.accentColor as string) || '#5874f6';
  const bgColor = (config.style?.bgColor as string) || '#ffffff';

  // Lógica de busca
  const isSearching = searchTerm.length > 0;
  const filteredSales = sales.filter(sale => 
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="w-full flex flex-col min-h-full"
      style={{ backgroundColor: bgColor }}
    >
      {/* SEÇÃO DE BUSCA */}
      <section className="px-6 py-6 flex flex-col items-center gap-6">
        <h2 className="text-lg font-black text-black uppercase tracking-wide">
          Vendas Totais
        </h2>

        <div className="w-full flex flex-col gap-2">
          <label className="text-base font-bold text-black">
            Nome do produto vendido
          </label>
          <input 
            type="text" 
            placeholder="Digite o nome do item..."
            className="w-full h-12 border-2 border-black rounded-xl px-4 text-sm font-bold focus:border-[#5874f6] outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CAMPOS DE DATA */}
        <div className="flex items-center gap-4 w-full justify-center">
          <span className="text-xl font-bold text-black">data</span>
          <div className="flex gap-2 items-center">
            <input type="text" placeholder="DD" className="w-12 text-center border-b-2 border-black font-bold outline-none placeholder:text-gray-300 focus:border-[#5874f6]" />
            <span className="font-black text-xl">/</span>
            <input type="text" placeholder="MM" className="w-12 text-center border-b-2 border-black font-bold outline-none placeholder:text-gray-300 focus:border-[#5874f6]" />
            <span className="font-black text-xl">/</span>
            <input type="text" placeholder="AAAA" className="w-16 text-center border-b-2 border-black font-bold outline-none placeholder:text-gray-300 focus:border-[#5874f6]" />
          </div>
        </div>

        <button 
          onClick={() => onAction?.('search_click', { searchTerm })}
          className="text-white font-bold text-lg px-12 py-2 rounded-xl shadow-md active:scale-95 transition-transform mt-2"
          style={{ backgroundColor: primaryColor }}
        >
          Buscar
        </button>
      </section>

      {/* --- LINHA DIVISORA (Igual à do Histórico) --- */}
      <div className="px-6 mb-8">
        <div className="w-full h-px bg-black opacity-100" />
      </div>

      {/* BOTÕES DE STATUS */}
      {!isSearching && (
        <div className="px-6 flex flex-col gap-4 mb-8">
          <button 
            onClick={() => onAction?.('filter_approved')}
            className="w-full h-14 bg-[#00c853] border-2 border-black rounded-xl text-white font-black text-xl shadow-sm active:scale-95 transition-transform uppercase"
          >
            Vendas Aprovadas
          </button>
          <button 
            onClick={() => onAction?.('filter_refund')}
            className="w-full h-14 bg-white border-2 border-[#EF4444] rounded-xl text-[#EF4444] font-black text-xl shadow-sm active:scale-95 transition-transform uppercase"
          >
            Vendas Reembolso
          </button>
          <button 
            onClick={() => onAction?.('filter_pending')}
            className="w-full h-14 bg-[#f9a825] border-2 border-black rounded-xl text-white font-black text-xl shadow-sm active:scale-95 transition-transform uppercase"
          >
            Vendas Pendentes
          </button>
        </div>
      )}

      {/* LISTA DE VENDAS */}
      <div className="px-6 pb-24 space-y-4">
        {filteredSales.map((sale) => (
          <SaleCard 
            key={sale.id} 
            sale={sale} 
            primaryColor={primaryColor} 
            onClick={() => onAction?.('sale_details', { saleId: sale.id })}
          />
        ))}
        
        {filteredSales.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-bold uppercase text-sm">
            Nenhuma venda encontrada
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: SaleCard ---
interface SaleCardProps {
  sale: SaleRecord;
  primaryColor: string;
  onClick?: () => void;
}

const SaleCard = ({ sale, primaryColor, onClick }: SaleCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="border-2 border-black rounded-2xl p-4 flex flex-col gap-2 bg-white shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-black text-black text-lg leading-tight flex-1 uppercase">
          {sale.productName}
        </h3>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-[#00c853] uppercase">Aprovado</span>
          <div className="bg-[#00c853] text-white px-3 py-1 rounded-lg text-sm font-black border border-black/10">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalValue)}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      <div className="flex flex-col gap-1">
        <p className="text-gray-500 text-xs font-bold uppercase">
          Compra realizada em:
        </p>
        <p className="text-black text-sm font-black">
          {new Date(sale.date).toLocaleDateString('pt-BR')} às {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-dashed border-gray-200">
        <span className="text-gray-400 text-[10px] font-bold uppercase">Vendedora:</span>
        <span 
          className="px-3 py-0.5 rounded-full text-white text-[10px] font-black uppercase"
          style={{ backgroundColor: primaryColor }}
        >
          {sale.sellerName || 'Equipe Maryland'}
        </span>
      </div>
    </div>
  );
};
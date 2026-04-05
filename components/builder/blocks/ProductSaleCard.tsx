'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// 📄 CONTRATO DE DADOS ESTRITO
export interface ProductSaleRecord {
  id: string;
  productName: string;
  status: string;
  sellerName: string;
  paymentMethod: string;
  saleValue: number;
  productCode: string;
  orderNumber: string;
  saleDate: string;
  saleTime: string;
}

interface ProductSaleCardProps {
  data: ProductSaleRecord;
  isExample?: boolean;
}

const ProductSaleCardBase = ({ data, isExample = false }: ProductSaleCardProps): React.JSX.Element => {
  // Formatação de Moeda (Garante que o número vire R$ X.XXX,XX)
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0 // Remove os centavos para ficar igual à imagem (R$ 5856)
  }).format(data.saleValue);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // ✅ DESIGN CLEAN: Bordas suaves (gray-200), cantos arredondados (2xl) e sombra leve
      className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden"
    >
      {/* Etiqueta de Exemplo (Apenas visual para o modo de demonstração) */}
      {isExample && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-50 text-yellow-600 border-x border-b border-yellow-100 text-[9px] font-bold px-3 py-0.5 rounded-b-md uppercase tracking-wider">
          Exemplo de Layout
        </div>
      )}

      {/* Linha 1: Nome do Produto e Status */}
      <div className="flex justify-between items-start mt-2">
        <h3 className="font-bold text-gray-700 text-sm leading-tight max-w-[65%]">
          {data.productName}
        </h3>
        <span className="font-bold text-gray-900 text-sm">
          {data.status}
        </span>
      </div>

      {/* ✅ GRID ORGANIZADO: Mantém as informações alinhadas sem ficarem "soltas" nas bordas */}
      <div className="grid grid-cols-2 gap-y-2.5 mt-1">
        
        {/* Vendedora */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-500 text-xs">Vendedora:</span>
          <span className="bg-[#5874f6] text-white px-2 py-0.5 rounded text-xs font-bold">
            {data.sellerName}
          </span>
        </div>

        {/* Pagamento e Valor */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="font-bold text-gray-900 text-xs">{data.paymentMethod}</span>
          <span className="bg-[#ff3b30] text-white px-2 py-0.5 rounded text-xs font-bold">
            {formattedValue}
          </span>
        </div>

        {/* Código */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500 text-xs">Código:</span>
          <span className="font-bold text-gray-900 text-xs">{data.productCode}</span>
        </div>

        {/* Data */}
        <div className="flex items-center justify-end gap-1">
          <span className="font-semibold text-gray-500 text-xs">Data:</span>
          <span className="font-bold text-gray-900 text-xs">{data.saleDate}</span>
        </div>

        {/* Número do Pedido */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500 text-xs">Pedido:</span>
          <span className="font-bold text-gray-900 text-xs">{data.orderNumber}</span>
        </div>

        {/* Hora */}
        <div className="flex items-center justify-end gap-1">
          <span className="font-semibold text-gray-500 text-xs">Hora:</span>
          <span className="font-bold text-gray-900 text-xs">{data.saleTime}</span>
        </div>

      </div>

      {/* Linha Final: Botões de Ação */}
      <div className="flex justify-between items-center mt-2 gap-3">
        <button className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-bold text-[11px] text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-center">
          Detalhes do Pedido e Nota Fiscal
        </button>
        <button className="border border-gray-300 rounded-lg px-6 py-2 font-bold text-[11px] text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-center">
          Foto
        </button>
      </div>
    </motion.div>
  );
};

ProductSaleCardBase.displayName = 'ProductSaleCardBase';

export const ProductSaleCard = withGuardian(
  ProductSaleCardBase,
  "components/builder/blocks/ProductSaleCard.tsx",
  "UI_COMPONENT",
  {
    label: "Card de Venda de Produto",
    description: "Exibe os detalhes de uma venda realizada, incluindo vendedora, valor, status e botões de ação com design clean.",
    tags: ["Sales", "History", "Card"]
  }
);
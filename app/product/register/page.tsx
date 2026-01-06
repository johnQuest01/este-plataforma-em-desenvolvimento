// app/product/register/page.tsx
'use client';

import React, { useState } from 'react';
import { BlockConfig } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { PackagePlus } from 'lucide-react';

// 1. CONFIGURAÇÃO DOS BLOCOS NORMAIS DA PÁGINA
const PAGE_BLOCKS: BlockConfig[] = [
  {
    id: 'header_main',
    type: 'header',
    isVisible: true,
    style: { bgColor: '#f8fafc' },
    data: { title: 'Cadastro de Produto' }
  },
];

// 2. CONFIGURAÇÃO DO POPUP
const POPUP_CONFIG_INITIAL: BlockConfig = {
  id: 'stock_popup_distribution',
  type: 'stock-distribution-popup',
  isVisible: false,
  style: {
    accentColor: '#0ea5e9',
    borderRadius: 'rounded-3xl'
  },
  data: {
    title: 'Distribuir Mercadoria',
    productName: 'Vestido Longo Seda - Tamanho M',
    totalStock: 25,
    labels: {
      confirmButton: 'Salvar Distribuição',
      cancelButton: 'Voltar',
      distributedLabel: 'Separado',
      remainingLabel: 'Estoque Livre'
    },
    saleswomen: [
      { id: 'v1', name: 'Ana Silva', avatarUrl: 'https://placehold.co/100x100/png?text=AS' },
      { id: 'v2', name: 'Beatriz Costa', avatarUrl: '' },
      { id: 'v3', name: 'Carla Dias', avatarUrl: 'https://placehold.co/100x100/png?text=CD' },
      { id: 'v4', name: 'Dani Oliveira', avatarUrl: 'https://placehold.co/100x100/png?text=DO' },
      { id: 'v5', name: 'Elena Souza', avatarUrl: 'https://placehold.co/100x100/png?text=ES' },
      { id: 'v6', name: 'Fabiana Lima', avatarUrl: '' },
    ]
  }
};

export default function ProductRegisterPage() {
  const [blocks] = useState<BlockConfig[]>(PAGE_BLOCKS);
  const [popupConfig, setPopupConfig] = useState<BlockConfig>(POPUP_CONFIG_INITIAL);

  const handleOpenStockDistribution = () => {
    setPopupConfig(prev => ({ 
      ...prev, 
      isVisible: true 
    }));
  };

  const handleClosePopup = () => {
    setPopupConfig(prev => ({ 
      ...prev, 
      isVisible: false 
    }));
  };

  const handleConfirmDistribution = (distribution: Record<string, number>) => {
    console.log("Distribuição Final Confirmada:", distribution);
    alert('Distribuição salva! Verifique o console.');
    handleClosePopup();
  };

  return (
    <main className="min-h-screen bg-slate-50 relative pb-32">
      
      <div className="space-y-4 max-w-md mx-auto bg-white min-h-screen shadow-sm">
        {blocks.map(block => (
          <BlockRenderer key={block.id} config={block} />
        ))}

        <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h2 className="font-semibold text-blue-900 mb-2">Simulação de Estoque</h2>
                <p className="text-sm text-blue-700 mb-4">
                    Este botão abaixo simula o clique em &quot;Abastecer Estoque&quot; ou &quot;Distribuir&quot;.
                </p>
                
                <button 
                    onClick={handleOpenStockDistribution}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <PackagePlus size={20} />
                    Abastecer Estoque
                </button>
            </div>
        </div>
      </div>

      {/* 
          ✅ CORREÇÃO APLICADA:
          Alterado de 'contextProps' para 'contextualProperties' 
          para corresponder à definição em BlockRender.tsx 
      */}
      <BlockRenderer 
        config={popupConfig} 
        contextualProperties={{
          onClosePopup: handleClosePopup,
          onConfirmDistribution: handleConfirmDistribution
        }}
      />

    </main>
  );
}
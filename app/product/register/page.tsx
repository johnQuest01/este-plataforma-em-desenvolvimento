// app/product/register/page.tsx
'use client';

import React, { useState } from 'react';
import { BlockConfig } from '@/types/builder';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { PackagePlus } from 'lucide-react'; // Ícone de exemplo

// 1. CONFIGURAÇÃO DOS BLOCOS NORMAIS DA PÁGINA (Simulando seu formulário)
const PAGE_BLOCKS: BlockConfig[] = [
  {
    id: 'header_main',
    type: 'header',
    isVisible: true,
    style: { bgColor: '#f8fafc' },
    data: { title: 'Cadastro de Produto' }
  },
  // ... aqui entrariam seus blocos de input, fotos, preços, etc.
];

// 2. CONFIGURAÇÃO DO POPUP (Dados Mockados das Vendedoras)
// Em produção, você carregaria 'saleswomen' de uma API.
const POPUP_CONFIG_INITIAL: BlockConfig = {
  id: 'stock_popup_distribution',
  type: 'stock-distribution-popup',
  isVisible: false, // Começa fechado
  style: {
    accentColor: '#0ea5e9', // Azul Sky (exemplo de personalização)
    borderRadius: 'rounded-3xl'
  },
  data: {
    title: 'Distribuir Mercadoria',
    productName: 'Vestido Longo Seda - Tamanho M', // Isso viria do form
    totalStock: 25, // Isso viria do input de quantidade
    labels: {
      confirmButton: 'Salvar Distribuição',
      cancelButton: 'Voltar',
      distributedLabel: 'Separado',
      remainingLabel: 'Estoque Livre'
    },
    saleswomen: [
      { id: 'v1', name: 'Ana Silva', avatarUrl: 'https://placehold.co/100x100/png?text=AS' },
      { id: 'v2', name: 'Beatriz Costa', avatarUrl: '' }, // Sem avatar (usa ícone padrão)
      { id: 'v3', name: 'Carla Dias', avatarUrl: 'https://placehold.co/100x100/png?text=CD' },
      { id: 'v4', name: 'Dani Oliveira', avatarUrl: 'https://placehold.co/100x100/png?text=DO' },
      { id: 'v5', name: 'Elena Souza', avatarUrl: 'https://placehold.co/100x100/png?text=ES' },
      { id: 'v6', name: 'Fabiana Lima', avatarUrl: '' },
    ]
  }
};

export default function ProductRegisterPage() {
  // Estado dos blocos da página
  const [blocks] = useState<BlockConfig[]>(PAGE_BLOCKS);
  
  // Estado isolado para o Popup
  const [popupConfig, setPopupConfig] = useState<BlockConfig>(POPUP_CONFIG_INITIAL);

  // Função para abrir o popup
  const handleOpenStockDistribution = () => {
    // Aqui você poderia pegar o valor atual do input de estoque e atualizar o popupConfig
    // Exemplo:
    // const currentStock = formValues.stock;
    // setPopupConfig(prev => ({ ...prev, isVisible: true, data: { ...prev.data, totalStock: currentStock } }));
    
    setPopupConfig(prev => ({ 
      ...prev, 
      isVisible: true 
    }));
  };

  // Função para fechar o popup
  const handleClosePopup = () => {
    setPopupConfig(prev => ({ 
      ...prev, 
      isVisible: false 
    }));
  };

  // Função chamada ao clicar em "Confirmar" no popup
  const handleConfirmDistribution = (distribution: Record<string, number>) => {
    console.log("Distribuição Final Confirmada:", distribution);
    
    // Exemplo de saída: { "v1": 5, "v3": 2 }
    // AQUI VOCÊ FARIA O POST PARA O BACKEND OU ATUALIZARIA O STATE DO FORMULÁRIO
    
    alert('Distribuição salva! Verifique o console.');
    handleClosePopup();
  };

  return (
    <main className="min-h-screen bg-slate-50 relative pb-32">
      
      {/* Renderiza os blocos normais da página */}
      <div className="space-y-4 max-w-md mx-auto bg-white min-h-screen shadow-sm">
        {blocks.map(block => (
          // CORREÇÃO 1: Mudei de 'block={block}' para 'config={block}'
          <BlockRenderer key={block.id} config={block} />
        ))}

        {/* --- ÁREA DE CONTEÚDO DA PÁGINA (Exemplo) --- */}
        <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h2 className="font-semibold text-blue-900 mb-2">Simulação de Estoque</h2>
                {/* CORREÇÃO 2: Usei &quot; para as aspas duplas */}
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

      {/* RENDERIZADOR DO POPUP 
        Ele fica fora do fluxo normal visualmente (fixed), mas dentro da lógica React.
        Passamos as funções de callback via contextProps.
      */}
      <BlockRenderer 
        // CORREÇÃO 3: Mudei de 'block={popupConfig}' para 'config={popupConfig}'
        config={popupConfig} 
        contextProps={{
          onClosePopup: handleClosePopup,
          onConfirmDistribution: handleConfirmDistribution
        }}
      />

    </main>
  );
}
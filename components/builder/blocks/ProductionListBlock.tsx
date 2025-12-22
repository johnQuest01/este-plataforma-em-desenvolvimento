'use client';

import React, { useState, useEffect } from 'react';
import { BlockConfig, ProductionItemData, ProductionVariationDetail, ProductionStep } from '@/types/builder';
import { ProductionCard } from '@/components/builder/ui/ProductionCard';
import { 
  getProductionItemsAction, 
  advanceProductionStepAction, 
  sendToStoreAction,
  updateProductionItemDetailsAction,
  setProductionStepAction
} from '@/app/actions/production';
import { Loader2, ClipboardList } from 'lucide-react';

export const ProductionListBlock = ({ config }: { config: BlockConfig }) => {
  const [items, setItems] = useState<ProductionItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Busca dados iniciais
  const fetchItems = async () => {
    try {
      const data = await getProductionItemsAction();
      setItems(data);
    } catch (error) {
      console.error("Erro ao buscar produção", error);
    } finally {
      setLoading(false);
    }
  };

  // Polling para atualização em tempo real
  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS DE AÇÃO ---

  const handleAdvance = async (id: string) => {
    setProcessingId(id);
    await advanceProductionStepAction(id);
    await fetchItems();
    setProcessingId(null);
  };

  const handleSetStep = async (id: string, step: ProductionStep) => {
    setProcessingId(id);
    await setProductionStepAction(id, step);
    await fetchItems();
    setProcessingId(null);
  };

  const handleSendToStore = async (id: string) => {
    if (!confirm("Enviar este lote para o Estoque da Loja?")) return;
    setProcessingId(id);
    await sendToStoreAction(id);
    await fetchItems(); // Item sumirá da lista
    setProcessingId(null);
  };

  const handleUpdateDetails = async (id: string, variations: ProductionVariationDetail[]) => {
    setProcessingId(id);
    await updateProductionItemDetailsAction(id, variations);
    await fetchItems();
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-[#5874f6]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <ClipboardList size={64} className="text-gray-400 mb-4" />
        <p className="text-gray-500 font-bold">Fila de produção vazia</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 px-4 pb-4" style={{ backgroundColor: config.style.bgColor }}>
      {items.map((item) => (
        <ProductionCard 
          key={item.id} 
          item={item}
          isProcessing={processingId === item.id}
          onAdvance={handleAdvance}
          onSend={handleSendToStore}
          onUpdateDetails={handleUpdateDetails}
          onSetStep={handleSetStep}
        />
      ))}
    </div>
  );
};
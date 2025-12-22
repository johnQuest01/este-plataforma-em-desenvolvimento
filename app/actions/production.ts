// app/actions/production.ts
'use server';

import { ProductionItemData, ProductionStep, ProductionVariationDetail } from '@/types/builder';
import { VariationItem } from '@/components/builder/ui/StockVariationsPopup';

declare global {
  var __PRODUCTION_DB: ProductionItemData[];
  var __READY_FOR_STORE_DB: ProductionItemData[];
}

const formatDate = () => {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

if (!global.__PRODUCTION_DB) {
  global.__PRODUCTION_DB = [
    {
      id: 'prod_01',
      productId: 'p1',
      productName: 'Conjunto Verão (P/M/G)',
      productImage: 'https://placehold.co/400x500/fde047/000000?text=Conjunto',
      quantity: 50,
      currentStep: 'sewing',
      stepsHistory: { sewing: false, sorting: false, tagging: false, packaging: false },
      startedAt: formatDate(),
      variationsDetail: [
        { size: 'P', color: 'Amarelo', qty: 20, type: 'Conjunto' },
        { size: 'M', color: 'Amarelo', qty: 30, type: 'Conjunto' }
      ]
    }
  ];
}

if (!global.__READY_FOR_STORE_DB) {
  global.__READY_FOR_STORE_DB = [];
}

export async function getProductionItemsAction() {
  return global.__PRODUCTION_DB;
}

export async function getReadyForStoreItemsAction() {
  return global.__READY_FOR_STORE_DB;
}

// --- AÇÕES DE ETAPA ---

export async function setProductionStepAction(itemId: string, step: ProductionStep) {
  const itemIndex = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false };

  const item = global.__PRODUCTION_DB[itemIndex];
  const allSteps: ProductionStep[] = ['sewing', 'sorting', 'tagging', 'packaging', 'ready'];

  const newHistory = { ...item.stepsHistory };
  const targetIndex = allSteps.indexOf(step);

  allSteps.forEach((s, idx) => {
    if (idx <= targetIndex && s !== 'ready') {
      const stepKey = s as keyof typeof newHistory;
      newHistory[stepKey] = true;
    }
  });

  global.__PRODUCTION_DB[itemIndex] = {
    ...item,
    currentStep: step,
    stepsHistory: newHistory
  };

  return { success: true, item: global.__PRODUCTION_DB[itemIndex] };
}

export async function advanceProductionStepAction(itemId: string) {
  const itemIndex = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false };

  const item = global.__PRODUCTION_DB[itemIndex];
  const steps: ProductionStep[] = ['sewing', 'sorting', 'tagging', 'packaging', 'ready'];
  const currentIndex = steps.indexOf(item.currentStep);

  if (currentIndex < steps.length - 1) {
    const nextStep = steps[currentIndex + 1] as ProductionStep;
    const newHistory = { ...item.stepsHistory };

    if (item.currentStep !== 'ready') {
      const stepKey = item.currentStep as keyof typeof newHistory;
      newHistory[stepKey] = true;
    }

    global.__PRODUCTION_DB[itemIndex] = {
      ...item,
      currentStep: nextStep,
      stepsHistory: newHistory
    };

    return { success: true, item: global.__PRODUCTION_DB[itemIndex] };
  }

  return { success: false, message: 'Já está pronto' };
}

export async function completeProductionAction(itemId: string) {
  const itemIndex = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false };

  const item = global.__PRODUCTION_DB[itemIndex];
  const completedHistory = { sewing: true, sorting: true, tagging: true, packaging: true };

  global.__PRODUCTION_DB[itemIndex] = {
    ...item,
    currentStep: 'ready',
    stepsHistory: completedHistory
  };

  return { success: true, item: global.__PRODUCTION_DB[itemIndex] };
}

// --- ALTERAÇÃO CRÍTICA AQUI ---
export async function sendToStoreAction(itemId: string) {
  const itemIndex = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false, message: "Item não encontrado." };

  const itemToSend = global.__PRODUCTION_DB[itemIndex];

  // 1. Verificamos se já foi enviado para evitar duplicação na lista do caixa
  const alreadySent = global.__READY_FOR_STORE_DB.find(i => i.id === itemId);

  if (!alreadySent) {
    const readyItem = {
      ...itemToSend,
      arrivedAtStore: formatDate()
    };
    // Adiciona na lista do Caixa
    global.__READY_FOR_STORE_DB.unshift(readyItem);
  }

  // 2. ATUALIZAÇÃO: NÃO removemos de __PRODUCTION_DB aqui.
  // Apenas marcamos visualmente (se necessário) ou deixamos como 'ready'.
  // O item continuará visível na tela de produção até que o caixa libere.
  
  return { success: true, message: "Aguardando liberação do caixa." };
}

// --- ALTERAÇÃO CRÍTICA AQUI: O CAIXA LIBERA E O ITEM SOME DA PRODUÇÃO ---
export async function dispatchFromStoreAction(itemId: string) {
  // 1. Remove da lista de espera do Caixa
  global.__READY_FOR_STORE_DB = global.__READY_FOR_STORE_DB.filter(i => i.id !== itemId);

  // 2. AGORA SIM: Remove da lista de Produção
  // Isso faz o item "sumir" da tela de produção, confirmando que o ciclo encerrou.
  global.__PRODUCTION_DB = global.__PRODUCTION_DB.filter(i => i.id !== itemId);

  return { success: true };
}

export async function returnToProductionAction(itemId: string, reason: string) {
  // Remove da lista do caixa
  const itemIndexStore = global.__READY_FOR_STORE_DB.findIndex(i => i.id === itemId);
  if (itemIndexStore !== -1) {
    global.__READY_FOR_STORE_DB.splice(itemIndexStore, 1);
  }

  // Atualiza na produção (que ainda deve ter o item, mas caso não tenha, recriamos ou atualizamos)
  const itemIndexProd = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  
  if (itemIndexProd !== -1) {
    // Se o item ainda está na produção, apenas voltamos o status
    const item = global.__PRODUCTION_DB[itemIndexProd];
    global.__PRODUCTION_DB[itemIndexProd] = {
      ...item,
      currentStep: 'sewing',
      returnReason: reason,
      startedAt: `DEVOLVIDO: ${formatDate()}`
    };
  } 
  
  return { success: true };
}

export async function updateProductionItemDetailsAction(itemId: string, newVariations: ProductionVariationDetail[]) {
  const itemIndex = global.__PRODUCTION_DB.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false, message: "Item não encontrado" };

  const item = global.__PRODUCTION_DB[itemIndex];
  const newTotalQuantity = newVariations.reduce((acc, v) => acc + (Number(v.qty) || 0), 0);

  global.__PRODUCTION_DB[itemIndex] = {
    ...item,
    variationsDetail: newVariations,
    quantity: newTotalQuantity
  };
  return { success: true, item: global.__PRODUCTION_DB[itemIndex] };
}

export async function createProductionOrderAction(data: {
  productName: string;
  image: string;
  variations: VariationItem[];
}) {
  try {
    const totalQty = data.variations.reduce((acc, v) => acc + v.qty, 0);

    const details: ProductionVariationDetail[] = data.variations.map(v => ({
      size: v.size,
      color: v.color,
      type: v.variation || v.type || 'Padrão',
      qty: v.qty
    }));

    const newItem: ProductionItemData = {
      id: `prod_${Date.now()}`,
      productId: `temp_${Date.now()}`,
      productName: data.productName,
      productImage: data.image || 'https://placehold.co/400x500/e2e8f0/ffffff?text=Sem+Foto',
      quantity: totalQty,
      currentStep: 'sewing',
      stepsHistory: { sewing: false, sorting: false, tagging: false, packaging: false },
      startedAt: formatDate(),
      variationsDetail: details
    };

    global.__PRODUCTION_DB.unshift(newItem);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    return { success: false };
  }
}
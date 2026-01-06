// path: src/components/builder/context/OrderContext.tsx
'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ProductData } from '@/app/actions/product';

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// 1. Definição de Tipo Local para garantir segurança ao acessar propriedades dinâmicas
// Isso substitui o uso perigoso de 'any'
interface SafeVariant {
  color?: string | null;
  size?: string | null;
  type?: string | null;
  variation?: string | null;
  name?: string | null;
  stock?: number | null;
}

interface OrderContextType {
  product: ProductData | null;
  basePrice: number;
  
  selections: Record<string, string | null>;
  setSelection: (groupType: string, value: string | null) => void;

  buyQuantity: number;
  setBuyQuantity: (q: number) => void;
  currentStock: number;
  totalValue: number;
  isValidCombination: boolean;

  resetOrder: () => void;
  checkOptionAvailability: (groupType: string, value: string) => { available: boolean; qty: number };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// 2. Componente Base do Provider
const OrderProviderBase = ({
  children,
  product
}: {
  children: React.ReactNode,
  product: ProductData | null
}) => {
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  const setSelection = (groupType: string, value: string | null) => {
    setSelections(prev => ({
      ...prev,
      [groupType]: value
    }));
    setBuyQuantity(1);
  };

  const basePrice = useMemo(() => {
    if (!product) return 0;
    const cleanPrice = product.price.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  }, [product]);

  // --- CORREÇÃO: Tipagem Estrita e Tratamento de Nulos ---
  const filterVariations = useCallback((currentSelections: Record<string, string | null>) => {
    if (!product || !product.variants) return [];

    return product.variants.filter(v => {
      // ✅ Casting seguro para a interface local definida acima
      const safeV = v as unknown as SafeVariant;

      // ✅ Tratamento seguro de strings opcionais (sem 'any' e sem erro de undefined)
      const variantAttributes: Record<string, string> = {
        'color': safeV.color?.trim() || 'Padrão',
        // Se size não existir, tenta name. Se name for undefined, usa string vazia.
        'size': safeV.size?.trim() || safeV.name?.trim() || '',
        'model': (safeV.type || safeV.variation || '').trim() 
      };

      return Object.entries(currentSelections).every(([groupKey, userSelectedValue]) => {
        if (!userSelectedValue) return true;
        const variantValue = variantAttributes[groupKey];
        
        // Se o atributo não existir na variante, ela não serve
        if (!variantValue) return false;
        
        return variantValue.toLowerCase() === userSelectedValue.toLowerCase();
      });
    });
  }, [product]);

  const currentStock = useMemo(() => {
    const matchingVars = filterVariations(selections);
    // Mapeia 'stock' (Prisma)
    return matchingVars.reduce((acc, v) => acc + (v.stock || 0), 0);
  }, [filterVariations, selections]);

  const checkOptionAvailability = useCallback((groupType: string, value: string) => {
    if (!product) return { available: false, qty: 0 };

    const testSelections = { ...selections, [groupType]: value };
    const matchingVars = filterVariations(testSelections);
    const totalQty = matchingVars.reduce((acc, v) => acc + (v.stock || 0), 0);

    return { 
      available: totalQty > 0, 
      qty: totalQty 
    };
  }, [product, selections, filterVariations]);

  const isValidCombination = currentStock > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStock > 0 && buyQuantity > currentStock) {
        setBuyQuantity(currentStock);
      }
      if (currentStock === 0 && buyQuantity !== 1) {
        setBuyQuantity(1);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentStock, buyQuantity]);

  const totalValue = buyQuantity * basePrice;

  const resetOrder = () => {
    setSelections({});
    setBuyQuantity(1);
  };

  return (
    <OrderContext.Provider value={{
      product,
      basePrice,
      selections,
      setSelection,
      buyQuantity,
      setBuyQuantity,
      currentStock,
      totalValue,
      isValidCombination,
      resetOrder,
      checkOptionAvailability
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// ✅ 3. Exportação do Provider com Rastreamento
export const OrderProvider = withGuardian(
  OrderProviderBase,
  "components/builder/context/OrderContext.tsx",
  "HOOK", // Classificado como HOOK/LOGIC pois é um Provider de Estado
  {
    label: "Contexto de Pedido (Global State)",
    description: "Gerencia o estado complexo de seleção de produtos (Cor, Tamanho, Quantidade) e cálculo de preço em tempo real.",
    orientationNotes: `
🧠 **Lógica Central**:
- **filterVariations**: Algoritmo que cruza as seleções do usuário com as variantes disponíveis no produto.
- **checkOptionAvailability**: Usado pela UI para desabilitar botões de opções esgotadas.
- **Auto-Correction**: Se o estoque mudar ou a seleção for inválida, a quantidade é ajustada automaticamente.
    `.trim(),
    connectsTo: [
      { 
        target: "components/shop/ProductDetailContent.tsx", 
        type: "COMPONENT", 
        description: "Consumidor Principal (UI)" 
      }
    ],
    tags: ["Context", "State Management", "Logic"]
  }
);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
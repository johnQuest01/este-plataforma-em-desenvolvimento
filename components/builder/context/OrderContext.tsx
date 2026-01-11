// path: src/components/builder/context/OrderContext.tsx
'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ProductData } from '@/app/actions/product.schema'; // Importando o tipo correto

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// 1. Definição de Tipo Local para garantir segurança ao acessar propriedades dinâmicas
interface SafeVariant {
  color?: string | null;
  size?: string | null;
  type?: string | null;
  variation?: string | null;
  name?: string | null;
  stock?: number | null;
}

// Interface do Item do Carrinho (Re-exportada para uso global se necessário)
export interface CartItem {
  cartId: string;
  product: ProductData;
  quantity: number;
  variationLabel: string;
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
  
  // Carrinho Global
  cart: CartItem[];
  addToCart: (product: ProductData, variationLabel: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
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
  // --- ESTADOS DE SELEÇÃO (Página de Detalhes) ---
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  // --- ESTADOS DO CARRINHO (Global) ---
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- LÓGICA DE SELEÇÃO ---
  const setSelection = (groupType: string, value: string | null) => {
    setSelections(prev => ({
      ...prev,
      [groupType]: value
    }));
    setBuyQuantity(1);
  };

  const basePrice = useMemo(() => {
    if (!product) return 0;
    // ✅ CORREÇÃO: Uso direto do number, sem parse
    return typeof product.price === 'number' ? product.price : 0;
  }, [product]);

  const filterVariations = useCallback((currentSelections: Record<string, string | null>) => {
    if (!product || !product.variants) return [];

    return product.variants.filter(v => {
      const safeV = v as unknown as SafeVariant;
      const variantAttributes: Record<string, string> = {
        'color': safeV.color?.trim() || 'Padrão',
        'size': safeV.size?.trim() || safeV.name?.trim() || '',
        'model': (safeV.type || safeV.variation || '').trim() 
      };

      return Object.entries(currentSelections).every(([groupKey, userSelectedValue]) => {
        if (!userSelectedValue) return true;
        const variantValue = variantAttributes[groupKey];
        if (!variantValue) return false;
        return variantValue.toLowerCase() === userSelectedValue.toLowerCase();
      });
    });
  }, [product]);

  const currentStock = useMemo(() => {
    const matchingVars = filterVariations(selections);
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

  // Valor total da seleção atual (não do carrinho)
  const totalValue = buyQuantity * basePrice;

  const resetOrder = () => {
    setSelections({});
    setBuyQuantity(1);
  };

  // --- LÓGICA DO CARRINHO ---
  const addToCart = (productToAdd: ProductData, variationLabel: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productToAdd.id && item.variationLabel === variationLabel);
      if (existing) {
        return prev.map(item => 
          item.cartId === existing.cartId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        cartId: Math.random().toString(36).substr(2, 9),
        product: productToAdd,
        quantity: 1,
        variationLabel
      }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

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
      checkOptionAvailability,
      // Carrinho
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// ✅ 3. Exportação do Provider com Rastreamento
export const OrderProvider = withGuardian(
  OrderProviderBase,
  "components/builder/context/OrderContext.tsx",
  "HOOK",
  {
    label: "Contexto de Pedido (Global State)",
    description: "Gerencia o estado complexo de seleção de produtos e carrinho de compras.",
    orientationNotes: `
🧠 **Lógica Central**:
- **filterVariations**: Algoritmo que cruza as seleções do usuário com as variantes disponíveis.
- **Carrinho**: Gerenciado localmente neste contexto para persistência durante a sessão.
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
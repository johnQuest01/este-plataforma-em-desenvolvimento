'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ProductData } from '@/app/actions/product';

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

export const OrderProvider = ({
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

  // --- CORREÇÃO: Uso de 'variants' e verificação de nulidade ---
  const filterVariations = useCallback((currentSelections: Record<string, string | null>) => {
    if (!product || !product.variants) return [];

    return product.variants.filter(v => {
      // Cast seguro para acessar propriedades que podem não estar no tipo estrito
      const anyV = v as any;
      const variantAttributes: Record<string, string | undefined> = {
        'color': anyV.color?.trim() || 'Padrão',
        'size': anyV.size?.trim() || v.name.trim(),
        'model': (anyV.type || anyV.variation || '').trim() 
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

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
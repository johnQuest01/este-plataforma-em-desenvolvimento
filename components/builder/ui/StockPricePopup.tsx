import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';

export type ProductVisibility = 'all' | 'registered' | 'none';

interface StockPricePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: string, visibility: ProductVisibility) => void;
  initialPrice?: string;
  initialVisibility?: ProductVisibility;
}

// 1. COMPONENTE WRAPPER
export const StockPricePopup = (props: StockPricePopupProps) => {
  return (
    <AnimatePresence>
      {props.isOpen && <StockPricePopupContent {...props} />}
    </AnimatePresence>
  );
};

// 2. COMPONENTE DE CONTEÚDO
const StockPricePopupContent = ({
  onClose,
  onConfirm,
  initialPrice = 'R$ 0,00',
  initialVisibility = 'none'
}: StockPricePopupProps) => {
  
  const [price, setPrice] = useState(() => {
    // Remove R$ e espaços, mantém a vírgula decimal
    const clean = initialPrice.replace(/[^\d,]/g, '');
    return clean === '0,00' ? '' : clean;
  });

  const [visibility, setVisibility] = useState<ProductVisibility>(initialVisibility);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Permite apenas números e uma vírgula
    value = value.replace(/[^0-9,]/g, '');
    
    // Impede múltiplas vírgulas
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita a 2 casas decimais
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    }

    setPrice(value);
  };

  const handleConfirm = () => {
    if (!price) {
      onConfirm('R$ 0,00', visibility);
      onClose();
      return;
    }

    // Converte para float para formatação segura
    // Substitui vírgula por ponto para o parseFloat
    const numericValue = parseFloat(price.replace(',', '.'));
    
    if (isNaN(numericValue)) {
      onConfirm('R$ 0,00', visibility);
    } else {
      // Formata de volta para o padrão BRL
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numericValue);
      
      onConfirm(formatted, visibility);
    }
    onClose();
  }

  const visibilityOptions: { id: ProductVisibility; label: string }[] = [
    { id: 'all', label: 'Deixar visível Para todos os visitantes' },
    { id: 'registered', label: 'Deixar visível Para Usuários que possuem cadastro no aplicativo' },
    { id: 'none', label: 'Por Enquanto não Deixar visível para ninguém' },
  ];

  return (
    <div
      className="absolute inset-0 z-[150] flex flex-col justify-end pb-[15vh]"
      key="stock-price-popup-wrapper"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "relative bg-white w-full rounded-3xl shadow-2xl border border-gray-100",
          "p-6 flex flex-col items-center gap-5 z-10"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors active:scale-90"
        >
          <X size={22} />
        </button>

        <div className="text-center mt-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
            Definir Preço
            </h3>
            <span className="text-sm font-medium text-gray-500">e Visibilidade</span>
        </div>

        <div className="w-full max-w-[240px] h-12 border border-gray-300 rounded-xl flex items-center px-4 gap-2 bg-white shadow-sm focus-within:border-[#5874f6] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200">
          <span className="font-black text-sm text-gray-400 mt-0.5">R$</span>
          
          <input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={handlePriceChange}
            placeholder="0,00"
            className="w-full h-full bg-transparent border-none outline-none font-black text-xl text-gray-900 placeholder:text-gray-300 p-0 text-right"
          />
        </div>

        <div className="flex flex-col gap-2 w-full pt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-center">
              Visibilidade do Produto
          </span>
          {visibilityOptions.map((option) => {
            const isSelected = visibility === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setVisibility(option.id)}
                className={cn(
                  "w-full py-3 px-4 rounded-xl border transition-all active:scale-[0.98] flex items-center justify-start min-h-[52px] text-left gap-3",
                  isSelected
                    ? "bg-blue-50 text-blue-900 border-blue-300 shadow-sm ring-1 ring-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-[2px] shrink-0 transition-colors flex items-center justify-center",
                  isSelected ? "bg-[#5874f6] border-transparent" : "bg-transparent border-gray-300"
                )}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-xs leading-snug font-bold uppercase tracking-tight">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="mt-2 bg-[#5874f6] w-full h-14 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check size={22} strokeWidth={3} className="text-white"/>
          <span className="text-white font-black text-sm uppercase tracking-widest">
            Confirmar
          </span>
        </button>

      </motion.div>
    </div>
  );
};
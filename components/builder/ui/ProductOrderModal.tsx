// components/builder/ui/ProductOrderModal.tsx
'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ShoppingBag, 
  ArrowRight, 
  AlertCircle, 
  Palette, 
  Component, 
  Ruler, 
  Package 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductData } from '@/app/actions/product';
import { OrderProvider, useOrder } from '@/components/builder/context/OrderContext';
import { createOrderAction } from '@/app/actions/order';

interface ProductOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
}

// --- SUB-COMPONENTE: Mini Preview Card ---
const MiniPreviewCard = ({ product }: { product: ProductData }) => {
  const { selections, currentStock, isValidCombination } = useOrder();

  const selectedColor = selections['color'];
  const selectedModel = selections['model'];
  const selectedSize = selections['size'];

  const isColorSelected = Boolean(selectedColor);
  const isModelSelected = Boolean(selectedModel);
  const isSizeSelected = Boolean(selectedSize);

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex gap-4 mb-2 animate-in fade-in zoom-in duration-300 shadow-sm">
      {/* Imagem do Produto Aumentada */}
      <div className="w-24 h-28 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 relative shadow-sm">
        <img 
          src={product.mainImage || 'https://placehold.co/100x100/png'} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        {isValidCombination && (
          <div className="absolute bottom-0 left-0 w-full bg-green-500 h-1.5" />
        )}
      </div>

      {/* Resumo de Texto - Fontes Maiores */}
      <div className="flex flex-col justify-center flex-1 gap-2">
        <h4 className="text-sm font-black text-gray-900 line-clamp-2 leading-tight">
            {product.name}
        </h4>
        
        <div className="flex flex-wrap gap-2 mt-1">
          {/* Badge Cor */}
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-md border font-bold flex items-center gap-1.5 transition-colors",
            isColorSelected 
              ? "bg-white border-gray-300 text-gray-900" 
              : "bg-gray-100 border-dashed border-gray-300 text-gray-400"
          )}>
            <Palette size={10} />
            {selectedColor || "Cor?"}
          </span>

          {/* Badge Tipo */}
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-md border font-bold flex items-center gap-1.5 transition-colors",
            isModelSelected 
              ? "bg-white border-gray-300 text-gray-900" 
              : "bg-gray-100 border-dashed border-gray-300 text-gray-400"
          )}>
            <Component size={10} />
            {selectedModel || "Tipo?"}
          </span>

          {/* Badge Tamanho */}
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-md border font-bold flex items-center gap-1.5 transition-colors",
            isSizeSelected 
              ? "bg-gray-900 border-gray-900 text-white" 
              : "bg-gray-100 border-dashed border-gray-300 text-gray-400"
          )}>
            <Ruler size={10} />
            {selectedSize || "Tam.?"}
          </span>
        </div>

        {/* Feedback de Estoque no Preview */}
        {isColorSelected && isModelSelected && isSizeSelected && (
            <div className="flex items-center gap-1.5 mt-1">
                <div className={cn("w-2 h-2 rounded-full", isValidCombination ? "bg-green-500" : "bg-red-500")} />
                <span className="text-xs text-gray-600 font-bold">
                    {isValidCombination ? `Disponível (${currentStock})` : "Indisponível"}
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DO CONTEÚDO DO MODAL ---
const OrderModalContent = ({
  onClose
}: {
  onClose: () => void
}) => {
  const { 
    buyQuantity, 
    totalValue, 
    isValidCombination, 
    product, 
    selections, 
    setSelection,
    checkOptionAvailability
  } = useOrder();

  const options = useMemo(() => {
    // Validação inicial para evitar erros no hook
    if (!product) return { colors: [], types: [], sizes: [] };

    const colors = new Set<string>();
    const types = new Set<string>();
    const sizes = new Set<string>();

    product.variations.forEach(variation => {
      if (variation.color) colors.add(variation.color.trim());
      const typeVal = variation.variation || variation.type;
      if (typeVal) types.add(typeVal.trim());
      if (variation.size) sizes.add(variation.size.trim());
    });

    const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '44', '46', '48'];
    const sortedSizes = Array.from(sizes).sort((a, b) => {
        const indexA = sizeOrder.indexOf(a.toUpperCase());
        const indexB = sizeOrder.indexOf(b.toUpperCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return {
      colors: Array.from(colors),
      types: Array.from(types),
      sizes: sortedSizes
    };
  }, [product]);

  // --- LÓGICA DE CORREÇÃO: Calcular Tipos Relevantes ---
  const relevantTypes = useMemo(() => {
    // Se não há produto ou não há tipos globais, retorna vazio
    if (!product || options.types.length === 0) return [];

    // Se nenhuma cor foi selecionada ainda, assumimos que todos os tipos são relevantes (mostra as opções)
    if (!selections['color']) return options.types;

    // Se tem cor selecionada, verificamos se EXISTE algum tipo associado a essa cor
    const variationsForColor = product.variations.filter(v => v.color === selections['color']);
    
    // Verifica se alguma variação dessa cor possui "type" ou "variation" preenchido
    const hasTypeForColor = variationsForColor.some(v => v.variation || v.type);

    // Se tiver tipos para essa cor, retorna a lista global (ou filtrada, se preferir), 
    // caso contrário retorna array vazio (não obrigatório)
    return hasTypeForColor ? options.types : [];
  }, [product, selections, options.types]);

  if (!product) return null;

  // Atualização na validação do formulário
  const isFormComplete = Boolean(
    (options.colors.length === 0 || selections['color']) &&
    (relevantTypes.length === 0 || selections['model']) && // Agora usa relevantTypes
    (options.sizes.length === 0 || selections['size'])
  );

  const canSubmitOrder = isFormComplete && isValidCombination;

  const handleSelection = (group: string, value: string) => {
    const newValue = selections[group] === value ? null : value;
    setSelection(group, newValue);
  };

  const handleSubmitOrder = async () => {
    if (!canSubmitOrder) return;

    try {
      await createOrderAction({
        title: product.name,
        total: totalValue, 
        itemsCount: buyQuantity
      });
      
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      
      alert(`✅ Pedido Realizado!\n\nProduto: ${product.name}\nValor: R$ ${totalValue.toFixed(2)}`);
      onClose();
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao processar o pedido. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">

      {/* --- HEADER --- */}
      <div className="shrink-0 px-6 py-5 bg-[#5874f6] flex justify-between items-center shadow-md z-20">
        <div className="flex flex-col text-white">
          <span className="text-xs font-bold opacity-90 uppercase tracking-widest mb-1">
            Novo Pedido
          </span>
          <h3 className="font-black text-xl tracking-tight leading-none">
            Configurar Item
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#5874f6] transition-colors active:scale-90 backdrop-blur-md"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* --- CONTEÚDO SCROLLÁVEL --- */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white relative w-full p-6 pb-36">
        
        <MiniPreviewCard product={product} />

        <div className="flex flex-col gap-8 mt-6">

            {/* 1. SELEÇÃO DE CORES */}
            {options.colors.length > 0 && (
              <div className="animate-in slide-in-from-bottom-2 duration-300 delay-75">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2 text-gray-500">
                  <Palette size={16} /> Cor
                </h3>
                <div className="flex flex-wrap gap-3">
                  {options.colors.map((color) => {
                    const isSelected = selections['color'] === color;
                    const { available } = checkOptionAvailability('color', color);
                    
                    return (
                      <button 
                        key={color} 
                        onClick={() => handleSelection('color', color)}
                        className={cn(
                          "group transition-all flex items-center gap-3 pr-5 pl-2 py-2 rounded-full border-2",
                          isSelected 
                            ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900 scale-105" 
                            : "border-gray-100 bg-white hover:border-gray-300",
                          !available && "opacity-50 grayscale"
                        )}
                      >
                        {/* Círculo da Cor Aumentado */}
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm",
                          isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-transparent"
                        )}>
                            <Check size={16} strokeWidth={4} />
                        </div>
                        <span className={cn(
                            "text-sm font-bold uppercase tracking-wide",
                            isSelected ? "text-gray-900" : "text-gray-600"
                        )}>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SELEÇÃO DE TIPO / MODELO */}
            {/* Renderiza se houver tipos globais, mas aplica estilo visual se não for relevante para a cor atual */}
            {options.types.length > 0 && (
              <div className={cn(
                "animate-in slide-in-from-bottom-2 duration-300 delay-100",
                // Se a cor foi selecionada E não há tipos relevantes para ela, esconde/desabilita visualmente
                (selections['color'] && relevantTypes.length === 0) ? "opacity-30 pointer-events-none grayscale" : ""
              )}>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2 text-gray-500">
                  <Component size={16} /> Modelo
                  {(selections['color'] && relevantTypes.length === 0) && <span className="text-xs ml-2 text-gray-400">(Não necessário)</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {options.types.map((type) => {
                    const isSelected = selections['model'] === type;
                    const { available } = checkOptionAvailability('model', type);

                    return (
                      <button 
                        key={type} 
                        onClick={() => handleSelection('model', type)}
                        className={cn(
                          "px-6 py-3.5 rounded-xl border-2 text-sm font-bold uppercase transition-all shadow-sm", 
                          isSelected 
                            ? "bg-[#5874f6] border-[#5874f6] text-white shadow-blue-500/30 scale-105" 
                            : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
                          !available && "opacity-50"
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SELEÇÃO DE TAMANHO */}
            {options.sizes.length > 0 && (
              <div className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2 text-gray-500">
                  <Ruler size={16} /> Tamanho
                </h3>
                <div className="flex flex-wrap gap-3">
                  {options.sizes.map((size) => {
                    const isSelected = selections['size'] === size;
                    const { available, qty } = checkOptionAvailability('size', size);

                    return (
                      <button 
                        key={size} 
                        onClick={() => handleSelection('size', size)}
                        className={cn(
                          "w-16 h-16 flex flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95",
                          isSelected 
                            ? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105" 
                            : "bg-white border-gray-100 text-gray-900 hover:border-gray-300",
                           !available && "opacity-40"
                        )}
                      >
                        <span className="font-black text-lg">{size}</span>
                        {(isSelected || available) && (
                            <span className={cn("text-[10px] font-bold leading-none mt-1", isSelected ? "text-gray-300" : "text-gray-400")}>
                                {available ? qty : '-'}
                            </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {!isFormComplete && (
             <div className="mt-8 p-4 bg-blue-50 rounded-xl flex gap-3 items-start border border-blue-100">
                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                    Para finalizar o pedido, certifique-se de selecionar: <br/>
                    {/* Exibe dinamicamente o que falta */}
                    {(options.colors.length > 0 && !selections['color']) && <span className="font-bold mr-1">Cor,</span>}
                    {(relevantTypes.length > 0 && !selections['model']) && <span className="font-bold mr-1">Modelo,</span>}
                    {(options.sizes.length > 0 && !selections['size']) && <span className="font-bold mr-1">Tamanho.</span>}
                </p>
             </div>
        )}
      </div>

      {/* --- FOOTER DE AÇÃO --- */}
      <div className="absolute bottom-0 left-0 w-full z-30 bg-white border-t border-gray-100 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] pb-safe-bottom">
        <div className="p-5 flex gap-4 items-center">
            
            <div className="flex flex-col pl-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Estimado</span>
                <span className="text-2xl font-black text-gray-900 leading-none">
                  R$ {totalValue > 0 ? totalValue.toFixed(2).replace('.', ',') : '0,00'}
                </span>
            </div>

            <button 
                onClick={handleSubmitOrder}
                disabled={!canSubmitOrder}
                className={cn(
                    "flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all duration-300",
                    canSubmitOrder
                        ? "bg-[#00c853] text-white hover:bg-[#00b34a] shadow-green-500/30 active:scale-95 cursor-pointer" 
                        : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                )}
            >
                {canSubmitOrder ? (
                    <>
                        <Package size={20} strokeWidth={2.5} />
                        <span className="font-black text-sm uppercase tracking-widest">Fazer Pedido</span>
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </>
                ) : (
                    <>
                        <span className="font-bold text-xs uppercase tracking-wide opacity-80">Preencha os campos</span>
                    </>
                )}
            </button>
        </div>
      </div>

    </div>
  );
};

export const ProductOrderModal = ({ isOpen, onClose, product }: ProductOrderModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 h-dvh w-screen overflow-hidden">
          {/* Backdrop com Blur Forte mas Fundo Transparente/Claro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // MUDANÇA AQUI: bg-black/10 (quase transparente) e mantém o blur
            className="absolute inset-0 bg-black/10 backdrop-blur-md transition-all duration-300"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative bg-white w-full max-w-[400px]",
              "rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/20",
              "flex flex-col",
              "h-[85vh] max-h-[800px]"
            )}
          >
            <OrderProvider product={product}>
              <OrderModalContent onClose={onClose} />
            </OrderProvider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
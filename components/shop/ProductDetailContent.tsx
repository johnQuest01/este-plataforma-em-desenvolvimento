'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image'; // ✅ CORREÇÃO: Import do componente Image
import {
  Heart, Eye, Truck, Tag, Type, Sparkles, ArrowRight, ShoppingBag, Check
} from 'lucide-react';
import { ProductData } from '@/app/actions/product';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { OrderProvider, useOrder } from '@/components/builder/context/OrderContext';
import { createOrderAction } from '@/app/actions/order'; 

interface ProductDetailContentProps {
  product: ProductData;
}

const ProductDetailInner = () => {
  const router = useRouter();
  
  const { 
    product, 
    selections, 
    setSelection, 
    checkOptionAvailability,
    isValidCombination, 
    currentStock,
    totalValue,
    basePrice,
    buyQuantity
  } = useOrder();

  const [errors, setErrors] = useState({
    color: false,
    model: false,
    size: false
  });

  // --- EXTRAÇÃO DE METADADOS ---
  const metadata = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return { category: null, keyword: null };
    return {
        category: 'Geral', 
        keyword: 'Novo'
    };
  }, [product]);

  const options = useMemo(() => {
    if (!product || !product.variants) return { colors: [], types: [], sizes: [] };

    const colors = new Set<string>();
    const types = new Set<string>();
    const sizes = new Set<string>();

    product.variants.forEach(v => {
      if (v.color) colors.add(v.color.trim());
      if (v.type) types.add(v.type.trim());
      if (v.size) sizes.add(v.size.trim());
    });

    const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '44', '46', '48'];
    const sortedSizes = Array.from(sizes).sort((a, b) => {
        const idxA = sizeOrder.indexOf(a.toUpperCase());
        const idxB = sizeOrder.indexOf(b.toUpperCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    return {
      colors: Array.from(colors),
      types: Array.from(types),
      sizes: sortedSizes
    };
  }, [product]);

  const handleSelection = (group: string, value: string) => {
    const newValue = selections[group] === value ? null : value;
    setSelection(group, newValue);
    setErrors(prev => ({ ...prev, [group]: false }));
  };

  const handleBuy = async () => {
    if (!product) return;
    
    const newErrors = {
      color: options.colors.length > 0 && !selections['color'],
      model: options.types.length > 0 && !selections['model'],
      size: options.sizes.length > 0 && !selections['size']
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      if (navigator.vibrate) navigator.vibrate(50);
      const missingFields = [];
      if (newErrors.color) missingFields.push("Cor");
      if (newErrors.model) missingFields.push("Tipo");
      if (newErrors.size) missingFields.push("Tamanho");
      alert(`⚠️ Por favor, selecione: ${missingFields.join(", ")}.`);
      return;
    }

    if (!isValidCombination) {
      alert("⚠️ A combinação selecionada não está disponível no estoque.");
      return;
    }
    
    await createOrderAction({
      title: product.name,
      total: totalValue, 
      itemsCount: buyQuantity,
      items: [{ productId: product.id, quantity: buyQuantity }] 
    });

    alert(`✅ Pedido Realizado com Sucesso!\n\nVocê pode acompanhar o status em "Meus Pedidos".`);
    router.push('/inventory'); 
  };

  if (!product) return null;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">

      {/* 1. HEADER (Fixo) */}
      <div className="shrink-0 z-[60] bg-white relative">
        <StoreHeader
          showBack={true}
          onBack={() => router.back()}
          style={{ bgColor: '#5874f6', textColor: '#ffffff' }}
          data={{
            title: 'Detalhes',
            address: 'Loja Oficial Maryland'
          }}
        />
      </div>

      {/* 2. CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">

        {/* Imagem Principal */}
        <div className="w-full aspect-[4/5] bg-gray-100 relative group">
          {/* ✅ CORREÇÃO: Substituído <img> por <Image /> do Next.js */}
          <Image
            src={product.imageUrl || 'https://placehold.co/600x800/png'} 
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <p className="text-white text-xs font-bold uppercase tracking-widest">Visualizar Zoom</p>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-6 -mt-6 relative z-10">
          
          {/* Card Principal: Nome e Preço */}
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5 border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h1 className="font-black text-xl text-gray-900 leading-tight flex-1 mr-2 tracking-wide break-words">
                {product.name}
              </h1>
              <button className="p-2 bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-colors active:scale-90">
                <Heart size={20} className="fill-current" />
              </button>
            </div>

            <div className="flex items-end justify-between border-t border-gray-100 pt-3 mt-1">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase">Preço Unitário</span>
                <span className="font-black text-3xl text-[#5874f6] tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basePrice)}
                </span>
              </div>
              <div className="flex gap-3 text-gray-400">
                <div className="flex flex-col items-center gap-1"><Truck size={18} /><span className="text-[9px] font-bold">Frete</span></div>
                <div className="flex flex-col items-center gap-1"><Eye size={18} /><span className="text-[9px] font-bold">Ver</span></div>
              </div>
            </div>
          </div>

          {/* --- SELETORES DE VARIAÇÃO --- */}
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            
            {/* 1. SELEÇÃO DE CORES */}
            {options.colors.length > 0 && (
              <div className={cn("rounded-xl p-2 transition-colors", errors.color && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2", errors.color ? "text-red-500" : "text-gray-500")}>
                  <Tag size={14} /> Selecione a Cor {errors.color && <span className="text-[10px] font-black ml-auto bg-red-100 px-2 py-0.5 rounded text-red-600">Obrigatório</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {options.colors.map((color) => {
                    const isSelected = selections['color'] === color;
                    const { available, qty } = checkOptionAvailability('color', color);
                    
                    return (
                      <button 
                        key={color} 
                        onClick={() => available && handleSelection('color', color)}
                        disabled={!available}
                        className={cn(
                          "group transition-all flex items-center gap-3 px-2 py-2 rounded-xl border-2",
                          // ✅ CORREÇÃO: Mantém bg-white mesmo selecionado para não ofuscar o texto
                          isSelected 
                            ? "border-gray-900 bg-white ring-1 ring-gray-900 scale-105" 
                            : "border-gray-100 bg-white hover:border-gray-300",
                          !available && "opacity-50 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full border shadow-sm ring-2 ring-offset-2 transition-all flex items-center justify-center shrink-0",
                          isSelected ? "ring-[#5874f6] border-transparent bg-[#5874f6] text-white" : "ring-transparent border-gray-300 bg-gray-100 text-transparent"
                        )}>
                           <Check size={14} strokeWidth={4} />
                        </div>
                        <div className="flex flex-col items-start min-w-[60px]">
                          {/* ✅ CORREÇÃO: Texto forçado para preto (text-gray-900) */}
                          <span className="text-xs font-black uppercase break-words text-left leading-tight text-gray-900">
                            {color}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 mt-0.5">
                            {available ? `${qty} disp.` : 'Esgotado'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SELEÇÃO DE TIPO / VARIAÇÃO */}
            {options.types.length > 0 && (
              <div className={cn("rounded-xl p-2 transition-colors", errors.model && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2", errors.model ? "text-red-500" : "text-gray-500")}>
                  <Sparkles size={14} /> Selecione o Tipo {errors.model && <span className="text-[10px] font-black ml-auto bg-red-100 px-2 py-0.5 rounded text-red-600">Obrigatório</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.types.map((type) => {
                    const isSelected = selections['model'] === type;
                    const { available, qty } = checkOptionAvailability('model', type);

                    return (
                      <button 
                        key={type} 
                        onClick={() => available && handleSelection('model', type)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition-all shadow-sm flex flex-col items-center justify-center min-w-[80px] flex-grow-0", 
                          isSelected 
                            ? "bg-[#5874f6] border-[#5874f6] text-white shadow-blue-500/30 scale-105" 
                            : available 
                              ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                              : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                      >
                        <span className="break-words text-center leading-tight">{type}</span>
                        {available && isSelected && <span className="text-[8px] opacity-80 mt-0.5">{qty} un.</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SELEÇÃO DE TAMANHOS */}
            {options.sizes.length > 0 && (
              <div className={cn("rounded-xl p-2 transition-colors", errors.size && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2", errors.size ? "text-red-500" : "text-gray-500")}>
                  <Type size={14} /> Tamanho {errors.size && <span className="text-[10px] font-black ml-auto bg-red-100 px-2 py-0.5 rounded text-red-600">Obrigatório</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((size) => {
                    const isSelected = selections['size'] === size;
                    const { available, qty } = checkOptionAvailability('size', size);

                    return (
                      <button 
                        key={size} 
                        onClick={() => available && handleSelection('size', size)}
                        disabled={!available}
                        className={cn(
                          "w-14 h-14 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-90",
                          isSelected 
                            ? "bg-gray-900 border-gray-900 text-white shadow-lg" 
                            : available
                              ? "bg-white border-gray-200 text-gray-900 hover:border-gray-400"
                              : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                        )}
                      >
                        <span className="font-black text-sm leading-none">{size}</span>
                        <span className={cn("text-[9px] font-bold mt-1", isSelected ? "text-white/80" : "text-gray-400")}>
                          {available ? qty : '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STATUS DO ESTOQUE */}
            <div className={cn(
              "p-4 rounded-xl border flex justify-between items-center mt-2 transition-colors duration-300",
              isValidCombination ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
            )}>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Disponibilidade
              </span>
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", isValidCombination ? "bg-green-500" : "bg-gray-300")}/>
                <span className={cn("text-xs font-black uppercase", isValidCombination ? "text-green-700" : "text-gray-400")}>
                  {isValidCombination 
                    ? `${currentStock} unidades disponíveis` 
                    : "Selecione as opções"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. RODAPÉ DE COMPRA */}
      <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="p-4 flex gap-3 items-center">
          
          <div className="flex flex-col pl-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-xl font-black text-gray-900 leading-none">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue > 0 ? totalValue : basePrice)}
            </span>
          </div>

          <button 
            onClick={handleBuy}
            className={cn(
              "flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95",
              isValidCombination 
                ? "bg-[#00c853] text-white hover:bg-[#00b34a] shadow-green-500/30" 
                : "bg-gray-900 text-white shadow-none opacity-90" 
            )}
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            <span className="font-black text-sm uppercase tracking-widest">
              {isValidCombination ? "Comprar Agora" : "Adicionar"}
            </span>
            {isValidCombination && <ArrowRight size={20} strokeWidth={2.5} />}
          </button>

        </div>
      </div>

    </div>
  );
};

export const ProductDetailContent = ({ product }: ProductDetailContentProps) => {
  return (
    <OrderProvider product={product}>
      <ProductDetailInner />
    </OrderProvider>
  );
};
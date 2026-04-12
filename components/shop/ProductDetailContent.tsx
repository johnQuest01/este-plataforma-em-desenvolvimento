// path: src/components/shop/ProductDetailContent.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image'; 
import {
  Heart, Eye, Truck, Tag, Type, Sparkles, ArrowRight, ShoppingBag, Check
} from 'lucide-react';
import { ProductData } from '@/app/actions/product.schema';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { OrderProvider, useOrder } from '@/components/builder/context/OrderContext';
import { createOrderAction } from '@/app/actions/order';
import { LocalDB } from '@/lib/local-db';

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

interface ProductDetailContentProps {
  product: ProductData;
}

const ProductDetailInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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

  const options = useMemo(() => {
    if (!product || !product.variants) return { colors: [], types: [], sizes: [] };

    const colors = new Set<string>();
    const types = new Set<string>();
    const sizes = new Set<string>();

    product.variants.forEach(variant => {
      if (variant.color) colors.add(variant.color.trim());
      if (variant.type) types.add(variant.type.trim());
      if (variant.size) sizes.add(variant.size.trim());
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

  const handleSelection = (group: string, value: string) => {
    const newValue = selections[group] === value ? null : value;
    setSelection(group, newValue);
    setErrors(previous => ({ ...previous, [group]: false }));
  };

  const handleBuy = async () => {
    if (!product) return;

    // ── 1. Verificar autenticação ANTES de qualquer coisa ──────────────────
    // Visitantes que chegaram via link da vendedora devem se cadastrar primeiro.
    const user = LocalDB.getUser();
    if (!user) {
      const sellerSlug =
        searchParams.get('seller') ||
        (typeof window !== 'undefined' ? localStorage.getItem('md_seller_ref') ?? '' : '');
      router.push(sellerSlug ? `/?seller=${sellerSlug}` : '/');
      return;
    }

    // ── 2. Validações de variantes ─────────────────────────────────────────
    const newErrors = {
      color: options.colors.length > 0 && !selections['color'],
      model: options.types.length > 0 && !selections['model'],
      size: options.sizes.length > 0 && !selections['size']
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      if (navigator.vibrate) navigator.vibrate(50);
      const missingFields: string[] = [];
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

    // ── 3. Criar pedido com contexto do cliente e da vendedora ─────────────
    // Se o cliente veio via link da vendedora, grava a referência para comissão.
    const sellerSlug =
      searchParams.get('seller') ||
      (typeof window !== 'undefined' ? localStorage.getItem('md_seller_ref') ?? '' : '');

    await createOrderAction({
      title: product.name,
      total: totalValue,
      itemsCount: buyQuantity,
      items: [{ productId: product.id, quantity: buyQuantity }],
      customerId: user.id,
      sellerSlug: sellerSlug || undefined,
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

      {/* 2. CONTEÚDO SCROLLÁVEL (Sem padding bottom gigante, fluxo natural) */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe-bottom">

        {/* Imagem Principal */}
        <div className="w-full aspect-[4/4.5] bg-gray-100 relative group">
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

        {/* Container de Informações (Adicionado pb-6 para respiro no final da tela) */}
        <div className="px-4 flex flex-col gap-4 -mt-5 relative z-10 pb-6">
          
          {/* Card Principal: Nome e Preço */}
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5 border border-gray-100 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="font-black text-lg text-gray-900 leading-tight flex-1 mr-2 tracking-wide break-words">
                {product.name}
              </h1>
              <button className="p-1.5 bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-colors active:scale-90">
                <Heart size={18} className="fill-current" />
              </button>
            </div>

            <div className="flex items-end justify-between border-t border-gray-50 pt-2 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Preço Unitário</span>
                {/* Preço reduzido para text-xl */}
                <span className="font-black text-xl text-[#5874f6] tracking-tight">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basePrice)}
                </span>
              </div>
              <div className="flex gap-3 text-gray-400">
                <div className="flex flex-col items-center gap-0.5"><Truck size={16} /><span className="text-[9px] font-bold">Frete</span></div>
                <div className="flex flex-col items-center gap-0.5"><Eye size={16} /><span className="text-[9px] font-bold">Ver</span></div>
              </div>
            </div>
          </div>

          {/* --- SELETORES DE VARIAÇÃO --- */}
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            
            {/* 1. SELEÇÃO DE CORES */}
            {options.colors.length > 0 && (
              <div className={cn("rounded-xl p-1.5 transition-colors", errors.color && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5", errors.color ? "text-red-500" : "text-gray-500")}>
                  <Tag size={12} /> Selecione a Cor {errors.color && <span className="text-[9px] font-black ml-auto bg-red-100 px-1.5 py-0.5 rounded text-red-600">Obrigatório</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.colors.map((color) => {
                    const isSelected = selections['color'] === color;
                    const { available, qty } = checkOptionAvailability('color', color);
                    
                    return (
                      <button 
                        key={color} 
                        onClick={() => available && handleSelection('color', color)}
                        disabled={!available}
                        className={cn(
                          "group transition-all flex items-center gap-2 px-2 py-1.5 rounded-xl border-2",
                          isSelected 
                            ? "border-gray-900 bg-white ring-1 ring-gray-900 scale-105" 
                            : "border-gray-100 bg-white hover:border-gray-300",
                          !available && "opacity-50 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full border shadow-sm ring-2 ring-offset-1 transition-all flex items-center justify-center shrink-0",
                          isSelected ? "ring-[#5874f6] border-transparent bg-[#5874f6] text-white" : "ring-transparent border-gray-300 bg-gray-100 text-transparent"
                        )}>
                           <Check size={12} strokeWidth={4} />
                        </div>
                        <div className="flex flex-col items-start min-w-[50px]">
                          <span className="text-[11px] font-black uppercase break-words text-left leading-tight text-gray-900">
                            {color}
                          </span>
                          <span className={cn("text-xs font-black mt-0.5", available ? "text-green-600" : "text-gray-400")}>
                            {available ? `${qty} un.` : 'Esgotado'}
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
              <div className={cn("rounded-xl p-1.5 transition-colors", errors.model && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5", errors.model ? "text-red-500" : "text-gray-500")}>
                  <Sparkles size={12} /> Selecione o Tipo {errors.model && <span className="text-[9px] font-black ml-auto bg-red-100 px-1.5 py-0.5 rounded text-red-600">Obrigatório</span>}
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
                          "px-3 py-2 rounded-xl border-2 text-[11px] font-black uppercase tracking-wide transition-all shadow-sm flex flex-col items-center justify-center min-w-[60px] flex-grow-0", 
                          isSelected 
                            ? "bg-[#5874f6] border-[#5874f6] text-white shadow-blue-500/30 scale-105" 
                            : available 
                              ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                              : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                      >
                        <span className="break-words text-center leading-tight">{type}</span>
                        {available && <span className={cn("text-xs font-black mt-0.5", isSelected ? "text-white/90" : "text-green-600")}>{qty} un.</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SELEÇÃO DE TAMANHOS */}
            {options.sizes.length > 0 && (
              <div className={cn("rounded-xl p-1.5 transition-colors", errors.size && "bg-red-50 border border-red-200 animate-pulse")}>
                <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5", errors.size ? "text-red-500" : "text-gray-500")}>
                  <Type size={12} /> Tamanho {errors.size && <span className="text-[9px] font-black ml-auto bg-red-100 px-1.5 py-0.5 rounded text-red-600">Obrigatório</span>}
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
                          "w-11 h-11 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-90",
                          isSelected 
                            ? "bg-gray-900 border-gray-900 text-white shadow-md" 
                            : available
                              ? "bg-white border-gray-200 text-gray-900 hover:border-gray-400"
                              : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                        )}
                      >
                        <span className="font-black text-xs leading-none">{size}</span>
                        <span className={cn("text-xs font-black mt-0.5", isSelected ? "text-white/90" : available ? "text-green-600" : "text-gray-400")}>
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
              "p-3 rounded-xl border flex justify-between items-center mt-1 transition-colors duration-300",
              isValidCombination ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
            )}>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Disponibilidade
              </span>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isValidCombination ? "bg-green-500" : "bg-gray-300")}/>
                <span className={cn("text-[11px] font-black uppercase", isValidCombination ? "text-green-700" : "text-gray-400")}>
                  {isValidCombination 
                    ? `${currentStock} unidades disponíveis` 
                    : "Selecione as opções"}
                </span>
              </div>
            </div>

            {/* 4. ÁREA DE COMPRA (Agora inline, dentro do fluxo da página) */}
            <div className="mt-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3 items-center shadow-sm">
              
              <div className="flex flex-col pl-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                {/* Preço total reduzido para text-base */}
                <span className="text-base font-black text-gray-900 leading-none">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue > 0 ? totalValue : basePrice)}
                </span>
              </div>

              {/* Botão reduzido para h-10 e texto menor */}
              <button 
                onClick={handleBuy}
                className={cn(
                  "flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95",
                  isValidCombination 
                    ? "bg-[#00c853] text-white hover:bg-[#00b34a]" 
                    : "bg-gray-900 text-white opacity-90" 
                )}
              >
                <ShoppingBag size={16} strokeWidth={2.5} />
                <span className="font-black text-[11px] uppercase tracking-widest">
                  {isValidCombination ? "Comprar Agora" : "Adicionar"}
                </span>
                {isValidCombination && <ArrowRight size={16} strokeWidth={2.5} />}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// 1. Componente Base (Wrapper do Contexto)
function ProductDetailContentBase({ product }: ProductDetailContentProps) {
  return (
    <OrderProvider product={product}>
      <ProductDetailInner />
    </OrderProvider>
  );
}

// ✅ 2. Exportação com Etiqueta Inteligente (Guardian Beacon)
export const ProductDetailContent = withGuardian(
  ProductDetailContentBase,
  "components/shop/ProductDetailContent.tsx",
  "UI_COMPONENT",
  {
    label: "Detalhes do Produto (PDP)",
    description: "Componente central da página de produto. Gerencia seleção de variações (Cor, Tamanho, Tipo), cálculo de preço e validação de estoque.",
    orientationNotes: `
📌 **Lógica de Negócio**:
- Utiliza 'OrderContext' para gerenciar o estado global do pedido.
- Valida combinações de estoque em tempo real.
- Dispara 'createOrderAction' ao finalizar a compra.
    `.trim(),
    connectsTo: [
      { 
        target: "components/builder/context/OrderContext.tsx", 
        type: "COMPONENT", 
        description: "Contexto de Pedido (Estado Global)" 
      },
      { 
        target: "app/actions/order.ts", 
        type: "EXTERNAL", 
        description: "Server Action: createOrderAction" 
      }
    ],
    tags: ["PDP", "E-commerce", "Complex Logic"]
  }
);
// path: src/components/shop/ProductDetailModal.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Heart, Share2, Eye, Truck,
  ArrowRight, Sparkles, Tag, Type, ChevronLeft
} from 'lucide-react';
import { ProductData } from '@/app/actions/product';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // ✅ Importação do Next Image

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
}

// 🛡️ GUARDIAN: Safe Property Access Helper
// Allows accessing properties that might exist in DB but are missing in the generated Type (Prisma)
// This avoids 'any' and 'as Type' assertions in the main logic.
function getSafeString(item: unknown, key: string): string | undefined {
  if (typeof item === 'object' && item !== null && key in item) {
    const val = (item as Record<string, unknown>)[key];
    return typeof val === 'string' ? val : undefined;
  }
  return undefined;
}

export const ProductDetailModal = ({ isOpen, onClose, product }: ProductDetailModalProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // --- LÓGICA DE DADOS ---
  const metadata = useMemo(() => {
    const categories = new Set<string>();
    const keywords = new Set<string>();
    const types = new Set<string>();
    const colors: Record<string, number> = {};
    const sizes: Record<string, number> = {};
    let totalStock = 0;

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        // 🛡️ Safe Extraction using Helper Function
        const category = getSafeString(v, 'category');
        const keyword = getSafeString(v, 'keyword');
        
        if (category) categories.add(category);
        if (keyword) keywords.add(keyword);
        
        // 'type' exists in the base interface (optional), so we access it directly if present
        if (v.type) types.add(v.type);

        // Strict Type Safety for Stock/Qty
        // We check existence of 'stock' safely without forcing type overrides
        let variantStock = 0;
        if ('stock' in v && typeof (v as Record<string, unknown>).stock === 'number') {
             variantStock = (v as Record<string, unknown>).stock as number;
        }
        
        const quantity = v.qty ?? variantStock ?? 0;

        if (v.color) colors[v.color] = (colors[v.color] || 0) + quantity;
        if (v.size) sizes[v.size] = (sizes[v.size] || 0) + quantity;
        totalStock += quantity;
      });
    }

    return {
      categories: Array.from(categories),
      keywords: Array.from(keywords),
      types: Array.from(types),
      colors,
      sizes,
      totalStock
    };
  }, [product]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* 1. CONTAINER GLOBAL */}
      <div className="fixed inset-0 z-[200] flex justify-center items-center lg:py-8 pointer-events-none">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* 2. O APARELHO (Modal) */}
        <motion.div
          key={product.id}
          initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "pointer-events-auto relative flex flex-col bg-white overflow-hidden w-full h-full",
            "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
            "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl"
          )}
        >
          {/* --- 1. HEADER --- */}
          <div className="bg-[#5874f6] shrink-0 relative z-50">
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl pointer-events-none z-50"></div>

            <div className="px-4 py-3 pt-safe-top lg:pt-8 flex items-center justify-between text-white relative">
              <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors active:scale-90 flex items-center gap-1">
                <ChevronLeft size={24} strokeWidth={2.5} />
                <span className="font-bold text-sm">Voltar</span>
              </button>
              <span className="font-bold text-lg tracking-tight absolute left-1/2 -translate-x-1/2">Detalhes</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-90"><Share2 size={20} /></button>
              </div>
            </div>

            <div className="px-4 pb-4 flex items-center gap-2 text-white/90 text-xs font-medium">
              <MapPin size={14} />
              <span className="truncate opacity-80">Enviando para sua localização atual</span>
            </div>
          </div>

          {/* --- 2. CONTEÚDO --- */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-white pb-32 relative">
            
            {/* Imagem Principal Otimizada */}
            <div className="w-full aspect-[4/5] bg-gray-100 relative group">
              <Image 
                src={product.mainImage || 'https://placehold.co/600x800/png'} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none">
                <p className="text-white text-xs font-bold uppercase tracking-widest">Visualizar Zoom</p>
              </div>
            </div>

            <div className="px-5 flex flex-col gap-6 -mt-6 relative z-10">
              {/* Info Básica */}
              <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5 border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h1 className="font-black text-xl text-gray-900 leading-tight flex-1 mr-2 tracking-wide">{product.name}</h1>
                  <button className="p-2 bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-colors active:scale-90"><Heart size={20} className="fill-current" /></button>
                </div>
                <div className="flex items-end justify-between border-t border-gray-100 pt-3 mt-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Preço Final</span>
                    <span className="font-black text-3xl text-[#5874f6] tracking-tight">{product.price}</span>
                  </div>
                  <div className="flex gap-3 text-gray-400">
                    <div className="flex flex-col items-center gap-1"><Truck size={18} /><span className="text-[9px] font-bold">Frete</span></div>
                    <div className="flex flex-col items-center gap-1"><Eye size={18} /><span className="text-[9px] font-bold">Ver</span></div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 flex items-center gap-1">Informações do Produto</h3>
                <div className="flex flex-wrap gap-2">
                  {metadata.categories.map(cat => (
                    <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg"><Tag size={12} className="text-blue-500" /><span className="text-xs font-medium text-gray-600">Categoria: <strong className="text-blue-600">{cat}</strong></span></div>
                  ))}
                  {metadata.keywords.map(keyw => (
                    <div key={keyw} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg"><Type size={12} className="text-purple-500" /><span className="text-xs font-medium text-gray-600">Palavra-chave: <strong className="text-purple-600">{keyw}</strong></span></div>
                  ))}
                  {metadata.types.map(type => (
                    <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg"><Sparkles size={12} className="text-orange-500" /><span className="text-xs font-medium text-gray-600">Tipo: <strong className="text-orange-600">{type}</strong></span></div>
                  ))}
                </div>
              </div>

              {/* Cores */}
              {Object.keys(metadata.colors).length > 0 && (
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-gray-500">Cores Disponíveis</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(metadata.colors).map(([color, count]) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={cn("group active:scale-95 transition-all flex items-center gap-3 px-1")}>
                        <div className={cn("w-6 h-6 rounded-full border shadow-sm ring-2 ring-offset-2 transition-all", selectedColor === color ? "ring-[#5874f6] border-transparent bg-[#5874f6]" : "ring-transparent border-gray-300 bg-gray-100")}>
                          {selectedColor === color && <div className="w-full h-full flex items-center justify-center text-white"><ArrowRight size={12}/></div>}
                        </div>
                        <div className={cn("px-4 py-2 rounded-xl border-2 transition-all min-w-[100px] flex items-center justify-between", selectedColor === color ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900 group-hover:border-gray-300")}>
                          <span className="text-xs font-black uppercase">{color}</span>
                          <span className={cn("text-[10px] font-bold", selectedColor === color ? "text-white/70" : "text-gray-400")}>{count} un</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tamanhos */}
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-gray-500">Tamanhos</h3>
                <div className="flex flex-wrap gap-2">
                  {['PP', 'P', 'M', 'G', 'GG', 'XG'].map((size) => {
                    const qty = metadata.sizes[size] || 0;
                    if (qty === 0 && !['PP', 'P', 'M', 'G', 'GG', 'XG'].includes(size)) return null;
                    const isSelected = selectedSize === size;
                    return (
                      <button key={size} onClick={() => setSelectedSize(size)} className={cn("w-12 h-14 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-90", (qty > 0 || isSelected) ? (isSelected ? "bg-[#5874f6] border-[#5874f6] text-white shadow-lg shadow-blue-500/30" : "bg-white border-gray-200 text-gray-900 hover:border-blue-200") : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60")} disabled={qty === 0}>
                        <span className="font-black text-sm leading-none">{size}</span>
                        <span className={cn("text-[9px] font-bold mt-1", isSelected ? "text-white/80" : "text-gray-400")}>{qty > 0 ? qty : '-'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SKU */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50 flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">SKU: {product.id.toUpperCase().slice(0, 8)}</span>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span className="text-[10px] font-black uppercase text-green-600">Em Estoque</span></div>
              </div>
            </div>
          </div>

          {/* --- 3. RODAPÉ DE AÇÃO --- */}
          <div className="absolute bottom-0 left-0 w-full bg-white px-4 py-4 pb-safe-bottom border-t border-gray-100 flex gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <button className="flex-1 py-3.5 bg-white border-2 border-[#5874f6] text-[#5874f6] rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-blue-50 transition-colors active:scale-95">Adicionar</button>
            <button className="flex-[1.5] py-3.5 bg-[#5874f6] text-white rounded-2xl font-black text-base uppercase tracking-wide hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2">Comprar Agora <ArrowRight size={18} strokeWidth={3} /></button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
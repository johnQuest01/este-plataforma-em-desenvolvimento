'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Layers, RefreshCw } from 'lucide-react';
import { ProductData, getProductsAction } from '@/app/actions/product';

interface StockResupplyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockResupplyPopup = ({ isOpen, onClose }: StockResupplyPopupProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Busca os produtos ao abrir o popup
  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await getProductsAction();
          setProducts(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [isOpen]);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}      
            exit={{ x: "100%", opacity: 0 }}    
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-[#f0f2f5] w-full h-full sm:h-[85vh] sm:w-full sm:max-w-[420px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-gray-200"
          >
            {/* Header */}
            <div className="bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 shadow-sm z-10 pt-safe-top">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gestão de Estoque</span>
                <h2 className="text-xl font-black text-gray-900 leading-none">Abastecer</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors active:scale-90"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Busca */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-700 focus:border-[#5874f6] focus:bg-white outline-none transition-all placeholder:font-normal"
                />
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 bg-[#f0f2f5]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-xs font-bold">Carregando estoque...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-bold">
                  Nenhum produto encontrado.
                </div>
              ) : (
                filtered.map(product => {
                  const totalQty = product.variations.reduce((acc, v) => acc + v.qty, 0);
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4">
                      
                      {/* Cabeçalho do Card (Foto e Nome) */}
                      <div className="flex gap-4">
                        <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shrink-0 relative">
                          <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm text-center py-1">
                            <span className="text-[10px] text-white font-bold">{totalQty} total</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <h3 className="font-black text-gray-900 text-base uppercase leading-tight line-clamp-2">
                            {product.name}
                          </h3>
                          <span className="text-sm font-bold text-[#5874f6] bg-blue-50 px-2 py-1 rounded-lg w-fit">
                            {product.price}
                          </span>
                        </div>
                      </div>

                      {/* --- LISTA DE VARIAÇÕES (Scroll Mantido e Textos Maiores) --- */}
                      <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {product.variations.map((v, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                            
                            <div className="flex items-center gap-3 overflow-hidden">
                              {/* Quadrado do Tamanho (Aumentado) */}
                              <span className="font-black bg-gray-900 text-white w-10 h-10 flex items-center justify-center rounded-lg text-sm shrink-0 shadow-sm">
                                {v.size}
                              </span>
                              
                              <div className="flex flex-col leading-tight truncate">
                                {/* Cor (Aumentado) */}
                                <span className="font-extrabold text-gray-800 text-sm truncate uppercase">
                                  {v.color}
                                </span>
                                {/* Tipo/Variação (Aumentado) */}
                                {(v.variation || v.type) && (
                                  <span className="text-xs font-semibold text-gray-500 truncate">
                                    {v.variation || v.type}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantidade (Aumentado e Destacado) */}
                            <div className="flex flex-col items-end pl-2">
                              <span className="font-black text-gray-900 text-base leading-none">
                                {v.qty}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                un
                              </span>
                            </div>

                          </div>
                        ))}
                      </div>

                      {/* Botão de Ação */}
                      <button 
                        onClick={() => alert(`Separando estoque para vendedoras: ${product.name}`)}
                        className="w-full h-12 bg-white border-2 border-[#5874f6] text-[#5874f6] rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
                      >
                        <Layers size={18} strokeWidth={2.5} />
                        Separar Estoque
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe-bottom">
              <button
                onClick={onClose}
                className="w-full h-12 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all text-sm uppercase hover:bg-gray-200"
              >
                Voltar
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
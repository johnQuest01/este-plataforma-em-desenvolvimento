// components/builder/ui/OrdersModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOrdersAction, OrderData } from '@/app/actions/order';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal = ({ isOpen, onClose }: OrdersModalProps) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os pedidos sempre que o modal abre
  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          // Busca os dados via Server Action
          const data = await getOrdersAction();
          // Só atualiza o estado se o componente ainda estiver montado
          if (isMounted) {
            setOrders(data);
          }
        } catch (error) {
          console.error("Erro ao buscar pedidos:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchOrders();

    // Função de limpeza para evitar atualização de estado se o componente desmontar
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Container do Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className={cn(
              "relative bg-[#f5f5f5] w-full max-w-[360px]",
              "h-[85%] max-h-[85%] flex flex-col",
              "rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
            )}
          >

            {/* HEADER */}
            <div className="p-4 pb-2 shrink-0 z-10">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Minhas Compras
                  </span>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                    Meus Pedidos
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors active:scale-90"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* LISTA DE PEDIDOS */}
            <div className="flex-1 overflow-y-auto p-4 pt-2 scrollbar-hide space-y-3">
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs font-bold animate-pulse">
                  Carregando pedidos...
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <ShoppingBag size={48} className="text-gray-300 mb-2"/>
                  <span className="text-sm font-bold text-gray-400">Nenhum pedido realizado</span>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="relative p-4 rounded-2xl shadow-sm border border-gray-200 bg-white active:scale-[0.98] transition-all flex flex-col gap-3"
                  >
                    {/* Linha Superior: Título e Data */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-gray-900 leading-tight mb-1">
                          {order.title}
                        </span>
                        {/* ✅ CORREÇÃO: Alterado de date para createdAt com formatação */}
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {/* ✅ MELHORIA: Valor formatado como moeda */}
                      <span className="font-black text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    {/* Divisória pontilhada */}
                    <div className="w-full border-t border-dashed border-gray-200" />

                    {/* Linha Inferior: Status e Badges */}
                    <div className="flex items-center justify-between">
                      
                      {/* BADGE 1: STATUS DO PEDIDO */}
                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
                        order.status === 'COMPLETED' 
                          ? "bg-green-50 text-green-700 border-green-100" 
                          : "bg-yellow-50 text-yellow-700 border-yellow-100"
                      )}>
                        <CheckCircle2 size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-wide">
                          {order.statusLabel}
                        </span>
                      </div>

                      {/* BADGE 2: EMBALANDO */}
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Package size={14} />
                        <span className="text-[10px] font-bold uppercase">
                          Sendo Embalado
                        </span>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RODAPÉ */}
            <div className="p-4 pt-2 bg-gradient-to-t from-[#eeeeee] to-[#eeeeee]/0 shrink-0">
              <button
                onClick={onClose}
                className="w-full h-12 bg-[#ff4d6d] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-transform border border-white/10 flex items-center justify-center gap-2"
              >
                <X size={18} strokeWidth={3} />
                Fechar
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
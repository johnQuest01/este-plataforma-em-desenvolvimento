'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ChevronLeft, ShoppingBag, Loader2,
  AlertCircle, Trash2, Plus, Minus, ChevronDown, ChevronUp,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { LocalDB } from '@/lib/local-db';
import {
  getSellerStockAction,
  updateSellerStockQuantityAction,
} from '@/app/actions/maryland-catalog-actions';
import { type SellerInventoryItemDTO } from '@/schemas/maryland-catalog-schema';

// ─── Agrupa itens por produto ─────────────────────────────────────────────────

interface ProductGroup {
  productId:   string;
  productName: string;
  imageUrl:    string | null;
  price:       number;
  items:       SellerInventoryItemDTO[];
  totalQty:    number;
}

function groupByProduct(items: SellerInventoryItemDTO[]): ProductGroup[] {
  const map: Record<string, ProductGroup> = {};
  for (const item of items) {
    if (!map[item.productId]) {
      map[item.productId] = {
        productId:   item.productId,
        productName: item.productName,
        imageUrl:    item.imageUrl,
        price:       item.price,
        items:       [],
        totalQty:    0,
      };
    }
    map[item.productId].items.push(item);
    map[item.productId].totalQty += item.quantity;
  }
  return Object.values(map);
}

// ─── Card de grupo de produto ─────────────────────────────────────────────────

interface ProductGroupCardProps {
  group:       ProductGroup;
  onChangeQty: (item: SellerInventoryItemDTO, delta: number) => Promise<void>;
  updatingId:  string | null;
}

function ProductGroupCard({ group, onChangeQty, updatingId }: ProductGroupCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Cabeçalho do produto */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
          {group.imageUrl ? (
            <Image src={group.imageUrl} alt={group.productName} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{group.productName}</p>
          <p className="text-xs text-[#5874f6] font-bold mt-0.5">
            R$ {group.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {group.totalQty} un.
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Lista de variações */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 last:border-0">
                  {/* Tags de variação */}
                  <div className="flex-1 min-w-0">
                    {item.variantName ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.variantName.split(' · ').map((part, i) => (
                          <span key={i} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            i === 0 ? 'bg-pink-50 text-pink-700'
                            : i === 1 ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {part}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Padrão</span>
                    )}
                  </div>

                  {/* Controle de quantidade */}
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => onChangeQty(item, -1)}
                      disabled={updatingId === item.id}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      {item.quantity === 1
                        ? <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
                        : <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-gray-800 tabular-nums">
                      {updatingId === item.id ? '…' : item.quantity}
                    </span>
                    <button
                      onClick={() => onChangeQty(item, +1)}
                      disabled={updatingId === item.id}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Bloco principal ─────────────────────────────────────────────────────────

export const SellerOwnStockBlock: React.FC<BlockComponentProps> = ({ onAction }) => {
  const [localUser] = useState(() =>
    typeof window !== 'undefined' ? LocalDB.getUser() : null
  );

  const [items, setItems]         = useState<SellerInventoryItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!localUser?.id) { setIsLoading(false); return; }
    getSellerStockAction({ sellerId: localUser.id }).then((res) => {
      if (res.success) setItems(res.data);
      setIsLoading(false);
    });
  }, [localUser?.id]);

  const handleChangeQty = async (item: SellerInventoryItemDTO, delta: number) => {
    if (!localUser?.id) return;
    const newQty = item.quantity + delta;
    setUpdatingId(item.id);
    await updateSellerStockQuantityAction({
      sellerId:  localUser.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity:  Math.max(0, newQty),
    });
    setItems((prev) =>
      newQty <= 0
        ? prev.filter((i) => i.id !== item.id)
        : prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i)
    );
    setUpdatingId(null);
  };

  const groups = groupByProduct(items);
  const totalItens = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className="w-full flex flex-col overflow-y-auto overscroll-contain pb-28 bg-[#f5f5f5]"
      style={{ maxHeight: 'calc(100dvh - 4rem)' }}
    >
      {/* Cabeçalho */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction?.('GO_BACK')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-[#5874f6]/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#5874f6]" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">Meu Estoque</h1>
              <p className="text-[10px] font-medium text-gray-400">
                {groups.length} produto{groups.length !== 1 ? 's' : ''}
                {' · '}
                {totalItens} unidade{totalItens !== 1 ? 's' : ''} no total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#5874f6]" />
            <span className="text-sm font-medium text-gray-400">Carregando seu estoque…</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
            <Package className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-gray-400">Seu estoque está vazio.</p>
            <p className="text-xs text-gray-300 text-center px-4">
              Vá em "Estoque Maryland" para escolher produtos e variações.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {groups.map((group) => (
              <ProductGroupCard
                key={group.productId}
                group={group}
                onChangeQty={handleChangeQty}
                updatingId={updatingId}
              />
            ))}
          </AnimatePresence>
        )}

        {groups.length > 0 && (
          <div className="mt-2 p-4 bg-[#5874f6]/5 rounded-2xl border border-[#5874f6]/10 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#5874f6] shrink-0" strokeWidth={1.75} />
            <p className="text-xs text-gray-500 font-medium">
              Para adicionar mais variações, vá em{' '}
              <span className="font-semibold text-[#d4789a]">Estoque Maryland</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

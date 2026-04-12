'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, PackagePlus, CheckCircle2, XCircle,
  Loader2, ChevronLeft, ShoppingBag, Minus, Plus,
  Layers, Check,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { LocalDB } from '@/lib/local-db';
import {
  getMarylandCatalogAction,
  addToSellerStockAction,
} from '@/app/actions/maryland-catalog-actions';
import {
  type MarylandCatalogProductDTO,
  type ProductVariantDTO,
} from '@/schemas/maryland-catalog-schema';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface SelectedVariant {
  variantId:   string;
  variantName: string;
  quantity:    number;
  maxStock:    number;
}

// ─── Toast de feedback ────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

function FeedbackToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const ok = toast?.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-300 flex items-center gap-2.5
        px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-[310px] w-max
        ${ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
    >
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      <span>{toast?.message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-70 hover:opacity-100">
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Modal de seleção de variações ───────────────────────────────────────────

interface VariantModalProps {
  product:   MarylandCatalogProductDTO;
  onConfirm: (selected: SelectedVariant[]) => Promise<void>;
  onClose:   () => void;
  isLoading: boolean;
}

function VariantModal({ product, onConfirm, onClose, isLoading }: VariantModalProps) {
  const [selected, setSelected] = useState<Record<string, SelectedVariant>>({});
  const hasVariants = product.variants.length > 0;

  const toggle = (v: ProductVariantDTO) => {
    setSelected((prev) => {
      if (prev[v.id]) {
        const next = { ...prev };
        delete next[v.id];
        return next;
      }
      return { ...prev, [v.id]: { variantId: v.id, variantName: v.label, quantity: 1, maxStock: v.stock } };
    });
  };

  const changeQty = (variantId: string, delta: number) => {
    setSelected((prev) => {
      const item = prev[variantId];
      if (!item) return prev;
      const newQty = Math.max(1, Math.min(item.maxStock, item.quantity + delta));
      return { ...prev, [variantId]: { ...item, quantity: newQty } };
    });
  };

  const selectAll = () => {
    const next: Record<string, SelectedVariant> = {};
    for (const v of product.variants.filter((v) => v.stock > 0)) {
      next[v.id] = { variantId: v.id, variantName: v.label, quantity: 1, maxStock: v.stock };
    }
    setSelected(next);
  };

  const selectedList = Object.values(selected);
  const allSelected = product.variants.filter((v) => v.stock > 0).length === selectedList.length;

  const handleConfirm = () => {
    if (selectedList.length === 0) return;
    onConfirm(selectedList);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-300 flex items-end justify-center"
    >
      {/* overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
        className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85dvh]"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Cabeçalho */}
        <div className="px-5 pt-2 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
              {product.imageUrl
                ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
                : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
              {product.category && <p className="text-[10px] text-gray-400 font-medium">{product.category}</p>}
              <p className="text-sm font-bold text-[#5874f6]">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 shrink-0" />

        {/* Título + botão "Todas" */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between shrink-0">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {hasVariants ? `${product.variants.length} variações disponíveis` : 'Produto sem variação'}
          </p>
          {hasVariants && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={allSelected ? () => setSelected({}) : selectAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                allSelected
                  ? 'bg-[#5874f6] text-white'
                  : 'bg-[#5874f6]/10 text-[#5874f6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {allSelected ? 'Desfazer tudo' : 'Todas as variações'}
            </motion.button>
          )}
        </div>

        {/* Lista de variações */}
        <div className="overflow-y-auto flex-1 px-5 pb-2">
          {!hasVariants ? (
            // Produto sem variação — exibe como item único
            <div className="py-3">
              <div
                onClick={() => setSelected(
                  selected['__no_variant__']
                    ? {}
                    : { '__no_variant__': { variantId: '', variantName: '', quantity: 1, maxStock: product.totalStock } }
                )}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  selected['__no_variant__'] ? 'border-[#5874f6] bg-[#5874f6]/5' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selected['__no_variant__'] ? 'border-[#5874f6] bg-[#5874f6]' : 'border-gray-300'
                }`}>
                  {selected['__no_variant__'] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Produto padrão</p>
                  <p className="text-xs text-gray-400">{product.totalStock} unidades disponíveis</p>
                </div>
                {selected['__no_variant__'] && (
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); changeQty('__no_variant__', -1); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                      <Minus className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold tabular-nums">
                      {selected['__no_variant__'].quantity}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); changeQty('__no_variant__', +1); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                      <Plus className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              {product.variants.map((v) => {
                const isSelected = !!selected[v.id];
                const noStock = v.stock === 0;
                return (
                  <div
                    key={v.id}
                    onClick={() => !noStock && toggle(v)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      noStock
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'border-[#5874f6] bg-[#5874f6]/5 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 cursor-pointer hover:border-gray-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#5874f6] bg-[#5874f6]' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>

                    {/* Info da variação */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {v.color && (
                          <span className="px-2 py-0.5 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md">
                            {v.color}
                          </span>
                        )}
                        {v.size && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                            {v.size}
                          </span>
                        )}
                        {v.type && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
                            {v.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-bold text-[#5874f6]">
                          R$ {v.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[10px] font-medium ${noStock ? 'text-red-400' : 'text-gray-400'}`}>
                          {noStock ? 'Esgotado' : `${v.stock} disponíveis`}
                        </p>
                        {v.sku && <p className="text-[9px] text-gray-300 font-mono">{v.sku}</p>}
                      </div>
                    </div>

                    {/* Controle de quantidade (quando selecionado) */}
                    {isSelected && (
                      <div
                        className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => changeQty(v.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-gray-800 tabular-nums select-none">
                          {selected[v.id].quantity}
                        </span>
                        <button
                          onClick={() => changeQty(v.id, +1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé com confirmação */}
        <div className="px-5 pt-3 pb-6 shrink-0 border-t border-gray-100">
          {selectedList.length > 0 && (
            <p className="text-xs text-center text-gray-400 font-medium mb-2">
              {selectedList.length} {selectedList.length === 1 ? 'variação selecionada' : 'variações selecionadas'}
              {' — '}
              {selectedList.reduce((a, v) => a + v.quantity, 0)} unidades no total
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={isLoading || selectedList.length === 0}
              className="flex-1 h-12 rounded-2xl bg-[#5874f6] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <PackagePlus className="w-4 h-4" />}
              {isLoading ? 'Adicionando…' : 'Confirmar'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Card de produto no grid 2 colunas ───────────────────────────────────────

interface ProductCardProps {
  product: MarylandCatalogProductDTO;
  onPick:  (product: MarylandCatalogProductDTO) => void;
}

function ProductCard({ product, onPick }: ProductCardProps) {
  const outOfStock = product.totalStock === 0;
  const variantCount = product.variants.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border overflow-hidden flex flex-col ${
        outOfStock ? 'border-gray-100 opacity-55' : 'border-gray-100 shadow-sm'
      }`}
    >
      {/* Imagem quadrada */}
      <div className="relative w-full aspect-square bg-gray-100">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" strokeWidth={1.5} />
          </div>
        )}

        {/* Badge estoque */}
        <div className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${
          outOfStock ? 'bg-gray-500 text-white'
            : product.totalStock <= 10 ? 'bg-amber-400 text-white'
            : 'bg-emerald-500 text-white'
        }`}>
          {outOfStock ? 'Esgotado' : `${product.totalStock} un.`}
        </div>

        {/* Badge categoria */}
        {product.category && (
          <div className="absolute top-1.5 left-1.5 bg-white/90 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            {product.category}
          </div>
        )}
      </div>

      {/* Info + botão */}
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2">{product.name}</p>

        {variantCount > 0 && (
          <p className="text-[10px] text-gray-400 font-medium">
            {variantCount} variação{variantCount !== 1 ? 'ões' : ''}
          </p>
        )}

        <p className="text-sm font-bold text-[#5874f6]">
          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>

        <motion.button
          whileTap={{ scale: outOfStock ? 1 : 0.96 }}
          onClick={() => !outOfStock && onPick(product)}
          disabled={outOfStock}
          className={`w-full h-9 mt-auto rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
            outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#5874f6] text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20'
          }`}
        >
          {!outOfStock && <PackagePlus className="w-3.5 h-3.5" strokeWidth={2} />}
          {outOfStock ? 'Sem estoque' : 'Escolher'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Bloco principal ─────────────────────────────────────────────────────────

export const MarylandCatalogBlock: React.FC<BlockComponentProps> = ({ onAction }) => {
  const [localUser] = useState(() =>
    typeof window !== 'undefined' ? LocalDB.getUser() : null
  );

  const [products, setProducts]           = useState<MarylandCatalogProductDTO[]>([]);
  const [search, setSearch]               = useState('');
  const [isLoading, setIsLoading]         = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);
  const [adding, setAdding]               = useState(false);
  const [pickedProduct, setPickedProduct] = useState<MarylandCatalogProductDTO | null>(null);
  const [toast, setToast]                 = useState<ToastState>(null);

  const loadCatalog = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    getMarylandCatalogAction().then((res) => {
      if (res.success) setProducts(res.data);
      else setLoadError(res.error);
      setIsLoading(false);
    }).catch((err) => {
      console.error('[MarylandCatalogBlock]', err);
      setLoadError('Falha de conexão.');
      setIsLoading(false);
    });
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const filtered = products.filter((p) => {
    if (search === '') return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q) ||
      (p.reference ?? '').toLowerCase().includes(q)
    );
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirm = async (selected: SelectedVariant[]) => {
    if (!localUser?.id || !pickedProduct) return;
    setAdding(true);
    const items = selected.map((s) => ({
      productId:   pickedProduct.id,
      variantId:   s.variantId,
      variantName: s.variantName,
      quantity:    s.quantity,
    }));
    const res = await addToSellerStockAction({ sellerId: localUser.id, items });
    setAdding(false);
    setPickedProduct(null);
    if (res.success) {
      // Atualiza estoque local nos cards
      const totalAdded = selected.reduce((a, v) => a + v.quantity, 0);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === pickedProduct.id
            ? {
                ...p,
                totalStock: Math.max(0, p.totalStock - totalAdded),
                variants: p.variants.map((v) => {
                  const sel = selected.find((s) => s.variantId === v.id);
                  return sel ? { ...v, stock: Math.max(0, v.stock - sel.quantity) } : v;
                }),
              }
            : p
        )
      );
      const n = res.data.added;
      showToast('success', `${n} variação${n !== 1 ? 'ões' : ''} adicionada${n !== 1 ? 's' : ''} ao seu estoque!`);
    } else {
      showToast('error', res.error);
    }
  };

  const inStockCount = filtered.filter((p) => p.totalStock > 0).length;

  return (
    <>
      <div className="w-full flex flex-col h-full overflow-hidden bg-[#f5f5f5]">

        {/* Cabeçalho fixo */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction?.('GO_BACK')}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#F5A5C2]/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-[#d4789a]" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800 leading-none">Estoque Maryland</h1>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {isLoading ? 'Carregando…' : `${inStockCount} de ${filtered.length} produto${filtered.length !== 1 ? 's' : ''} disponíveis`}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto, categoria ou código…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/20 focus:bg-white transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Grid de produtos */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4789a]" />
              <span className="text-sm font-semibold text-gray-400">Carregando produtos…</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <XCircle className="w-12 h-12 text-red-300" strokeWidth={1.5} />
              <p className="text-sm font-bold text-red-500">Erro ao carregar</p>
              <p className="text-xs text-gray-400 text-center px-6">{loadError}</p>
              <button onClick={loadCatalog} className="px-4 py-2 bg-[#5874f6] text-white text-xs font-semibold rounded-xl">
                Tentar novamente
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Package className="w-12 h-12 text-gray-200" strokeWidth={1.5} />
              <p className="text-sm font-bold text-gray-400">
                {search ? 'Nenhum produto encontrado.' : 'Catálogo vazio no momento.'}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-2.5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onPick={setPickedProduct} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de seleção de variações */}
      <AnimatePresence>
        {pickedProduct && (
          <VariantModal
            product={pickedProduct}
            onConfirm={handleConfirm}
            onClose={() => setPickedProduct(null)}
            isLoading={adding}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <FeedbackToast key="toast" toast={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
};

'use client';

/**
 * Loja pública da vendedora autorizada.
 *
 * Layout IDÊNTICO ao dashboard principal do site:
 *  - Header azul com menu hamburger (mesmo visual do StoreHeader)
 *  - Fundo rosa / branco da loja
 *  - Barra de busca + cards de produtos (mesmo estilo do ProductGridBlock)
 *  - Banner da vendedora no topo
 *
 * Diferenças:
 *  - Produtos = somente o que a vendedora tem em estoque
 *  - Qualquer ação (clicar produto, botão de menu, etc.) → modal de cadastro
 *  - Após cadastro → usuário entra no site já associado à vendedora
 */

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, MapPin, BadgeCheck, Package,
  ShoppingBag, Heart, X, ExternalLink, ChevronRight,
  Home, History, CreditCard, Star, Bell, ShoppingCart,
  User, LogIn,
} from 'lucide-react';
import { PublicStoreData, PublicProductDTO } from '@/app/actions/seller-store-actions';
import { formatCurrencyBRL } from '@/lib/utils/currency';

// ─── Tipos de menu ────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: 'home',     label: 'Início',        icon: Home       },
  { id: 'history',  label: 'Histórico',     icon: History    },
  { id: 'payment',  label: 'Pagamentos',    icon: CreditCard },
  { id: 'best',     label: 'Mais Vendidos', icon: Star       },
  { id: 'alerts',   label: 'Avisos',        icon: Bell       },
  { id: 'cart',     label: 'Compras',       icon: ShoppingCart },
  { id: 'account',  label: 'Minha conta',   icon: User       },
  { id: 'fav',      label: 'Favoritos',     icon: Heart      },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function inferFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function groupByProduct(products: PublicProductDTO[]) {
  const map: Record<string, { name: string; imageUrl: string | null; price: number; category: string | null; totalQty: number }> = {};
  for (const p of products) {
    if (!map[p.productId]) {
      map[p.productId] = { name: p.productName, imageUrl: p.imageUrl, price: p.price, category: p.category, totalQty: 0 };
    }
    map[p.productId].totalQty += p.quantity;
  }
  return Object.entries(map).map(([id, g]) => ({ id, ...g }));
}

// ─── Componentes internos ─────────────────────────────────────────────────────

/** Gate modal — aparece quando o usuário clica em qualquer coisa que exija conta */
function GateModal({ sellerSlug, onClose }: { sellerSlug: string; onClose: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-300 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl pb-safe-bottom p-6 flex flex-col gap-4"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-2 mb-2" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#5874f6]/10 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-[#5874f6]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900">Acesse para continuar</h2>
            <p className="text-xs text-gray-400 font-medium">Crie sua conta gratuita para comprar</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/?seller=${sellerSlug}`)}
            className="w-full h-12 rounded-2xl bg-[#5874f6] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <User className="w-4 h-4" />
            Criar minha conta gratuita
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/login?seller=${sellerSlug}`)}
            className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Já tenho conta — Entrar
          </motion.button>

          <button onClick={onClose} className="text-xs text-gray-400 font-medium text-center py-1">
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Menu lateral (mesmo popup do site real, mas com interceptor) */
function PublicMenuPopup({ isOpen, onClose, onProtectedClick }: {
  isOpen: boolean;
  onClose: () => void;
  onProtectedClick: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-200"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Cabeçalho do menu */}
            <div className="bg-[#5874f6] px-5 pt-12 pb-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold text-sm">Bem-vindo!</p>
              <p className="text-white/70 text-xs font-medium">Faça login para acessar tudo</p>
            </div>

            {/* Itens */}
            <div className="flex-1 py-3">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onClose(); onProtectedClick(); }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                );
              })}
            </div>

            {/* Rodapé */}
            <div className="border-t border-gray-100 p-5 flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-medium text-center mb-1">Ainda não tem conta?</p>
              <button
                onClick={() => { onClose(); onProtectedClick(); }}
                className="w-full h-10 rounded-xl bg-[#5874f6] text-white font-bold text-sm"
              >
                Criar conta gratuita
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Card de produto — mesmo estilo do ProductGridBlock */
function PublicProductCard({ product, onGate }: { product: { id: string; name: string; imageUrl: string | null; price: number; category: string | null; totalQty: number }; onGate: () => void }) {
  return (
    <div
      onClick={onGate}
      className="border border-gray-200 rounded-md overflow-hidden bg-white relative flex flex-col shadow-sm shrink-0 cursor-pointer active:scale-[0.98] transition-transform duration-200"
      style={{ width: '96px', minWidth: '96px' }}
    >
      <div className="text-center py-[2px] text-[7px] leading-none uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50">
        {product.category ?? 'Novo'}
      </div>

      <div className="relative aspect-3/4 bg-gray-100 group overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-200" />
          </div>
        )}
        {/* Coração decorativo */}
        <button
          onClick={(e) => { e.stopPropagation(); onGate(); }}
          className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1"
        >
          <Heart className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      <div className="p-1.5 flex flex-col justify-between flex-1 border-t border-gray-100">
        <p className="font-medium text-gray-800 text-[10px] line-clamp-2 leading-tight h-7 mb-0.5">
          {product.name}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <p className="font-black text-gray-900 text-[11px] leading-none truncate pr-1">
            {formatCurrencyBRL(product.price)}
          </p>
          {product.totalQty <= 0 && (
            <div className="bg-orange-500 rounded-[2px] px-1.5 py-[2px] shrink-0 shadow-sm">
              <span className="text-white text-[7px] font-bold uppercase leading-none block tracking-wider">
                Vendido
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PublicSellerDashboard({ storeData, sellerSlug }: { storeData: PublicStoreData; sellerSlug: string }) {
  const { seller, products } = storeData;
  const firstName = inferFirstName(seller.name);

  const [search, setSearch]       = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showGate, setShowGate]   = useState(false);

  // URL sempre do cliente — aponta para o dashboard real com ?seller=
  const [storeUrl, setStoreUrl]   = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStoreUrl(`${window.location.origin}/dashboard?seller=${sellerSlug}`);
      localStorage.setItem('md_seller_ref', sellerSlug);
    }
  }, [sellerSlug]);

  const grouped = useMemo(() => groupByProduct(products), [products]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q)
    );
  }, [grouped, search]);

  const openGate = () => setShowGate(true);

  return (
    <main className="w-full min-h-dvh bg-gray-900 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden relative">

      {/* Envoltura estilo "celular" em desktop */}
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-white
        lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]
        lg:rounded-[2.5rem] lg:border-8 lg:border-gray-800 lg:shadow-2xl lg:mx-auto">

        {/* ── Header idêntico ao site real ── */}
        <div
          className="shrink-0 z-60 flex flex-col gap-2 px-4 py-2.5 pb-3 shadow-md transition-colors duration-300"
          style={{ backgroundColor: '#5874f6', color: '#ffffff' }}
        >
          <div className="flex items-center justify-between gap-2 pt-safe-top">
            {/* Hamburger menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-90 shrink-0"
            >
              <Menu size={22} className="text-white" />
            </button>

            {/* Logo + nome da vendedora */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <div className="flex items-center gap-1">
                <span className="font-black text-white text-base tracking-wide">MARYLAND</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <BadgeCheck className="w-3 h-3 text-white/90" />
                <span className="text-white/90 text-[10px] font-bold">{firstName}</span>
              </div>
            </div>

            {/* Botão entrar */}
            <button
              onClick={openGate}
              className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-90 shrink-0"
            >
              <LogIn size={20} className="text-white" />
            </button>
          </div>

          {/* Endereço fictício */}
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-white/60 shrink-0" />
            <span className="text-white/70 text-[11px] font-medium truncate">
              Loja de {seller.name} — Vendedora Autorizada
            </span>
          </div>

          {/* Barra de busca */}
          <div className="relative mt-0.5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto…"
              className="w-full bg-white/20 placeholder-white/50 text-white text-[12px] font-medium rounded-full pl-8 pr-4 py-1.5 outline-none focus:bg-white/30 transition-all"
            />
          </div>
        </div>

        {/* ── Conteúdo scrollável ── */}
        <div className="flex-1 overflow-y-auto bg-[#fdf0f5]">

          {/* Banner da vendedora */}
          <div className="w-full bg-[#F5A5C2] relative overflow-hidden">
            {/* Fundo decorativo */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute text-white font-black text-4xl whitespace-nowrap" style={{ top: `${i * 30 - 10}%`, left: `${(i % 2) * 40 - 5}%`, transform: 'rotate(-15deg)' }}>
                  MARYLAND
                </div>
              ))}
            </div>

            <div className="relative px-4 py-4 flex items-center gap-3">
              {/* Foto */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white/30">
                  {seller.profilePictureUrl ? (
                    <Image src={seller.profilePictureUrl} alt={seller.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                </div>
                {/* Badge verificado */}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#5874f6] rounded-full flex items-center justify-center border-2 border-white shadow">
                  <BadgeCheck className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-white text-base leading-tight truncate">
                    {seller.name}
                  </h1>
                </div>
                <p className="text-white/80 text-[11px] font-semibold">Vendedora Autorizada Maryland</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/70 text-[10px] font-medium">Ativa · {filtered.length} produto{filtered.length !== 1 ? 's' : ''} disponíveis</span>
                </div>
              </div>

              {/* Botão compartilhar loja */}
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: `Loja de ${firstName}`, url: storeUrl }).catch(() => {});
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(storeUrl);
                  }
                }}
                className="shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Compartilhar loja"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* ── Produtos ── */}
          <div className="px-4 pt-4 pb-20">

            {/* Título seção */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm tracking-tight text-gray-800">
                Produtos disponíveis
              </h3>
              <span className="text-[10px] font-medium text-gray-400">
                {filtered.length} item{filtered.length !== 1 ? 'ns' : ''}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Package className="w-10 h-10 text-gray-200" strokeWidth={1.5} />
                <p className="text-xs font-bold text-gray-400 text-center">
                  {search ? 'Nenhum produto encontrado.' : 'Nenhum produto disponível no momento.'}
                </p>
              </div>
            ) : (
              /* Mesmo layout horizontal do ProductGridBlock */
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {filtered.map((p) => (
                  <PublicProductCard key={p.id} product={p} onGate={openGate} />
                ))}
              </div>
            )}

            {/* CTA de cadastro */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5874f6]/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-[#5874f6]" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 leading-tight">Quer comprar?</p>
                  <p className="text-[11px] text-gray-400 font-medium">Crie sua conta gratuita e entre no ecossistema Maryland</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={openGate}
                className="w-full h-11 rounded-xl bg-[#5874f6] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Criar conta gratuita
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Footer fixo (mesmo do site real) ── */}
        <div className="shrink-0 border-t border-gray-100 bg-white py-2 px-4 flex items-center justify-between">
          <button onClick={openGate} className="flex flex-col items-center gap-0.5 text-[#5874f6]">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Início</span>
          </button>
          <button onClick={openGate} className="flex flex-col items-center gap-0.5 text-gray-400">
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-bold">Buscar</span>
          </button>
          <button onClick={openGate} className="flex flex-col items-center gap-0.5 text-gray-400">
            <Heart className="w-5 h-5" />
            <span className="text-[9px] font-bold">Favoritos</span>
          </button>
          <button onClick={openGate} className="flex flex-col items-center gap-0.5 text-gray-400">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[9px] font-bold">Carrinho</span>
          </button>
          <button onClick={openGate} className="flex flex-col items-center gap-0.5 text-gray-400">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold">Conta</span>
          </button>
        </div>
      </div>

      {/* ── Modais ── */}
      <PublicMenuPopup
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onProtectedClick={openGate}
      />

      <AnimatePresence>
        {showGate && (
          <GateModal key="gate" sellerSlug={sellerSlug} onClose={() => setShowGate(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Package, BadgeCheck, Search,
  Share2, Copy, CheckCircle2, ExternalLink,
  Tag,
} from 'lucide-react';
import type { PublicStoreData, PublicProductDTO } from '@/app/actions/seller-store-actions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupProducts(products: PublicProductDTO[]) {
  const map: Record<string, { name: string; imageUrl: string | null; category: string | null; price: number; variants: PublicProductDTO[] }> = {};
  for (const p of products) {
    if (!map[p.productId]) {
      map[p.productId] = { name: p.productName, imageUrl: p.imageUrl, category: p.category, price: p.price, variants: [] };
    }
    map[p.productId].variants.push(p);
  }
  return Object.entries(map).map(([productId, g]) => ({ productId, ...g }));
}

function inferFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

// ─── Badge de variação ────────────────────────────────────────────────────────

function VariantBadges({ variantName }: { variantName: string }) {
  if (!variantName) return null;
  const parts = variantName.split(' · ').filter(Boolean);
  const colors = ['bg-pink-50 text-pink-700', 'bg-blue-50 text-blue-700', 'bg-gray-100 text-gray-600'];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {parts.map((p, i) => (
        <span key={i} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${colors[i] ?? colors[2]}`}>
          {p}
        </span>
      ))}
    </div>
  );
}

// ─── Card de produto ──────────────────────────────────────────────────────────

function ProductCard({
  productId, name, imageUrl, category, price, variants, sellerSlug, onBuy,
}: {
  productId: string; name: string; imageUrl: string | null;
  category: string | null; price: number; variants: PublicProductDTO[];
  sellerSlug: string;
  onBuy: (variant: PublicProductDTO) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalQty = variants.reduce((a, v) => a + v.quantity, 0);
  const hasVariants = variants.some((v) => v.variantName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Imagem */}
      <div className="relative w-full aspect-square bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-200" strokeWidth={1.5} />
          </div>
        )}
        {category && (
          <div className="absolute top-2 left-2 bg-white/90 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {category}
          </div>
        )}
        <div className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
          totalQty === 0 ? 'bg-gray-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {totalQty === 0 ? 'Esgotado' : `${totalQty} disp.`}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-[12px] font-bold text-gray-800 leading-tight line-clamp-2">{name}</p>
        <p className="text-base font-bold text-[#5874f6]">
          R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>

        {hasVariants ? (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] text-[#5874f6] font-semibold text-left"
            >
              {expanded ? '▲ Esconder variações' : `▼ Ver ${variants.length} variação${variants.length !== 1 ? 'ões' : ''}`}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-1.5"
                >
                  {variants.map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <VariantBadges variantName={v.variantName} />
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{v.quantity} disponíveis</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={v.quantity === 0}
                        onClick={() => onBuy(v)}
                        className="px-3 py-1.5 rounded-xl bg-[#5874f6] text-white text-[10px] font-bold disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        Quero este
                      </motion.button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onBuy(variants[0])}
            disabled={totalQty === 0}
            className="w-full h-9 rounded-xl bg-[#5874f6] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {totalQty === 0 ? 'Esgotado' : 'Tenho interesse'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Modal "Tenho Interesse" ──────────────────────────────────────────────────

function InterestModal({
  variant, sellerSlug, onClose,
}: {
  variant: PublicProductDTO; sellerSlug: string; onClose: () => void;
}) {
  const router = useRouter();

  const handleRegister = () => {
    router.push(`/?seller=${sellerSlug}&interest=${variant.id}`);
  };

  const handleLogin = () => {
    router.push(`/login?seller=${sellerSlug}&interest=${variant.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 flex items-end justify-center p-4 pb-8"
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          {variant.imageUrl && (
            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
              <Image src={variant.imageUrl} alt={variant.productName} fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-800">{variant.productName}</p>
            {variant.variantName && <VariantBadges variantName={variant.variantName} />}
            <p className="text-sm font-bold text-[#5874f6] mt-0.5">
              R$ {variant.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100" />

        <p className="text-sm font-medium text-gray-600 text-center">
          Para finalizar seu pedido, faça login ou crie sua conta Maryland gratuitamente.
        </p>

        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRegister}
            className="w-full h-12 rounded-2xl bg-[#5874f6] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Criar minha conta
          </motion.button>
          <button
            onClick={handleLogin}
            className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm"
          >
            Já tenho conta — Entrar
          </button>
          <button onClick={onClose} className="text-xs text-gray-400 font-medium text-center mt-1">
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

export function PublicStorefront({
  storeData, sellerSlug,
}: {
  storeData: PublicStoreData;
  sellerSlug: string;
}) {
  const { seller, products } = storeData;
  const [search, setSearch]         = useState('');
  const [copied, setCopied]         = useState(false);
  const [interested, setInterested] = useState<PublicProductDTO | null>(null);

  // URL sempre calculada do lado do cliente para garantir o domínio correto
  // (Vercel, domínio custom, localhost — funciona em qualquer ambiente)
  const [storeUrl, setStoreUrl] = useState(seller.storeUrl);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStoreUrl(`${window.location.origin}/loja/${sellerSlug}`);
    }
  }, [sellerSlug]);

  const firstName = inferFirstName(seller.name);
  const groups = groupProducts(products);

  const filtered = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.category ?? '').toLowerCase().includes(q);
  });

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Loja de ${firstName} — Maryland`,
          text:  `Veja os produtos da loja de ${firstName}!`,
          url:   storeUrl,
        });
        return;
      }
    } catch { /* cancelado */ }
    // Fallback: copiar
    const ok = await copyText(storeUrl);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  const handleCopy = async () => {
    const ok = await copyText(storeUrl);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  // Salva referência do vendedor em localStorage para uso no cadastro
  useEffect(() => {
    if (typeof window !== 'undefined' && sellerSlug) {
      localStorage.setItem('md_seller_ref', sellerSlug);
    }
  }, [sellerSlug]);

  return (
    <main className="min-h-dvh bg-[#f5f5f5]">
      {/* Header da loja */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">

          {/* Capa + avatar */}
          <div className="relative mb-4">
            <div className="w-full h-20 rounded-2xl bg-[#F5A5C2] flex items-center justify-center overflow-hidden">
              <p className="text-white font-black text-2xl tracking-wider opacity-30 select-none">
                MARYLAND
              </p>
            </div>
            <div className="absolute -bottom-5 left-4">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden relative">
                {seller.profilePictureUrl ? (
                  <Image src={seller.profilePictureUrl} alt={seller.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nome + badge */}
          <div className="mt-7 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-gray-900">{seller.name}</h1>
                <BadgeCheck className="w-4 h-4 text-[#5874f6]" strokeWidth={2} />
              </div>
              <p className="text-[11px] text-[#d4789a] font-semibold">Vendedora Autorizada Maryland</p>
            </div>

            {/* Botões de compartilhar */}
            <div className="flex gap-2 shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5874f6] text-white text-[11px] font-bold shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                  copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                title="Copiar link"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>

          {/* Link visível */}
          <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-[11px] text-gray-500 font-mono truncate flex-1 select-all">{storeUrl}</p>
          </div>

          {/* Busca */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto ou categoria…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/10 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Grid de produtos */}
      <div className="max-w-md mx-auto px-3 pt-4 pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-12 h-12 text-gray-200" strokeWidth={1.5} />
            <p className="text-sm font-bold text-gray-400">
              {search ? 'Nenhum produto encontrado.' : 'Nenhum produto disponível no momento.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-medium mb-3 px-1">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''} disponíveis
            </p>
            <motion.div
              className="grid grid-cols-2 gap-2.5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {filtered.map((g) => (
                <ProductCard
                  key={g.productId}
                  {...g}
                  sellerSlug={sellerSlug}
                  onBuy={setInterested}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4 flex items-center justify-center gap-1.5">
        <ShoppingBag className="w-4 h-4 text-[#5874f6]" />
        <p className="text-xs font-bold text-gray-600">
          Powered by <span className="text-[#5874f6]">Maryland</span>
        </p>
      </div>

      {/* Modal de interesse */}
      <AnimatePresence>
        {interested && (
          <InterestModal
            key="interest"
            variant={interested}
            sellerSlug={sellerSlug}
            onClose={() => setInterested(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

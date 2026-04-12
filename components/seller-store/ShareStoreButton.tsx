'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, CheckCircle2, X, ExternalLink, QrCode, Loader2,
} from 'lucide-react';
import { getOrCreateSellerSlugAction } from '@/app/actions/seller-store-actions';
import { LocalDB } from '@/lib/local-db';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Constrói a URL da loja sempre usando a origem atual do browser — funciona em
 *  qualquer ambiente: localhost, Vercel preview, domínio custom, etc. */
function buildStoreUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/loja/${slug}`;
  }
  return `/loja/${slug}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // API moderna (HTTPS ou localhost)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para HTTP ou browsers antigos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ShareStoreButton() {
  const [isOpen, setIsOpen]     = useState(false);
  const [slug, setSlug]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState('');

  // URL construída sempre do lado do cliente para garantir o domínio correto
  const storeUrl = slug ? buildStoreUrl(slug) : '';

  const open = useCallback(async () => {
    const user = LocalDB.getUser();
    if (!user?.id) return;
    setIsOpen(true);
    setError('');
    if (slug) return;   // slug já carregado — não busca de novo
    setLoading(true);
    const res = await getOrCreateSellerSlugAction(user.id);
    if (res.success) {
      setSlug(res.data.sellerSlug);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [slug]);

  const handleCopy = useCallback(async () => {
    if (!storeUrl) return;
    const ok = await copyToClipboard(storeUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [storeUrl]);

  const handleShare = useCallback(async () => {
    if (!storeUrl) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Minha Loja Maryland',
          text:  'Veja os produtos que tenho disponíveis! 🛍️',
          url:   storeUrl,
        });
        return;
      }
    } catch { /* usuário cancelou */ }
    // Fallback: copiar
    handleCopy();
  }, [storeUrl, handleCopy]);

  const handleWhatsApp = useCallback(() => {
    if (!storeUrl) return;
    const msg = `Olá! Veja os produtos disponíveis na minha loja Maryland 🛍️\n${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }, [storeUrl]);

  return (
    <>
      {/* Botão trigger */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={open}
        className="w-full h-12 px-4 bg-linear-to-r from-[#5874f6] to-[#7c3aed] text-white rounded-xl shadow-sm font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Share2 className="w-4 h-4" />
        <span>Compartilhar Minha Loja</span>
      </motion.button>

      {/* Modal bottom-sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex items-end justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl p-5 pb-10 flex flex-col gap-4"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-1 mb-1" />

              {/* Cabeçalho */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Minha Loja Maryland</h2>
                  <p className="text-xs text-gray-400 font-medium">Compartilhe com seus clientes</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Conteúdo */}
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#5874f6]" />
                  <span className="text-sm text-gray-400">Gerando seu link…</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                  <button
                    onClick={() => { setError(''); setLoading(false); open(); }}
                    className="mt-2 text-xs text-[#5874f6] font-semibold underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : storeUrl ? (
                <>
                  {/* Box da URL */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5">
                    <QrCode className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-600 font-mono truncate flex-1 select-all">{storeUrl}</p>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopy}
                      className="shrink-0 p-1"
                      title="Copiar link"
                    >
                      {copied
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
                    </motion.button>
                  </div>

                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-600 font-semibold text-center -mt-2"
                    >
                      ✓ Link copiado!
                    </motion.p>
                  )}

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    {/* WhatsApp */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWhatsApp}
                      className="w-full h-12 rounded-2xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Enviar pelo WhatsApp
                    </motion.button>

                    {/* Share API / fallback copiar */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleShare}
                      className="w-full h-12 rounded-2xl bg-linear-to-r from-[#5874f6] to-[#7c3aed] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar via…
                    </motion.button>

                    {/* Ver loja */}
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver como meus clientes veem
                    </a>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

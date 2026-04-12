'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Plus, Landmark,
  CreditCard, Wifi, Eye, EyeOff,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

interface PaymentCardInformation {
  id: string;
  institutionName: string;
  accountType: string;
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  balance: string;
  brandColor: string;
}

// ─── Máscara do número do cartão ─────────────────────────────────────────────
function maskCardNumber(raw: string): string {
  // Mantém apenas os 4 últimos dígitos visíveis: •••• •••• •••• 4885
  const digits = raw.replace(/\D/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

// ─── Cartão visual ────────────────────────────────────────────────────────────
function BankCardVisual({ card }: { card: PaymentCardInformation }) {
  const [showNumber, setShowNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  return (
    <div
      className="relative w-full rounded-2xl p-5 overflow-hidden shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${card.brandColor}ee 0%, ${card.brandColor}88 100%)`,
        aspectRatio: '1.586 / 1',
        maxHeight: 210,
      }}
    >
      {/* Reflexos decorativos */}
      <div className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Topo */}
        <div className="flex items-center justify-between">
          <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">
            {card.institutionName}
          </span>
          <Wifi className="w-4 h-4 text-white/80 rotate-90" />
        </div>

        {/* Chip */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-yellow-300/80 rounded-md flex items-center justify-center">
            <div className="w-5 h-4 border border-yellow-500/60 rounded-sm grid grid-cols-3 gap-px p-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
              ))}
            </div>
          </div>
          <CreditCard className="w-4 h-4 text-white/60" />
        </div>

        {/* Número do cartão com toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white font-mono text-sm tracking-widest flex-1">
            {showNumber
              ? card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()
              : maskCardNumber(card.cardNumber)}
          </span>
          <button
            onClick={() => setShowNumber((v) => !v)}
            className="text-white/70 hover:text-white transition-colors"
            aria-label={showNumber ? 'Ocultar número' : 'Mostrar número'}
          >
            {showNumber
              ? <EyeOff className="w-3.5 h-3.5" />
              : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Rodapé */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-white/60 text-[10px] uppercase tracking-wider">Titular</span>
            <span className="text-white text-xs font-medium truncate max-w-[130px]">
              {card.cardholderName}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white/60 text-[10px] uppercase tracking-wider">Validade</span>
            <span className="text-white text-xs font-medium">{card.expirationDate}</span>
          </div>
          {/* CVV com toggle */}
          <div className="flex flex-col items-end">
            <span className="text-white/60 text-[10px] uppercase tracking-wider">CVV</span>
            <div className="flex items-center gap-1">
              <span className="text-white text-xs font-medium">
                {showCvv ? card.securityCode : '•••'}
              </span>
              <button
                onClick={() => setShowCvv((v) => !v)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label={showCvv ? 'Ocultar CVV' : 'Mostrar CVV'}
              >
                {showCvv
                  ? <EyeOff className="w-3 h-3" />
                  : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Linha com olho para dados sensíveis ──────────────────────────────────────
interface SecretRowProps {
  label: string;
  visibleValue: string;
  maskedValue: string;
}

function SecretRow({ label, visibleValue, maskedValue }: SecretRowProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 font-mono tracking-wider">
          {visible ? visibleValue : maskedValue}
        </span>
        <button
          onClick={() => setVisible((v) => !v)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label={visible ? 'Ocultar' : 'Mostrar'}
        >
          {visible
            ? <EyeOff className="w-4 h-4" />
            : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Linha simples (sem segredo) ──────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
  );
}

// ─── Bloco principal ──────────────────────────────────────────────────────────
export const PaymentMethodsBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { style } = config;

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // Controla visibilidade global do saldo na lista
  const [balanceVisible, setBalanceVisible] = useState(false);

  const paymentCards: PaymentCardInformation[] = [
    {
      id: 'card-1',
      institutionName: 'Mercado Pago',
      accountType: 'Débito',
      cardholderName: 'Bruno A Rosa Pereira',
      cardNumber: '5874487758454885',
      expirationDate: '09/28',
      securityCode: '147',
      balance: 'R$ 7,68',
      brandColor: '#5874f6',
    },
  ];

  const selectedCard = paymentCards.find((c) => c.id === selectedCardId) ?? null;

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28"
      style={{
        backgroundColor: style.bgColor ?? '#ffffff',
        maxHeight: 'calc(100dvh - 4rem)',
      }}
    >
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5 gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-base font-semibold text-gray-700">Formas de Pagamento</h1>
      </div>

      <AnimatePresence mode="wait">

        {/* ══ LISTA ══ */}
        {!selectedCardId && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="px-5 flex flex-col gap-4"
          >
            {/* Label + toggle global de saldo */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Contas cadastradas
              </span>
              <button
                onClick={() => setBalanceVisible((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                {balanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {balanceVisible ? 'Ocultar saldos' : 'Ver saldos'}
              </button>
            </div>

            {paymentCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all text-left shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.brandColor + '22' }}
                >
                  <Landmark className="w-5 h-5" style={{ color: card.brandColor }} strokeWidth={1.5} />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-700 truncate">
                    {card.institutionName}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {card.accountType} · ••••&nbsp;{card.cardNumber.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-gray-600 font-mono">
                    {balanceVisible ? card.balance : '••••'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}

            <button className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-gray-200 hover:border-[#5874f6]/50 hover:bg-[#5874f6]/5 active:scale-[0.98] transition-all group mt-2">
              <div className="w-10 h-10 rounded-xl border border-gray-200 group-hover:border-[#5874f6]/40 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#5874f6] transition-colors" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#5874f6] transition-colors">
                Adicionar forma de pagamento
              </span>
            </button>
          </motion.div>
        )}

        {/* ══ DETALHE ══ */}
        {selectedCardId && selectedCard && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22 }}
            className="px-5 flex flex-col gap-5"
          >
            <button
              onClick={() => setSelectedCardId(null)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors -ml-1 self-start"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>

            {/* Cartão visual com toggles embutidos */}
            <BankCardVisual card={selectedCard} />

            {/* Dados detalhados */}
            <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-4 border border-gray-100">

              <DetailRow label="Nome impresso" value={selectedCard.cardholderName} />

              <div className="w-full h-px bg-gray-200" />

              <div className="grid grid-cols-2 gap-4">
                {/* Número completo ocultável */}
                <SecretRow
                  label="Número do cartão"
                  visibleValue={selectedCard.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                  maskedValue={`•••• •••• •••• ${selectedCard.cardNumber.slice(-4)}`}
                />
                {/* CVV ocultável */}
                <SecretRow
                  label="CVV"
                  visibleValue={selectedCard.securityCode}
                  maskedValue="•••"
                />
              </div>

              <div className="w-full h-px bg-gray-200" />

              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Validade" value={selectedCard.expirationDate} />
                <DetailRow label="Tipo" value={selectedCard.accountType} />
              </div>

              <div className="w-full h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <DetailRow label="Instituição financeira" value={selectedCard.institutionName} />
                {/* Saldo ocultável */}
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Saldo
                  </span>
                  <SecretRow
                    label=""
                    visibleValue={selectedCard.balance}
                    maskedValue="R$ ••••"
                  />
                </div>
              </div>

            </div>

            {/* Ações */}
            <div className="flex gap-3 pb-4">
              <button className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-400 text-sm font-semibold hover:bg-red-50 transition-colors">
                Remover
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-[#5874f6] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
                Editar
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

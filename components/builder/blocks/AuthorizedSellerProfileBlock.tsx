'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Briefcase,
  BadgeCheck, Camera, Pencil, X, Plus, Minus,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { SellerProfileBlockDataSchema } from '@/schemas/blocks/seller-profile-schema';
import { getUserProfileInformationAction, type UserProfileInformation } from '@/app/actions/seller-profile-actions';
import { LocalDB, inferNameGenderFromFullName } from '@/lib/local-db';

// ─── Font level store (mesma chave do UserProfileSettingsBlock) ───────────────
const FONT_LEVEL_KEY = 'profile_font_level';
const FONT_SCALES: Record<number, number> = {
  [-3]: 0.75, [-2]: 0.83, [-1]: 0.91,
  [0]: 1.0,
  [1]: 1.1, [2]: 1.2, [3]: 1.3,
};
const MIN_LEVEL = -3;
const MAX_LEVEL = 3;

function levelToPercent(level: number): string {
  return `${Math.round((FONT_SCALES[level] ?? 1) * 100)}%`;
}

type StoreListener = () => void;
const sellerFontListeners = new Set<StoreListener>();

function subscribeSellerFont(cb: StoreListener) {
  sellerFontListeners.add(cb);
  return () => { sellerFontListeners.delete(cb); };
}

function getSellerFontSnapshot(): number {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem(FONT_LEVEL_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= MIN_LEVEL && parsed <= MAX_LEVEL) return parsed;
  }
  return 1; // padrão: 110%
}

function setSellerFontStore(next: number) {
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, next));
  localStorage.setItem(FONT_LEVEL_KEY, String(clamped));
  sellerFontListeners.forEach((cb) => cb());
}

function useSellerFontLevel(): [number, (delta: number) => void] {
  const level = useSyncExternalStore(subscribeSellerFont, getSellerFontSnapshot, () => 0);
  return [level, (delta: number) => setSellerFontStore(level + delta)];
}

// ─── Detecta cliente (sem useEffect + setState) ───────────────────────────────
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ─── Botão flutuante arrastável (igual ao UserProfileSettingsBlock) ───────────
interface FloatingEditButtonProps {
  isEditMode: boolean;
  onToggleEdit: () => void;
  onDismiss: () => void;
  fontLevel: number;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
}

function FloatingEditButton({
  isEditMode, onToggleEdit, onDismiss,
  fontLevel, onFontIncrease, onFontDecrease,
}: FloatingEditButtonProps) {
  const isClient = useIsClient();
  const pointerDownPos = useRef({ x: 0, y: 0 });

  if (!isClient) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) onToggleEdit();
  };

  return createPortal(
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: 0, y: 0 }}
      style={{ position: 'fixed', bottom: 96, right: 20, zIndex: 9999, touchAction: 'none', cursor: 'grab' }}
      whileDrag={{ cursor: 'grabbing', scale: 1.08 }}
      className="select-none"
    >
      {/* Controles de fonte — aparecem apenas no modo edição */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            style={{ bottom: 'calc(100% + 10px)' }}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onPointerDownCapture={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
            onPointerUpCapture={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          >
            <motion.button
              onPointerDown={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onPointerUp={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onClick={onFontIncrease}
              disabled={fontLevel >= MAX_LEVEL}
              whileTap={{ scale: 0.88 }}
              className="w-10 h-10 rounded-full bg-[#5874f6] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-30 hover:bg-blue-600 transition-colors"
              aria-label="Aumentar fonte"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </motion.button>

            <div
              onPointerDown={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onPointerUp={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-0.5 shadow-sm min-w-[42px] flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-gray-600 tabular-nums">
                {levelToPercent(fontLevel)}
              </span>
            </div>

            <motion.button
              onPointerDown={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onPointerUp={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onClick={onFontDecrease}
              disabled={fontLevel <= MIN_LEVEL}
              whileTap={{ scale: 0.88 }}
              className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-lg shadow-gray-900/20 disabled:opacity-30 hover:bg-gray-600 transition-colors"
              aria-label="Diminuir fonte"
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Círculo principal */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 ${
          isEditMode
            ? 'bg-[#5874f6] shadow-blue-500/40 ring-4 ring-[#5874f6]/20'
            : 'bg-gray-800 shadow-gray-900/30'
        }`}
      >
        <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>

      {/* Tooltip */}
      <motion.div
        initial={false}
        animate={{ opacity: isEditMode ? 1 : 0, x: isEditMode ? 0 : 8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
      >
        Modo edição ativo
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900" />
      </motion.div>

      {/* "x" para fechar */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
        aria-label="Fechar botão de edição"
      >
        <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </button>
    </motion.div>,
    document.body,
  );
}

// ─── InfoRow (igual ao UserProfileSettingsBlock) ──────────────────────────────
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit: () => void;
  showEdit: boolean;
  addLabel?: string;
}

function InfoRow({ icon, label, value, onEdit, showEdit, addLabel }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-700 leading-snug mt-0.5 wrap-break-word whitespace-normal">
          {value || '—'}
        </span>
        {addLabel && !value && (
          <button className="text-[#5874f6] font-semibold text-xs mt-1 text-left hover:underline">
            {addLabel}
          </button>
        )}
      </div>
      <motion.div
        initial={false}
        animate={{
          opacity: showEdit ? 1 : 0,
          scale: showEdit ? 1 : 0.85,
          pointerEvents: showEdit ? 'auto' : 'none',
        }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="shrink-0"
      >
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-[#5874f6] border border-[#5874f6]/40 px-3 py-1 rounded-lg hover:bg-[#5874f6]/5 transition-colors whitespace-nowrap"
        >
          Editar
        </button>
      </motion.div>
    </div>
  );
}

// ─── Bloco principal ──────────────────────────────────────────────────────────
export const AuthorizedSellerProfileBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const validationResult = SellerProfileBlockDataSchema.safeParse(config.data);

  // isLoadingData começa true para não precisar de setState síncrono no effect
  const [userInformation, setUserInformation] = useState<UserProfileInformation | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(true);
  const [fontLevel, handleFontChange] = useSellerFontLevel();

  const fontScale = FONT_SCALES[fontLevel] ?? 1;

  useEffect(() => {
    async function fetchRealUserData() {
      const localSession = LocalDB.getUser();
      if (!localSession?.id) {
        setErrorMessage('Sessão não encontrada. Faça login novamente.');
        setIsLoadingData(false);
        return;
      }
      const response = await getUserProfileInformationAction(localSession.id);
      if (response.success && response.data) {
        setUserInformation(response.data);
      } else {
        setErrorMessage(response.error ?? 'Falha ao carregar dados do perfil.');
      }
      setIsLoadingData(false);
    }
    fetchRealUserData();
  }, []);

  if (!validationResult.success) {
    return (
      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
        [LEGO_ERR]: Configuração de bloco inválida.
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#F5A5C2] border-t-transparent rounded-full animate-spin" />
        <span className="mt-4 text-sm font-medium text-gray-500">Carregando informações...</span>
      </div>
    );
  }

  if (errorMessage || !userInformation) {
    return (
      <div className="w-full max-w-md mx-auto p-6 flex flex-col items-center text-center">
        <span className="text-red-500 font-semibold mb-2">Ops!</span>
        <span className="text-sm text-gray-500">{errorMessage}</span>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-[#5874f6] text-white rounded-xl font-semibold text-sm"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const firstName = userInformation.name.split(' ')[0] || 'Vendedor(a)';
  const gender = inferNameGenderFromFullName(userInformation.name);
  const sellerLabel = gender === 'feminino' ? 'Vendedora Autorizada' : 'Vendedor Autorizado';
  const coverImage =
    userInformation.backgroundImageUrl ||
    validationResult.data.coverImageUrl ||
    'https://placehold.co/600x200/F5A5C2/F5A5C2.png';
  const profileImage =
    userInformation.profilePictureUrl ||
    validationResult.data.defaultAvatarUrl ||
    'https://placehold.co/200x200/eeeeee/999999.png?text=Foto';

  const handleEditField = (field: string) => {
    const info = userInformation as unknown as Record<string, string>;
    onAction?.('EDIT_FIELD', { field, currentValue: info[field] ?? '' });
  };

  return (
    <>
      {/* ─── Conteúdo com scroll ─── */}
      <div
        className="w-full max-w-md mx-auto bg-white flex flex-col overflow-y-auto overscroll-contain overflow-x-hidden pb-32"
        style={{ maxHeight: 'calc(100dvh - 4rem)' }}
      >
        {/* Wrapper de zoom */}
        <div style={{ zoom: fontScale }}>

          {/* ── Capa rosa ── */}
          <div className="relative w-full h-36 bg-[#F5A5C2] shrink-0">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={coverImage}
                alt="Capa"
                fill
                sizes="100vw"
                className="object-cover opacity-80"
                priority
              />
            </div>

            {/* Trocar capa — só no modo edição */}
            {isEditMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onAction?.('CHANGE_COVER')}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 text-gray-800 px-3 py-1 text-xs font-semibold rounded-md shadow-md hover:bg-white transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Trocar capa
              </motion.button>
            )}

            {/* ── Avatar ── */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-10">
              <div className="relative">
                <Image
                  src={profileImage}
                  alt="Foto de perfil"
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
                {/* Badge verificado */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <BadgeCheck className="w-6 h-6 text-[#3b82f6]" fill="#3b82f6" color="white" strokeWidth={1.5} />
                </div>
                {/* Trocar foto — só no modo edição */}
                {isEditMode && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => onAction?.('CHANGE_AVATAR')}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5874f6] rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-600 transition-colors"
                    aria-label="Trocar foto"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* ── Badge "Vendedora Autorizada + nome" — menor ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-16 flex flex-col items-center gap-1"
          >
            <span className="text-[10px] font-semibold text-[#d4789a] uppercase tracking-wider">
              {sellerLabel}
            </span>
            <span className="bg-[#F5A5C2]/15 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg border border-[#F5A5C2]/40 shadow-sm">
              {firstName}
            </span>
            {/* Status ativo/ativa */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-[#50E3C2] rounded-full shadow-sm" />
              <span className="text-xs font-medium text-gray-500">
                {gender === 'feminino' ? 'Ativa' : 'Ativo'}
              </span>
            </div>
          </motion.div>

          {/* ── Informações Pessoais ── */}
          <div className="mt-6 px-5 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Informações Pessoais
            </h2>

            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Nome completo"
              value={userInformation.name}
              onEdit={() => handleEditField('name')}
              showEdit={isEditMode}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Gmail"
              value={userInformation.email}
              onEdit={() => handleEditField('email')}
              showEdit={isEditMode}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="WhatsApp"
              value={userInformation.whatsapp}
              onEdit={() => handleEditField('whatsapp')}
              showEdit={isEditMode}
              addLabel="+ Adicionar número"
            />
            <InfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="Endereço da loja"
              value={userInformation.address}
              onEdit={() => handleEditField('address')}
              showEdit={isEditMode}
              addLabel="+ Adicionar endereço"
            />
            <InfoRow
              icon={<Briefcase className="w-4 h-4" />}
              label={userInformation.documentType === 'CNPJ' ? 'CNPJ' : 'CPF'}
              value={userInformation.document}
              onEdit={() => handleEditField('document')}
              showEdit={isEditMode}
              addLabel="+ Adicionar CPF/CNPJ"
            />
          </div>

          <div className="w-full h-px bg-gray-100 my-7" />

          {/* ── Status da conta ── */}
          <div className="px-5 pb-10 flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Status da Conta
            </h2>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50">
              <BadgeCheck className="w-5 h-5 text-[#3b82f6] shrink-0" fill="#3b82f6" color="white" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">
                  {gender === 'feminino' ? 'Vendedora Verificada' : 'Vendedor Verificado'}
                </span>
                <span className="text-xs text-gray-400 font-medium">Conta autorizada pela Maryland Modas</span>
              </div>
            </div>
          </div>

        </div>{/* fim wrapper de zoom */}
      </div>

      {/* ─── Botão flutuante via Portal ─── */}
      {isFloatingVisible && (
        <FloatingEditButton
          isEditMode={isEditMode}
          onToggleEdit={() => setIsEditMode((v) => !v)}
          onDismiss={() => { setIsFloatingVisible(false); setIsEditMode(false); }}
          fontLevel={fontLevel}
          onFontIncrease={() => handleFontChange(1)}
          onFontDecrease={() => handleFontChange(-1)}
        />
      )}
    </>
  );
};

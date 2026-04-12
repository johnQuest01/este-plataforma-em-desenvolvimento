'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, User, Mail, Phone, MapPin, Briefcase,
  Eye, EyeOff, Pencil, X, Camera, Plus, Minus,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

// ─── Constantes de zoom de fonte ─────────────────────────────────────────────
const FONT_LEVEL_KEY = 'profile_font_level';
const FONT_SCALES: Record<number, number> = {
  [-3]: 0.75,
  [-2]: 0.83,
  [-1]: 0.91,
  [0]: 1.0,
  [1]: 1.1,
  [2]: 1.2,
  [3]: 1.3,
};
const MIN_LEVEL = -3;
const MAX_LEVEL = 3;

function levelToPercent(level: number): string {
  const scale = FONT_SCALES[level] ?? 1;
  return `${Math.round(scale * 100)}%`;
}

// ─── Hook: detecta se está no cliente ────────────────────────────────────────
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ─── Store de fontLevel via localStorage ─────────────────────────────────────
// Usar useSyncExternalStore evita setState dentro de useEffect (regra do linter).
type StoreListener = () => void;
const fontLevelListeners = new Set<StoreListener>();

function subscribeFontLevel(cb: StoreListener) {
  fontLevelListeners.add(cb);
  return () => { fontLevelListeners.delete(cb); };
}

function getFontLevelSnapshot(): number {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem(FONT_LEVEL_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= MIN_LEVEL && parsed <= MAX_LEVEL) return parsed;
  }
  return 1; // padrão: 110%
}

function setFontLevelStore(next: number) {
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, next));
  localStorage.setItem(FONT_LEVEL_KEY, String(clamped));
  fontLevelListeners.forEach((cb) => cb());
}

function useFontLevel(): [number, (delta: number) => void] {
  const level = useSyncExternalStore(subscribeFontLevel, getFontLevelSnapshot, () => 0);
  const handleChange = (delta: number) => setFontLevelStore(level + delta);
  return [level, handleChange];
}

// ─── Botão flutuante arrastável ───────────────────────────────────────────────
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
      style={{
        position: 'fixed',
        bottom: 96,
        right: 20,
        zIndex: 9999,
        touchAction: 'none',
        cursor: 'grab',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.08 }}
      className="select-none"
    >
      {/* ── Controles de tamanho de fonte – aparecem apenas no modo edição ── */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            style={{ bottom: 'calc(100% + 10px)' }}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            // Bloqueia TODOS os pointer events de chegarem ao motion.div pai (Framer Motion drag)
            onPointerDownCapture={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
            onPointerUpCapture={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          >
            {/* Botão aumentar (+) */}
            <motion.button
              onPointerDown={(e) => {
                // Para o evento nativo antes de chegar ao listener nativo do Framer Motion no motion.div pai.
                // e.stopPropagation() para apenas o evento sintético React — não basta aqui.
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onPointerUp={(e) => {
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onClick={onFontIncrease}
              disabled={fontLevel >= MAX_LEVEL}
              whileTap={{ scale: 0.88 }}
              className="w-10 h-10 rounded-full bg-[#5874f6] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-30 hover:bg-blue-600 transition-colors"
              aria-label="Aumentar fonte"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </motion.button>

            {/* Indicador de nível */}
            <div
              onPointerDown={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onPointerUp={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-0.5 shadow-sm min-w-[42px] flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-gray-600 tabular-nums">
                {levelToPercent(fontLevel)}
              </span>
            </div>

            {/* Botão diminuir (−) */}
            <motion.button
              onPointerDown={(e) => {
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onPointerUp={(e) => {
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
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

      {/* ── Círculo principal (clique vs arrasto) ── */}
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

      {/* ── Tooltip "Modo edição ativo" ── */}
      <motion.div
        initial={false}
        animate={{ opacity: isEditMode ? 1 : 0, x: isEditMode ? 0 : 8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
      >
        Modo edição ativo
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900" />
      </motion.div>

      {/* ── "x" para fechar o botão flutuante ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
        aria-label="Fechar botão de edição"
      >
        <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </button>
    </motion.div>,
    document.body,
  );
}

// ─── Bloco principal ─────────────────────────────────────────────────────────
export const UserProfileSettingsBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const { data, style } = config;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTwoFactorActive, setIsTwoFactorActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(true);
  const [fontLevel, handleFontChange] = useFontLevel();

  const fontScale = FONT_SCALES[fontLevel] ?? 1;
  const firstName = String(data.userName || 'Bruno').split(' ')[0];

  const handleEditField = (fieldName: string) => {
    if (onAction) onAction('EDIT_FIELD', { field: fieldName });
  };

  return (
    <>
      {/* ─── Conteúdo com scroll ─── */}
      <div
        className="w-full max-w-md mx-auto bg-white flex flex-col overflow-y-auto overscroll-contain overflow-x-hidden pb-32"
        style={{
          backgroundColor: style.bgColor,
          maxHeight: 'calc(100dvh - 4rem)',
        }}
      >
        {/* Wrapper de zoom — aplicado ao conteúdo, não ao scroll container */}
        <div style={{ zoom: fontScale }}>

          {/* ── Capa ── */}
          <div className="relative w-full h-40 bg-zinc-800 shrink-0">
            <Image
              src={String(data.backgroundImageUrl || 'https://placehold.co/600x300/27272a/27272a')}
              alt="Capa do perfil"
              fill
              className="object-cover opacity-50"
              sizes="100vw"
            />

            {isEditMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleEditField('backgroundImageUrl')}
                className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 text-gray-800 px-3 py-1 text-xs font-semibold rounded-md shadow-md hover:bg-white transition-colors z-10"
              >
                <Camera className="w-3.5 h-3.5" />
                Trocar capa
              </motion.button>
            )}

            {/* ── Avatar ── */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="relative">
                <Image
                  src={String(data.profilePictureUrl || 'https://placehold.co/200x200/eeeeee/555555?text=Foto')}
                  alt="Foto de perfil"
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
                {isEditMode && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleEditField('profilePictureUrl')}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5874f6] rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-600 transition-colors"
                    aria-label="Trocar foto de perfil"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* ── Badge nome ── */}
          <div className="mt-16 flex justify-center">
            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg border border-gray-200 shadow-sm">
              {firstName}
            </span>
          </div>

          {/* ── Informações Pessoais ── */}
          <div className="mt-6 px-5 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Informações Pessoais
            </h2>

            <InfoRow icon={<User className="w-4 h-4" />} label="Nome completo"
              value={String(data.fullName || 'Bruno Aurélio Rosa Pereira')}
              onEdit={() => handleEditField('fullName')} showEdit={isEditMode} />

            <InfoRow icon={<Mail className="w-4 h-4" />} label="Gmail"
              value={String(data.emailAddress || 'brunoacre07@gmail.com')}
              onEdit={() => handleEditField('emailAddress')} showEdit={isEditMode} />

            <InfoRow icon={<Phone className="w-4 h-4" />} label="WhatsApp"
              value={String(data.phoneNumber || '(11) 94747-2345')}
              onEdit={() => handleEditField('phoneNumber')} showEdit={isEditMode}
              addLabel="+ Adicionar número" />

            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Endereço"
              value={String(data.storeAddress || 'Rua das Flores, 42 · São Paulo · SP')}
              onEdit={() => handleEditField('storeAddress')} showEdit={isEditMode}
              addLabel="+ Adicionar endereço" />

            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="CPF / CNPJ"
              value={String(data.documentNumber || '45.151.522/6261-00')}
              onEdit={() => handleEditField('documentNumber')} showEdit={isEditMode}
              addLabel="+ Adicionar CPF/CNPJ" />
          </div>

          <div className="w-full h-px bg-gray-100 my-7" />

          {/* ── Login e Senhas ── */}
          <div className="px-5 flex flex-col gap-5 pb-10">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Login e Senhas
              </h2>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400">Login</span>
              <span className="text-sm font-medium text-gray-700">
                {String(data.emailAddress || 'brunoacre07@gmail.com')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400">Senha</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 tracking-widest">
                    {isPasswordVisible ? String(data.passwordHint || '••••••••') : '••••••••••'}
                  </span>
                  <button
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <motion.div
                initial={false}
                animate={{ opacity: isEditMode ? 1 : 0, pointerEvents: isEditMode ? 'auto' : 'none' }}
                transition={{ duration: 0.18 }}
              >
                <button
                  onClick={() => handleEditField('password')}
                  className="text-xs font-semibold text-[#5874f6] border border-[#5874f6]/40 px-3 py-1 rounded-lg hover:bg-[#5874f6]/5 transition-colors"
                >
                  Editar
                </button>
              </motion.div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-600">Autenticação em Duas Etapas</h3>
              <button
                onClick={() => setIsTwoFactorActive((v) => !v)}
                className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  isTwoFactorActive
                    ? 'bg-[#5874f6] text-white border-[#5874f6] hover:bg-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isTwoFactorActive ? '✓ Ativado' : 'Ativar'}
              </button>
              <p className="text-xs text-gray-400 leading-relaxed text-center px-2">
                Ao ativar, enviaremos um código via SMS e e-mail para confirmar qualquer alteração de senha.
              </p>
            </div>
          </div>

        </div>{/* fim do wrapper de zoom */}
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

// ─── InfoRow ─────────────────────────────────────────────────────────────────
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
          {value}
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

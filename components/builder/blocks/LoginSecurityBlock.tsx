'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, ShieldOff,
  CheckCircle2, AlertCircle, Loader2, Plus, Minus, X, ZoomIn, Power,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { LocalDB, inferNameGenderFromFullName } from '@/lib/local-db';
import {
  changePasswordAction,
  toggleTwoFactorAction,
  getSecurityStatusAction,
  type SecurityStatus,
} from '@/app/actions/security-actions';

// ─── Font level store (mesma chave das outras telas de perfil) ────────────────
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
const securityFontListeners = new Set<StoreListener>();

function subscribeSecurityFont(cb: StoreListener) {
  securityFontListeners.add(cb);
  return () => { securityFontListeners.delete(cb); };
}
function getSecurityFontSnapshot(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(FONT_LEVEL_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= MIN_LEVEL && parsed <= MAX_LEVEL) return parsed;
  }
  return 0;
}
function setSecurityFontStore(next: number) {
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, next));
  localStorage.setItem(FONT_LEVEL_KEY, String(clamped));
  securityFontListeners.forEach((cb) => cb());
}
function useSecurityFontLevel(): [number, (delta: number) => void] {
  const level = useSyncExternalStore(subscribeSecurityFont, getSecurityFontSnapshot, () => 0);
  return [level, (delta: number) => setSecurityFontStore(level + delta)];
}

// ─── Detecta cliente sem useEffect + setState ─────────────────────────────────
function useIsClient(): boolean {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

// ─── Botão flutuante de zoom (sem modo edição) ────────────────────────────────
interface FloatingZoomButtonProps {
  fontLevel: number;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
  onDismiss: () => void;
}

function FloatingZoomButton({ fontLevel, onFontIncrease, onFontDecrease, onDismiss }: FloatingZoomButtonProps) {
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });

  if (!isClient) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) setIsOpen((v) => !v);
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
      {/* Controles + e − — aparecem ao clicar o botão */}
      <AnimatePresence>
        {isOpen && (
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
            {/* Aumentar (+) */}
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

            {/* Indicador percentual */}
            <div
              onPointerDown={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onPointerUp={(e) => { e.nativeEvent.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-0.5 shadow-sm min-w-[42px] flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-gray-600 tabular-nums">
                {levelToPercent(fontLevel)}
              </span>
            </div>

            {/* Diminuir (−) */}
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

      {/* Círculo principal — clique abre/fecha os controles */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 ${
          isOpen
            ? 'bg-[#5874f6] shadow-blue-500/40 ring-4 ring-[#5874f6]/20'
            : 'bg-gray-800 shadow-gray-900/30'
        }`}
      >
        <ZoomIn className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>

      {/* Tooltip */}
      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
      >
        Tamanho do texto
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900" />
      </motion.div>

      {/* "x" para fechar o botão */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
        aria-label="Fechar"
      >
        <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </button>
    </motion.div>,
    document.body,
  );
}

// ─── Input de senha com olho ──────────────────────────────────────────────────
function SecureInput({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/20 focus:bg-white disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Feedback de operação ─────────────────────────────────────────────────────
type FeedbackState = { type: 'success' | 'error'; message: string } | null;

function FeedbackMessage({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;
  const ok = feedback.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
        ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
           : 'bg-red-50 border border-red-200 text-red-600'
      }`}
    >
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {feedback.message}
    </motion.div>
  );
}

// ─── Bloco principal ──────────────────────────────────────────────────────────
export const LoginSecurityBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { style } = config;

  const [localUser] = useState(() =>
    typeof window !== 'undefined' ? LocalDB.getUser() : null
  );

  const [securityData, setSecurityData] = useState<SecurityStatus | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isTogglingTwoFactor, setIsTogglingTwoFactor] = useState(false);
  const [twoFactorFeedback, setTwoFactorFeedback] = useState<FeedbackState>(null);

  const [isZoomButtonVisible, setIsZoomButtonVisible] = useState(true);
  const [fontLevel, handleFontChange] = useSecurityFontLevel();
  const fontScale = FONT_SCALES[fontLevel] ?? 1;

  useEffect(() => {
    async function load() {
      if (!localUser?.id) { setIsLoadingData(false); return; }
      const result = await getSecurityStatusAction(localUser.id);
      if (result.success && result.data) {
        setSecurityData(result.data);
        setTwoFactorEnabled(result.data.isTwoFactorEnabled);
      }
      setIsLoadingData(false);
    }
    load();
  }, [localUser?.id]);

  const gender   = localUser?.name ? inferNameGenderFromFullName(localUser.name) : 'masculino';
  const isSeller = localUser?.role === 'seller' || localUser?.isVendedor === true;
  const displayEmail = securityData?.email || localUser?.emailAddress || '—';
  const firstName = localUser?.name?.split(' ')[0] ?? 'Usuário';
  const accentColor = isSeller ? '#d4789a' : '#5874f6';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localUser?.id) return;
    setPasswordFeedback(null);
    setIsChangingPassword(true);
    const result = await changePasswordAction({ userId: localUser.id, currentPassword, newPassword, confirmPassword });
    if (result.success) {
      setPasswordFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      setPasswordFeedback({ type: 'error', message: result.error ?? 'Erro ao alterar.' });
    }
    setIsChangingPassword(false);
    setTimeout(() => setPasswordFeedback(null), 5000);
  };

  const handleToggleTwoFactor = async () => {
    if (!localUser?.id) return;
    setIsTogglingTwoFactor(true);
    setTwoFactorFeedback(null);
    const newState = !twoFactorEnabled;
    const result = await toggleTwoFactorAction({ userId: localUser.id, enabled: newState });
    if (result.success) {
      setTwoFactorEnabled(newState);
      setTwoFactorFeedback({ type: 'success', message: newState ? 'Ativada!' : 'Desativada.' });
    } else {
      setTwoFactorFeedback({ type: 'error', message: result.error ?? 'Erro.' });
    }
    setIsTogglingTwoFactor(false);
    setTimeout(() => setTwoFactorFeedback(null), 4000);
  };

  if (isLoadingData) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: accentColor }} />
        <span className="text-sm font-medium text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      {/* ─── Conteúdo com scroll e zoom ─── */}
      <div
        className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain overflow-x-hidden pb-28"
        style={{ backgroundColor: style.bgColor ?? '#ffffff', maxHeight: 'calc(100dvh - 4rem)' }}
      >
        <div style={{ zoom: fontScale }}>

          {/* ── Cabeçalho interno ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center pt-8 pb-6 px-5 gap-1"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor + '18' }}>
              <Lock className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.75} />
            </div>
            <h1 className="text-base font-semibold text-gray-700 mt-1">Login e Senhas</h1>
            <p className="text-xs font-medium text-gray-400 text-center">
              {isSeller
                ? `${gender === 'feminino' ? 'Vendedora' : 'Vendedor'} · ${firstName}`
                : firstName}
            </p>
          </motion.div>

          <div className="px-5 flex flex-col gap-8 pb-10">

            {/* ── Login atual ── */}
            <motion.section
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Login</h2>
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5 text-gray-400 shrink-0"><Mail className="w-4 h-4" /></div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-xs font-medium text-gray-400">E-mail de acesso</span>
                  <span className="text-sm font-medium text-gray-700 mt-0.5 wrap-break-word">{displayEmail}</span>
                  <span className="text-[11px] font-medium text-gray-400 mt-1">Usado para entrar na plataforma</span>
                </div>
              </div>
            </motion.section>

            <div className="w-full h-px bg-gray-100" />

            {/* ── Alterar Senha ── */}
            <motion.section
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Alterar Senha</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <SecureInput label="Senha atual" value={currentPassword} onChange={setCurrentPassword}
                  placeholder="Digite sua senha atual" disabled={isChangingPassword} />
                <SecureInput label="Nova senha" value={newPassword} onChange={setNewPassword}
                  placeholder="Mínimo 6 caracteres" disabled={isChangingPassword} />
                <SecureInput label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword}
                  placeholder="Repita a nova senha" disabled={isChangingPassword} />

                {/* Indicador de força */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = newPassword.length >= 12 ? 4 : newPassword.length >= 8 ? 3 : newPassword.length >= 6 ? 2 : 1;
                      return (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= strength
                            ? strength === 4 ? 'bg-emerald-500' : strength === 3 ? 'bg-yellow-400' : 'bg-red-400'
                            : 'bg-gray-100'
                        }`} />
                      );
                    })}
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                      {newPassword.length >= 12 ? 'Forte' : newPassword.length >= 8 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {passwordFeedback && <FeedbackMessage key="pwd" feedback={passwordFeedback} />}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {isChangingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Alterando...
                    </span>
                  ) : 'Alterar Senha'}
                </motion.button>
              </form>
            </motion.section>

            <div className="w-full h-px bg-gray-100" />

            {/* ── Autenticação em Duas Etapas ── */}
            <motion.section
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Autenticação em Duas Etapas
              </h2>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Texto + ícone */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${twoFactorEnabled ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                      {twoFactorEnabled
                        ? <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                        : <ShieldOff className="w-4 h-4 text-gray-500" strokeWidth={1.75} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-700">
                        {twoFactorEnabled ? 'Ativada' : 'Desativada'}
                      </span>
                      <span className="text-xs font-medium text-gray-400 leading-relaxed">
                        {twoFactorEnabled
                          ? 'Código enviado por SMS e e-mail para alterar senha.'
                          : 'Ative para proteger melhor sua conta.'}
                      </span>
                    </div>
                  </div>

                  {/* ── Alavanca idêntica ao AdminUserCard ── */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      onClick={handleToggleTwoFactor}
                      disabled={isTogglingTwoFactor}
                      aria-label={twoFactorEnabled ? 'Desativar 2FA' : 'Ativar 2FA'}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center px-1 shadow-inner disabled:opacity-60 ${
                        twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      {/* Bolinha — usa ml-auto / ml-0 igual ao AdminUserCard */}
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                        className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center ${
                          twoFactorEnabled ? 'ml-auto' : 'ml-0'
                        }`}
                      >
                        <Power
                          size={12}
                          strokeWidth={3}
                          className={twoFactorEnabled ? 'text-emerald-500' : 'text-gray-400'}
                        />
                      </motion.div>
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      twoFactorEnabled ? 'text-emerald-500' : 'text-gray-400'
                    }`}>
                      {twoFactorEnabled ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {twoFactorFeedback && <FeedbackMessage key="2fa" feedback={twoFactorFeedback} />}
                </AnimatePresence>
              </div>

              <p className="mt-3 text-[11px] text-gray-400 text-center leading-relaxed px-2">
                Com a autenticação ativa, qualquer alteração de senha exigirá um código enviado ao seu e-mail e celular.
              </p>
            </motion.section>

            <div className="w-full h-px bg-gray-100" />

            {/* ── Tipo de Conta ── */}
            <motion.section
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tipo de Conta</h2>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accentColor + '18' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700">
                    {isSeller
                      ? (gender === 'feminino' ? 'Vendedora Autorizada' : 'Vendedor Autorizado')
                      : 'Conta de Comprador'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {isSeller ? 'Acesso completo à plataforma Maryland' : 'Acesso padrão à loja'}
                  </span>
                </div>
              </div>
            </motion.section>

          </div>
        </div>{/* fim wrapper de zoom */}
      </div>

      {/* ─── Botão flutuante de zoom via Portal ─── */}
      {isZoomButtonVisible && (
        <FloatingZoomButton
          fontLevel={fontLevel}
          onFontIncrease={() => handleFontChange(1)}
          onFontDecrease={() => handleFontChange(-1)}
          onDismiss={() => setIsZoomButtonVisible(false)}
        />
      )}
    </>
  );
};

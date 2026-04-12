'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Lock, User, Mail, Phone, MapPin, Briefcase,
  Eye, EyeOff, Pencil, X, Camera,
} from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

// ─── Botão flutuante arrastável ─────────────────────────────────────────────
// Renderizado via Portal para ficar no document.body, completamente fora de
// qualquer container com overflow. Isso garante que position:fixed funcione
// corretamente e o click seja registrado onde o botão está visualmente.
interface FloatingEditButtonProps {
  isEditMode: boolean;
  onToggleEdit: () => void;
  onDismiss: () => void;
}

// Retorna true apenas no cliente (false no SSR) sem useState+useEffect
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function FloatingEditButton({ isEditMode, onToggleEdit, onDismiss }: FloatingEditButtonProps) {
  const isClient = useIsClient();

  // Grava a posição do pointer no início do toque/clique
  const pointerDownPos = useRef({ x: 0, y: 0 });

  if (!isClient) return null;

  // Distância percorrida entre pointerdown e pointerup.
  // Se menor que 8 px → era um clique; se maior → era um arrasto.
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) onToggleEdit();
  };

  return createPortal(
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      // Posição inicial — canto inferior direito acima do footer
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
      whileTap={{ scale: 0.93 }}
      className="select-none"
    >
      {/* Círculo principal */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 ${
          isEditMode
            ? 'bg-[#5874f6] shadow-blue-500/40 ring-4 ring-[#5874f6]/20'
            : 'bg-gray-800 shadow-gray-900/30'
        }`}
      >
        <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>

      {/* Tooltip que aparece quando edição está ativa */}
      <motion.div
        initial={false}
        animate={{ opacity: isEditMode ? 1 : 0, x: isEditMode ? 0 : 8 }}
        transition={{ duration: 0.18 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
      >
        Modo edição ativo
        {/* Setinha apontando para o botão */}
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900" />
      </motion.div>

      {/* "x" para dispensar o botão completamente */}
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

  const firstName = String(data.userName || 'Bruno').split(' ')[0];

  const handleEditField = (fieldName: string) => {
    if (onAction) onAction('EDIT_FIELD', { field: fieldName });
  };

  return (
    <>
      {/* ─── Conteúdo com scroll ─── */}
      <div
        className="w-full max-w-md mx-auto bg-white flex flex-col overflow-y-auto overscroll-contain pb-32"
        style={{
          backgroundColor: style.bgColor,
          maxHeight: 'calc(100dvh - 4rem)',
        }}
      >
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
      </div>

      {/* ─── Botão flutuante via Portal (fora de qualquer overflow) ─── */}
      {isFloatingVisible && (
        <FloatingEditButton
          isEditMode={isEditMode}
          onToggleEdit={() => setIsEditMode((v) => !v)}
          onDismiss={() => { setIsFloatingVisible(false); setIsEditMode(false); }}
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
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-700 leading-snug mt-0.5 truncate">
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

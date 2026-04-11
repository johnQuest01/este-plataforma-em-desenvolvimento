'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  UserCircle,
  Mail,
  Lock,
  Hash,
  Home,
  Landmark,
  Tag,
  Navigation,
  Store,
  BadgeCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { AuthInputField } from './AuthInputField';
import { UserRegistrationType } from '@/schemas/registration-schema';

// ─── Tipos Exportados ──────────────────────────────────────────────────────────
export type RegisterInlineField =
  | 'fullName'
  | 'phoneNumber'
  | 'documentNumber'
  | 'emailAddress'
  | 'password'
  | 'street'
  | 'addressNumber'
  | 'addressComplement'
  | 'district'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'storeName';

// ─── Props: modo inline (controlado pelo pai) ─────────────────────────────────
interface RegisterFormInlineProps {
  personType: 'CPF' | 'CNPJ';
  fullName: string;
  emailAddress: string;
  password: string;
  phoneNumber: string;
  street: string;
  addressNumber: string;
  addressComplement: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  documentNumber: string;
  storeName?: string;
  registerAsSeller: boolean;
  onPersonTypeChange: (type: 'CPF' | 'CNPJ') => void;
  onInputChange: (field: RegisterInlineField, value: string) => void;
  onSellerToggle: (isSeller: boolean) => void;
}

// ─── Props: modo standalone (formulário autogerido) ───────────────────────────
interface RegisterFormStandaloneProps {
  onSubmitAction: (data: UserRegistrationType) => void;
  isLoading: boolean;
}

type RegisterFormProps = RegisterFormInlineProps | RegisterFormStandaloneProps;

function isStandaloneProps(props: RegisterFormProps): props is RegisterFormStandaloneProps {
  return 'onSubmitAction' in props;
}

// ─── Helpers de Máscara ────────────────────────────────────────────────────────
function maskCpf(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4')
    .substring(0, 14);
}

function maskCnpj(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2/$3')
    .replace(/(\d{4})\/(\d{4})(\d{1,2}).*/, '$1/$2-$3')
    .substring(0, 18);
}

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4}).*/, '$1-$2')
    .substring(0, 15);
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// ─── Sub-componente: Seletor de tipo de pessoa (CPF / CNPJ) ───────────────────
interface DocTypeSelectorProps {
  value: 'CPF' | 'CNPJ';
  onChange: (type: 'CPF' | 'CNPJ') => void;
}

function DocTypeSelector({ value, onChange }: DocTypeSelectorProps) {
  return (
    <div className="flex w-full gap-2 rounded-2xl border border-white/20 bg-black/40 p-1 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <button
        type="button"
        onClick={() => onChange('CPF')}
        className={clsx(
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
          value === 'CPF' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/80 hover:text-white'
        )}
      >
        <User size={14} aria-hidden /> CPF — Pessoa Física
      </button>
      <button
        type="button"
        onClick={() => onChange('CNPJ')}
        className={clsx(
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
          value === 'CNPJ' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/80 hover:text-white'
        )}
      >
        <Building2 size={14} aria-hidden /> CNPJ — Atacado
      </button>
    </div>
  );
}

// ─── Sub-componente: Botão de toggle Vendedor ─────────────────────────────────
interface SellerToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function SellerToggleButton({ value, onChange }: SellerToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={clsx(
        'relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300',
        'flex items-center gap-3',
        value
          ? 'border-[#F5A5C2] bg-[#F5A5C2]/25 shadow-[0_0_20px_rgba(245,165,194,0.35)] backdrop-blur-xl'
          : 'border-white/20 bg-black/35 backdrop-blur-md hover:bg-black/50'
      )}
    >
      {/* Ícone do badge */}
      <div
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
          value ? 'bg-[#F5A5C2] shadow-md' : 'bg-white/10'
        )}
      >
        {value ? (
          <BadgeCheck size={20} className="text-slate-900 drop-shadow-sm" aria-hidden />
        ) : (
          <Store size={20} className="text-white/70" aria-hidden />
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'text-xs font-black uppercase tracking-wide transition-colors',
            value ? 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]' : 'text-white/90'
          )}
        >
          {value ? '✓ Cadastrar como Vendedor(a)' : 'Quero ser Vendedor(a) da Maryland'}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-white/60 leading-tight">
          {value
            ? 'Inventário próprio, lista de clientes e painel de vendas.'
            : 'Toque para ativar — inventário, catálogo e gestão no app.'}
        </p>
      </div>

      {/* Indicador visual on/off */}
      <div
        className={clsx(
          'h-5 w-9 shrink-0 rounded-full border transition-all duration-300',
          value ? 'border-[#F5A5C2]/60 bg-[#F5A5C2]' : 'border-white/25 bg-white/10'
        )}
      >
        <div
          className={clsx(
            'h-full w-1/2 rounded-full transition-all duration-300',
            value ? 'translate-x-full bg-white shadow-sm' : 'translate-x-0 bg-white/50'
          )}
        />
      </div>
    </button>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export const RegisterForm = ({ ...props }: RegisterFormProps): React.JSX.Element => {
  // Estado interno para modo standalone
  const [st_fullName, setSt_fullName] = useState('');
  const [st_email, setSt_email] = useState('');
  const [st_phone, setSt_phone] = useState('');
  const [st_street, setSt_street] = useState('');
  const [st_number, setSt_number] = useState('');
  const [st_complement, setSt_complement] = useState('');
  const [st_district, setSt_district] = useState('');
  const [st_city, setSt_city] = useState('');
  const [st_state, setSt_state] = useState('');
  const [st_cep, setSt_cep] = useState('');
  const [st_docType, setSt_docType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [st_docNumber, setSt_docNumber] = useState('');
  const [st_password, setSt_password] = useState('');
  const [st_seller, setSt_seller] = useState(false);
  const [st_storeName, setSt_storeName] = useState('');

  // ── Modo standalone ──────────────────────────────────────────────────────────
  if (isStandaloneProps(props)) {
    const { onSubmitAction, isLoading } = props;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmitAction({
        fullName: st_fullName,
        emailAddress: st_email,
        phoneNumber: st_phone,
        street: st_street,
        addressNumber: st_number,
        addressComplement: st_complement,
        district: st_district,
        city: st_city,
        state: st_state,
        postalCode: st_cep,
        documentType: st_docType,
        documentNumber: st_docNumber,
        password: st_password,
        registerAsSeller: st_seller,
        storeName: st_storeName,
      });
    };

    const maskDoc = (v: string) => (st_docType === 'CPF' ? maskCpf(v) : maskCnpj(v));

    return (
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5">
        <DocTypeSelector value={st_docType} onChange={(t) => { setSt_docType(t); setSt_docNumber(''); }} />

        <AuthInputField overVideo icon={UserCircle} placeholder="Nome completo" value={st_fullName} onChange={setSt_fullName} required />
        <AuthInputField overVideo icon={Mail} type="email" inputMode="email" placeholder="Gmail / e-mail" value={st_email} onChange={setSt_email} required />
        <AuthInputField overVideo icon={Phone} type="tel" inputMode="tel" placeholder="WhatsApp (com DDD)" value={st_phone} onChange={(v) => setSt_phone(maskPhone(v))} required />

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <AuthInputField overVideo icon={MapPin} placeholder="Rua / avenida / logradouro" value={st_street} onChange={setSt_street} required />
          <div className="w-24">
            <AuthInputField overVideo icon={Hash} placeholder="N.º" value={st_number} onChange={setSt_number} />
          </div>
        </div>

        <AuthInputField overVideo icon={Home} placeholder="Complemento (opcional)" value={st_complement} onChange={setSt_complement} />
        <AuthInputField overVideo icon={MapPin} placeholder="Bairro / vila" value={st_district} onChange={setSt_district} required />

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <AuthInputField overVideo icon={Landmark} placeholder="Cidade" value={st_city} onChange={setSt_city} required />
          <div className="w-16">
            <AuthInputField overVideo icon={Tag} placeholder="UF" value={st_state} onChange={(v) => setSt_state(v.replace(/\d/g, '').toUpperCase().slice(0, 2))} required />
          </div>
        </div>

        <AuthInputField overVideo icon={Navigation} inputMode="numeric" placeholder="CEP" value={st_cep} onChange={(v) => setSt_cep(maskCep(v))} required />
        <AuthInputField overVideo icon={ShieldCheck} inputMode="numeric" placeholder={st_docType === 'CPF' ? 'CPF (apenas números)' : 'CNPJ (apenas números)'} value={st_docNumber} onChange={(v) => setSt_docNumber(maskDoc(v))} required />
        <AuthInputField overVideo icon={Lock} type="password" placeholder="Senha (mín. 6 caracteres)" value={st_password} onChange={setSt_password} required />

        {/* ── Separador visual ── */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tipo de conta</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* ── Toggle Vendedor ── */}
        <SellerToggleButton value={st_seller} onChange={setSt_seller} />

        {/* Nome da loja — aparece somente ao ativar vendedor */}
        {st_seller && (
          <AuthInputField
            overVideo
            icon={Store}
            placeholder="Nome da loja / negócio (opcional)"
            value={st_storeName}
            onChange={setSt_storeName}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-12 w-full rounded-xl bg-white text-xs font-black uppercase tracking-wider text-slate-900 shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'A registar…' : 'Criar conta'}
        </button>
      </form>
    );
  }

  // ── Modo inline (controlado pelo pai) ────────────────────────────────────────
  const {
    personType,
    fullName,
    emailAddress,
    password,
    phoneNumber,
    street,
    addressNumber,
    addressComplement,
    district,
    city,
    state,
    postalCode,
    documentNumber,
    storeName = '',
    registerAsSeller,
    onPersonTypeChange,
    onInputChange,
    onSellerToggle,
  } = props;

  const maskDoc = (v: string) => (personType === 'CPF' ? maskCpf(v) : maskCnpj(v));

  return (
    <div className="flex w-full flex-col gap-3">
      <DocTypeSelector
        value={personType}
        onChange={(t) => {
          onPersonTypeChange(t);
          onInputChange('documentNumber', '');
        }}
      />

      <AuthInputField overVideo icon={UserCircle} required placeholder="Nome completo" value={fullName} onChange={(v) => onInputChange('fullName', v)} />
      <AuthInputField overVideo icon={Mail} required type="email" inputMode="email" placeholder="Gmail / e-mail" value={emailAddress} onChange={(v) => onInputChange('emailAddress', v)} />
      <AuthInputField overVideo icon={Phone} required type="tel" inputMode="tel" placeholder="WhatsApp (com DDD)" value={phoneNumber} onChange={(v) => onInputChange('phoneNumber', maskPhone(v))} />

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <AuthInputField overVideo icon={MapPin} required placeholder="Rua / avenida / logradouro" value={street} onChange={(v) => onInputChange('street', v)} />
        <div className="w-24">
          <AuthInputField overVideo icon={Hash} placeholder="N.º" value={addressNumber} onChange={(v) => onInputChange('addressNumber', v)} />
        </div>
      </div>

      <AuthInputField overVideo icon={Home} placeholder="Complemento (opcional)" value={addressComplement} onChange={(v) => onInputChange('addressComplement', v)} />
      <AuthInputField overVideo icon={MapPin} required placeholder="Bairro / vila" value={district} onChange={(v) => onInputChange('district', v)} />

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <AuthInputField overVideo icon={Landmark} required placeholder="Cidade" value={city} onChange={(v) => onInputChange('city', v)} />
        <div className="w-16">
          <AuthInputField overVideo icon={Tag} required placeholder="UF" value={state} onChange={(v) => onInputChange('state', v.replace(/\d/g, '').toUpperCase().slice(0, 2))} />
        </div>
      </div>

      <AuthInputField overVideo icon={Navigation} required inputMode="numeric" placeholder="CEP" value={postalCode} onChange={(v) => onInputChange('postalCode', maskCep(v))} />
      <AuthInputField overVideo icon={ShieldCheck} required inputMode="numeric" placeholder={personType === 'CPF' ? 'CPF (apenas números)' : 'CNPJ (apenas números)'} value={documentNumber} onChange={(v) => onInputChange('documentNumber', maskDoc(v))} />
      <AuthInputField overVideo icon={Lock} required type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={(v) => onInputChange('password', v)} />

      {/* ── Separador visual ── */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-white/15" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tipo de conta</span>
        <div className="flex-1 h-px bg-white/15" />
      </div>

      {/* ── Toggle Vendedor ── */}
      <SellerToggleButton value={registerAsSeller} onChange={onSellerToggle} />

      {/* Nome da loja — aparece somente ao ativar vendedor */}
      {registerAsSeller && (
        <AuthInputField
          overVideo
          icon={Store}
          placeholder="Nome da loja / negócio (opcional)"
          value={storeName}
          onChange={(v) => onInputChange('storeName', v)}
        />
      )}
    </div>
  );
};

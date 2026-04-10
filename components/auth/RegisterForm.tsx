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
} from 'lucide-react';
import { clsx } from 'clsx';
import { AuthInputField } from './AuthInputField';
import { UserRegistrationType } from '@/schemas/registration-schema';

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
  | 'postalCode';

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
  onPersonTypeChange: (type: 'CPF' | 'CNPJ') => void;
  onInputChange: (field: RegisterInlineField, value: string) => void;
}

interface RegisterFormStandaloneProps {
  onSubmitAction: (data: UserRegistrationType) => void;
  isLoading: boolean;
}

type RegisterFormProps = RegisterFormInlineProps | RegisterFormStandaloneProps;

function isStandaloneProps(props: RegisterFormProps): props is RegisterFormStandaloneProps {
  return 'onSubmitAction' in props;
}

function maskCepInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export const RegisterForm = ({ ...props }: RegisterFormProps): React.JSX.Element => {
  const [legacyFullName, setLegacyFullName] = useState<string>('');
  const [legacyEmailAddress, setLegacyEmailAddress] = useState<string>('');
  const [legacyPhoneNumber, setLegacyPhoneNumber] = useState<string>('');
  const [legacyStreet, setLegacyStreet] = useState<string>('');
  const [legacyAddressNumber, setLegacyAddressNumber] = useState<string>('');
  const [legacyAddressComplement, setLegacyAddressComplement] = useState<string>('');
  const [legacyDistrict, setLegacyDistrict] = useState<string>('');
  const [legacyCity, setLegacyCity] = useState<string>('');
  const [legacyState, setLegacyState] = useState<string>('');
  const [legacyPostalCode, setLegacyPostalCode] = useState<string>('');
  const [legacyDocumentType, setLegacyDocumentType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [legacyDocumentNumber, setLegacyDocumentNumber] = useState<string>('');
  const [legacyPassword, setLegacyPassword] = useState<string>('');

  if (isStandaloneProps(props)) {
    const { onSubmitAction, isLoading } = props;

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmitAction({
        fullName: legacyFullName,
        emailAddress: legacyEmailAddress,
        phoneNumber: legacyPhoneNumber,
        street: legacyStreet,
        addressNumber: legacyAddressNumber,
        addressComplement: legacyAddressComplement,
        district: legacyDistrict,
        city: legacyCity,
        state: legacyState,
        postalCode: legacyPostalCode,
        documentType: legacyDocumentType,
        documentNumber: legacyDocumentNumber,
        password: legacyPassword,
      });
    };

    return (
      <form onSubmit={handleFormSubmit} className="flex w-full flex-col gap-2.5">
        <div className="flex w-full gap-2 rounded-2xl border border-white/20 bg-black/40 p-1 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <button
            type="button"
            onClick={() => setLegacyDocumentType('CPF')}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
              legacyDocumentType === 'CPF'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'text-white/80 hover:text-white'
            )}
          >
            <User size={16} /> Pessoa Física
          </button>
          <button
            type="button"
            onClick={() => setLegacyDocumentType('CNPJ')}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
              legacyDocumentType === 'CNPJ'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'text-white/80 hover:text-white'
            )}
          >
            <Building2 size={16} /> Pessoa Jurídica
          </button>
        </div>

        <AuthInputField
          overVideo={true}
          icon={UserCircle}
          placeholder="Nome completo"
          value={legacyFullName}
          onChange={setLegacyFullName}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Mail}
          type="email"
          inputMode="email"
          placeholder="E-mail"
          value={legacyEmailAddress}
          onChange={setLegacyEmailAddress}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Phone}
          type="tel"
          inputMode="tel"
          placeholder="WhatsApp / celular"
          value={legacyPhoneNumber}
          onChange={setLegacyPhoneNumber}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={MapPin}
          placeholder="Rua / avenida / logradouro"
          value={legacyStreet}
          onChange={setLegacyStreet}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Hash}
          placeholder="Número"
          value={legacyAddressNumber}
          onChange={setLegacyAddressNumber}
        />
        <AuthInputField
          overVideo={true}
          icon={Home}
          placeholder="Complemento (opcional)"
          value={legacyAddressComplement}
          onChange={setLegacyAddressComplement}
        />
        <AuthInputField
          overVideo={true}
          icon={MapPin}
          placeholder="Bairro"
          value={legacyDistrict}
          onChange={setLegacyDistrict}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Landmark}
          placeholder="Cidade"
          value={legacyCity}
          onChange={setLegacyCity}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Tag}
          placeholder="UF (2 letras)"
          value={legacyState}
          onChange={(v) => setLegacyState(v.replace(/\d/g, '').toUpperCase().slice(0, 2))}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Navigation}
          inputMode="numeric"
          placeholder="CEP"
          value={legacyPostalCode}
          onChange={(value) => setLegacyPostalCode(maskCepInput(value))}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={ShieldCheck}
          inputMode="numeric"
          placeholder={legacyDocumentType === 'CPF' ? 'CPF' : 'CNPJ'}
          value={legacyDocumentNumber}
          onChange={setLegacyDocumentNumber}
          required
        />
        <AuthInputField
          overVideo={true}
          icon={Lock}
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={legacyPassword}
          onChange={setLegacyPassword}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-12 w-full rounded-xl bg-white text-xs font-black uppercase tracking-wider text-slate-900 shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? 'A registar...' : 'Criar conta'}
        </button>
      </form>
    );
  }

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
    onPersonTypeChange,
    onInputChange,
  } = props;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full gap-2 rounded-2xl border border-white/20 bg-black/40 p-1 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <button
          type="button"
          onClick={() => {
            onPersonTypeChange('CPF');
            onInputChange('documentNumber', '');
          }}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
            personType === 'CPF'
              ? 'bg-white text-slate-900 shadow-lg'
              : 'text-white/80 hover:text-white'
          )}
        >
          <User size={16} /> Pessoa Física
        </button>
        <button
          type="button"
          onClick={() => {
            onPersonTypeChange('CNPJ');
            onInputChange('documentNumber', '');
          }}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300',
            personType === 'CNPJ'
              ? 'bg-white text-slate-900 shadow-lg'
              : 'text-white/80 hover:text-white'
          )}
        >
          <Building2 size={16} /> Pessoa Jurídica
        </button>
      </div>

      <AuthInputField
        overVideo={true}
        icon={UserCircle}
        required
        placeholder="Nome completo"
        value={fullName}
        onChange={(value) => onInputChange('fullName', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Phone}
        required
        type="tel"
        inputMode="tel"
        placeholder="Número de WhatsApp / celular"
        value={phoneNumber}
        onChange={(value) => onInputChange('phoneNumber', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={MapPin}
        required
        placeholder="Rua / avenida / logradouro"
        value={street}
        onChange={(value) => onInputChange('street', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Hash}
        placeholder="Número"
        value={addressNumber}
        onChange={(value) => onInputChange('addressNumber', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Home}
        placeholder="Complemento (opcional)"
        value={addressComplement}
        onChange={(value) => onInputChange('addressComplement', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={MapPin}
        required
        placeholder="Bairro"
        value={district}
        onChange={(value) => onInputChange('district', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Landmark}
        required
        placeholder="Cidade"
        value={city}
        onChange={(value) => onInputChange('city', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Tag}
        required
        placeholder="UF (2 letras)"
        value={state}
        onChange={(value) =>
          onInputChange('state', value.replace(/\d/g, '').toUpperCase().slice(0, 2))
        }
      />
      <AuthInputField
        overVideo={true}
        icon={Navigation}
        required
        inputMode="numeric"
        placeholder="CEP"
        value={postalCode}
        onChange={(value) => onInputChange('postalCode', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={ShieldCheck}
        required
        inputMode="numeric"
        placeholder={personType === 'CPF' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
        value={documentNumber}
        onChange={(value) => onInputChange('documentNumber', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Mail}
        required
        type="email"
        inputMode="email"
        placeholder="E-mail da conta"
        value={emailAddress}
        onChange={(value) => onInputChange('emailAddress', value)}
      />
      <AuthInputField
        overVideo={true}
        icon={Lock}
        required
        type="password"
        placeholder="Senha (mín. 6 caracteres)"
        value={password}
        onChange={(value) => onInputChange('password', value)}
      />
    </div>
  );
};

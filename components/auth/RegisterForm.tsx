'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Lock } from 'lucide-react';
import { AuthInputField } from './AuthInputField';
import { UserRegistrationType } from '@/schemas/registration-schema';

interface RegisterFormProps {
  onSubmitAction: (data: UserRegistrationType) => void;
  isLoading: boolean;
}

export const RegisterForm = ({ onSubmitAction, isLoading }: RegisterFormProps): React.JSX.Element => {
  const [fullName, setFullName] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [physicalAddress, setPhysicalAddress] = useState<string>('');
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">('CPF');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitAction({
      fullName,
      emailAddress,
      phoneNumber,
      physicalAddress,
      documentType,
      documentNumber,
      password
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-4">
      <div className="flex w-full bg-gray-100 p-1 rounded-xl mb-2">
        <button
          type="button"
          onClick={() => setDocumentType('CPF')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${documentType === 'CPF' ? 'bg-white shadow-sm text-[#5874f6]' : 'text-gray-500'}`}
        >
          Pessoa Física (CPF)
        </button>
        <button
          type="button"
          onClick={() => setDocumentType('CNPJ')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${documentType === 'CNPJ' ? 'bg-white shadow-sm text-[#5874f6]' : 'text-gray-500'}`}
        >
          Pessoa Jurídica (CNPJ)
        </button>
      </div>

      <AuthInputField icon={User} placeholder="Nome Completo" value={fullName} onChange={setFullName} required />
      <AuthInputField icon={Mail} type="email" inputMode="email" placeholder="Gmail / E-mail" value={emailAddress} onChange={setEmailAddress} required />
      <AuthInputField icon={Phone} type="tel" inputMode="tel" placeholder="Número de Celular" value={phoneNumber} onChange={setPhoneNumber} required />
      <AuthInputField icon={MapPin} placeholder="Endereço do Estabelecimento / Residência" value={physicalAddress} onChange={setPhysicalAddress} required />
      <AuthInputField icon={Briefcase} inputMode="numeric" placeholder={documentType === 'CPF' ? 'Digite seu CPF' : 'Digite seu CNPJ (MEI)'} value={documentNumber} onChange={setDocumentNumber} required />
      <AuthInputField icon={Lock} type="password" placeholder="Crie uma Senha" value={password} onChange={setPassword} required />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-4 bg-[#5874f6] text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isLoading ? 'A Registar...' : 'Criar Conta'}
      </button>
    </form>
  );
};
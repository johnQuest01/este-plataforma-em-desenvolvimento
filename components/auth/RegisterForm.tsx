'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Briefcase, Lock } from 'lucide-react';
import { AuthInputField } from './AuthInputField';
import { UserRegistrationType } from '@/schemas/registration-schema';
import { UserSessionData, LocalDB } from '@/lib/local-db';

interface RegisterFormProps {
  onSubmitAction: (data: UserRegistrationType) => Promise<{ success: boolean; data?: UserSessionData; error?: string }>;
}

export const RegisterForm = ({ onSubmitAction }: RegisterFormProps): React.JSX.Element => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [physicalAddress, setPhysicalAddress] = useState<string>('');
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">('CPF');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await onSubmitAction({
        fullName,
        emailAddress,
        phoneNumber,
        physicalAddress,
        documentType,
        documentNumber,
        password
      });

      if (response.success && response.data) {
        // Utilização do serviço centralizado de persistência
        LocalDB.setUser(response.data);
        
        // Redirecionamento imperativo para o Dashboard
        router.push('/dashboard');
      } else {
        setErrorMessage(response.error || 'Falha ao criar a conta. Tente novamente.');
      }
    } catch (error) {
      setErrorMessage('Ocorreu um erro inesperado de rede.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-2.5">
      {errorMessage && (
        <div className="w-full p-3 bg-red-500/20 border border-red-500/50 text-red-100 text-xs rounded-xl text-center font-medium">
          {errorMessage}
        </div>
      )}

      <div className="flex w-full bg-black/40 border border-white/20 p-1 rounded-xl mb-1 backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <button
          type="button"
          onClick={() => setDocumentType('CPF')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all duration-300 ${documentType === 'CPF' ? 'bg-white shadow-md text-slate-900' : 'text-white/80 hover:text-white'}`}
        >
          Pessoa Física (CPF)
        </button>
        <button
          type="button"
          onClick={() => setDocumentType('CNPJ')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all duration-300 ${documentType === 'CNPJ' ? 'bg-white shadow-md text-slate-900' : 'text-white/80 hover:text-white'}`}
        >
          Pessoa Jurídica (CNPJ)
        </button>
      </div>

      <AuthInputField overVideo={true} icon={User} placeholder="Nome Completo" value={fullName} onChange={setFullName} required />
      <AuthInputField overVideo={true} icon={Mail} type="email" inputMode="email" placeholder="Gmail / E-mail" value={emailAddress} onChange={setEmailAddress} required />
      <AuthInputField overVideo={true} icon={Phone} type="tel" inputMode="tel" placeholder="Número de Celular" value={phoneNumber} onChange={setPhoneNumber} required />
      <AuthInputField overVideo={true} icon={MapPin} placeholder="Endereço Completo" value={physicalAddress} onChange={setPhysicalAddress} required />
      <AuthInputField overVideo={true} icon={Briefcase} inputMode="numeric" placeholder={documentType === 'CPF' ? 'Digite o seu CPF' : 'Digite o seu CNPJ'} value={documentNumber} onChange={setDocumentNumber} required />
      <AuthInputField overVideo={true} icon={Lock} type="password" placeholder="Crie uma Senha" value={password} onChange={setPassword} required />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 mt-2 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? 'A Registar...' : 'Criar Conta'}
      </button>
    </form>
  );
};
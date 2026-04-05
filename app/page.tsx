'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight, ShieldCheck, Phone, UserCircle, BadgeCheck, Mail, MapPin, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuthInputField } from '@/components/auth/AuthInputField';
import { withGuardian } from "@/components/guardian/GuardianBeacon";
import { registerNewUserAction } from '@/app/actions/registration-actions';

// --- Utilitários de Máscara ---
const masks = {
  cpf: (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14),
  cnpj: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18),
  phone: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15),
};

type PersonType = 'fisica' | 'juridica' | 'vendedor';

function EntryPageBase(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [personType, setPersonType] = useState<PersonType>('fisica');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    physicalAddress: '',
    documentNumber: '',
    password: ''
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let finalValue = value;

    if (field === 'documentNumber') {
      const isCpfGroup = personType === 'fisica' || personType === 'vendedor';
      finalValue = isCpfGroup ? masks.cpf(value) : masks.cnpj(value);
    }

    if (field === 'phoneNumber') {
      finalValue = masks.phone(value);
    }

    setFormData((previousState) => ({ 
      ...previousState, 
      [field]: finalValue 
    }));
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await registerNewUserAction({
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        physicalAddress: formData.physicalAddress,
        documentType: personType === 'juridica' ? 'CNPJ' : 'CPF',
        documentNumber: formData.documentNumber,
        password: formData.password
      });

      if (!response.success) {
        setErrorMessage(response.error || 'Erro ao criar conta.');
        setIsLoading(false);
        return;
      }

      // Redireciona para Jeans ao invés de Dashboard conforme solicitado
      router.push('/product/jeans');
    } catch (error) {
      setErrorMessage('Erro de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="bg-white w-full max-w-[480px] rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in duration-300 my-8">
        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-blue-100">
            <ShieldCheck size={28} className="text-[#5874f6]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Identifique-se</h1>
          <p className="text-gray-500 text-xs font-medium mt-1">Acesse o painel exclusivo.</p>
        </div>

        {errorMessage && (
          <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button 
              type="button" 
              onClick={() => { setPersonType('fisica'); setFormData((prev) => ({ ...prev, documentNumber: '' })); }}
              className={clsx("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2", personType === 'fisica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <User size={16} /> Pessoa Física
            </button>
            <button 
              type="button" 
              onClick={() => { setPersonType('juridica'); setFormData((prev) => ({ ...prev, documentNumber: '' })); }}
              className={clsx("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2", personType === 'juridica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <Building2 size={16} /> Pessoa Jurídica
            </button>
          </div>

          <button 
            type="button"
            onClick={() => { 
              setPersonType(personType === 'vendedor' ? 'fisica' : 'vendedor');
              setFormData((prev) => ({ ...prev, documentNumber: '' })); 
            }}
            className={twMerge(
              "w-full h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-2",
              personType === 'vendedor' ? "bg-blue-50 text-[#5874f6] border-[#5874f6] shadow-sm" : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
            )}
          >
            <BadgeCheck size={16} />
            Sou Vendedor(a)
          </button>

          <div className="space-y-3">
            <AuthInputField icon={UserCircle} required placeholder="Seu Nome Completo" value={formData.fullName} onChange={(value) => handleInputChange('fullName', value)} />
            <AuthInputField icon={Mail} required type="email" inputMode="email" placeholder="Gmail / E-mail" value={formData.emailAddress} onChange={(value) => handleInputChange('emailAddress', value)} />
            <AuthInputField icon={Phone} required type="tel" placeholder="WhatsApp / Celular" value={formData.phoneNumber} onChange={(value) => handleInputChange('phoneNumber', value)} />
            <AuthInputField icon={MapPin} required placeholder="Endereço do Estabelecimento / Residência" value={formData.physicalAddress} onChange={(value) => handleInputChange('physicalAddress', value)} />
            <AuthInputField icon={ShieldCheck} required inputMode="numeric" placeholder={personType === 'juridica' ? 'CNPJ' : 'CPF'} value={formData.documentNumber} onChange={(value) => handleInputChange('documentNumber', value)} />
            <AuthInputField icon={Lock} required type="password" placeholder="Crie uma Senha" value={formData.password} onChange={(value) => handleInputChange('password', value)} />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !formData.fullName || !formData.documentNumber}
            className={twMerge(
              "w-full h-14 mt-2 bg-[#5874f6] text-white rounded-2xl font-black text-sm uppercase tracking-wider",
              "flex items-center justify-center gap-3 shadow-lg hover:bg-[#4a63d6] active:scale-95 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? 'A Processar...' : 'Acessar Sistema'} <ArrowRight size={20} />
          </button>

        </form>
      </main>

      <footer className="absolute bottom-4 text-center text-[10px] text-gray-400 font-medium">
        <p>© 2026 Maryland Gestão.</p>
      </footer>
    </div>
  );
}

export default withGuardian(
  EntryPageBase,
  "app/page.tsx",
  "PAGE"
);
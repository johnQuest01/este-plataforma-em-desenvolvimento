'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  Store,
  Phone,
  UserCircle,
  BadgeCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LocalDB } from '@/lib/local-db';
import { AuthInputField } from '@/components/auth/AuthInputField';
import { withGuardian } from "@/components/guardian/GuardianBeacon";
import { detectBrazilianNameGender } from '@/lib/utils/name-gender';

// --- Utilitários de Máscara ---
const masks = {
  cpf: (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    .substring(0, 14),
  cnpj: (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    .substring(0, 18),
  phone: (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    .substring(0, 15),
};

type PersonType = 'fisica' | 'juridica' | 'vendedor';

function EntryPageBase() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [personType, setPersonType] = useState<PersonType>('fisica');

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    storeName: '',
    whatsapp: ''
  });

  // 1. Verifica persistência e redireciona para JEANS (Nova Home)
  useEffect(() => {
    const checkUserTimer = setTimeout(() => {
      const user = LocalDB.getUser();
      if (user) {
        // CRITICAL CHANGE: Redireciona para Jeans ao invés de Dashboard
        router.push('/product/jeans');
      } else {
        setIsLoading(false);
      }
    }, 100);
    return () => clearTimeout(checkUserTimer);
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    let finalValue = value;

    if (field === 'document') {
      const isCpfGroup = personType === 'fisica' || personType === 'vendedor';
      finalValue = isCpfGroup ? masks.cpf(value) : masks.cnpj(value);
    }

    if (field === 'whatsapp') {
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

    // Simulação de processamento
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 800));

    // Detecta o gênero do nome brasileiro
    const nameGender = detectBrazilianNameGender(formData.name);

    // Persistência Local (LocalDB)
    LocalDB.saveUser({
      type: personType === 'vendedor' ? 'fisica' : personType, 
      name: formData.name,
      document: formData.document,
      whatsapp: formData.whatsapp,
      storeName: personType === 'juridica' ? formData.storeName : undefined,
      isVendedor: personType === 'vendedor',
      nameGender
    });

    // CRITICAL CHANGE: Redireciona para Jeans ao invés de Dashboard
    router.push('/product/jeans');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-blue-100">
            <ShieldCheck size={28} className="text-[#5874f6]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Identifique-se</h1>
          <p className="text-gray-500 text-xs font-medium mt-1">Acesse o painel exclusivo.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button 
              type="button" 
              onClick={() => { 
                setPersonType('fisica'); 
                setFormData((previous) => ({ ...previous, document: '' })); 
              }}
              className={clsx(
                "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                personType === 'fisica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <User size={16} /> Pessoa Física
            </button>
            <button 
              type="button" 
              onClick={() => { 
                setPersonType('juridica'); 
                setFormData((previous) => ({ ...previous, document: '' })); 
              }}
              className={clsx(
                "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                personType === 'juridica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Building2 size={16} /> Pessoa Jurídica
            </button>
          </div>

          <button 
            type="button"
            onClick={() => { 
              if (personType === 'vendedor') {
                setPersonType('fisica');
              } else {
                setPersonType('vendedor');
                setFormData((previous) => ({ ...previous, document: '' })); 
              }
            }}
            className={twMerge(
              "w-full h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-2",
              personType === 'vendedor' 
                ? "bg-blue-50 text-[#5874f6] border-[#5874f6] shadow-sm" 
                : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
            )}
          >
            <BadgeCheck size={16} />
            Sou Vendedor(a)
          </button>

          <div className="space-y-3">
            <AuthInputField
              icon={UserCircle}
              required
              placeholder="Seu Nome Completo"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
            />

            <AuthInputField
              icon={ShieldCheck}
              required
              inputMode="numeric"
              placeholder={personType === 'juridica' ? 'CNPJ' : 'CPF'}
              value={formData.document}
              onChange={(value) => handleInputChange('document', value)}
            />

            <AuthInputField
              icon={Phone}
              required
              type="tel"
              placeholder="WhatsApp"
              value={formData.whatsapp}
              onChange={(value) => handleInputChange('whatsapp', value)}
            />

            {personType === 'juridica' && (
              <div className="animate-in slide-in-from-top-2">
                <AuthInputField
                  icon={Store}
                  required
                  placeholder="Nome Fantasia da Loja"
                  value={formData.storeName}
                  onChange={(value) => handleInputChange('storeName', value)}
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!formData.name || !formData.document}
            className={twMerge(
              "w-full h-14 mt-2 bg-[#5874f6] text-white rounded-2xl font-black text-sm uppercase tracking-wider",
              "flex items-center justify-center gap-3 shadow-lg hover:bg-[#4a63d6] active:scale-95 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Acessar Sistema <ArrowRight size={20} />
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
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight, ShieldCheck, Store, Phone, UserCircle } from 'lucide-react';
import clsx from 'clsx';
import { LocalDB } from '@/lib/local-db'; 

// --- Máscaras ---
const masks = {
  cpf: (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14),
  cnpj: (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18),
  phone: (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15),
};

type PersonType = 'fisica' | 'juridica';

export default function EntryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); 
  const [personType, setPersonType] = useState<PersonType>('fisica');
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    storeName: '',
    whatsapp: ''
  });

  // 1. Verifica se já existe cadastro ao iniciar o app
  useEffect(() => {
    // CORREÇÃO: Usamos um setTimeout para jogar a verificação para o final da fila de execução.
    // Isso evita o erro de "Synchronous State Update" do React.
    const checkUser = setTimeout(() => {
        const existingUser = LocalDB.getUser();
        
        if (existingUser) {
          console.log("Usuário encontrado no DB Local:", existingUser);
          router.push('/dashboard'); 
        } else {
          setIsLoading(false); // Agora seguro, pois roda após o ciclo inicial
        }
    }, 100); // Um pequeno delay (100ms) ajuda a suavizar a transição visual também

    return () => clearTimeout(checkUser);
  }, [router]);

  const handleChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'document') {
        finalValue = personType === 'fisica' ? masks.cpf(value) : masks.cnpj(value);
    }
    if (field === 'whatsapp') {
        finalValue = masks.phone(value);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Salva no Banco de Dados Local
    LocalDB.saveUser({
      type: personType,
      name: formData.name,
      document: formData.document,
      whatsapp: formData.whatsapp,
      storeName: personType === 'juridica' ? formData.storeName : undefined
    });

    alert("Cadastro salvo com sucesso! Bem-vindo.");
    router.push('/dashboard'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-[#5874f6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-blue-100">
            <ShieldCheck size={28} className="text-[#5874f6]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Crie sua Conta</h1>
          <p className="text-gray-500 text-xs font-medium mt-1">Preencha seus dados para acessar o estoque.</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          {/* Toggle Tipo */}
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button type="button" onClick={() => { setPersonType('fisica'); setFormData(p => ({...p, document: ''})); }}
              className={clsx("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2", personType === 'fisica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500")}>
              <User size={16} /> Pessoa Física
            </button>
            <button type="button" onClick={() => { setPersonType('juridica'); setFormData(p => ({...p, document: ''})); }}
              className={clsx("flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2", personType === 'juridica' ? "bg-white text-[#5874f6] shadow-sm" : "text-gray-500")}>
              <Building2 size={16} /> Pessoa Jurídica
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            {/* Nome Completo */}
            <div className="relative group">
              <UserCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="text" placeholder="Seu Nome Completo" 
                value={formData.name} onChange={e => handleChange('name', e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
            </div>

            {/* Documento (CPF/CNPJ) */}
            <div className="relative group">
              <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="text" inputMode="numeric" 
                placeholder={personType === 'fisica' ? 'CPF' : 'CNPJ'}
                value={formData.document} onChange={e => handleChange('document', e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
            </div>

            {/* WhatsApp */}
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="tel" placeholder="WhatsApp / Celular" 
                value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
            </div>

            {/* Nome da Loja (Só Jurídica) */}
            {personType === 'juridica' && (
              <div className="relative group animate-in slide-in-from-top-2">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="text" placeholder="Nome Fantasia da Loja" 
                  value={formData.storeName} onChange={e => handleChange('storeName', e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
              </div>
            )}
          </div>

          <button type="submit" disabled={!formData.name || !formData.document}
            className="w-full h-14 mt-2 bg-[#5874f6] text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:bg-[#4a63d6] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Cadastrar e Entrar <ArrowRight size={20} />
          </button>

        </form>
      </div>
      
      <div className="absolute bottom-4 text-center text-[10px] text-gray-400 font-medium">
        <p>© 2024 B2B Engine. Dados salvos localmente.</p>
      </div>
    </div>
  );
}
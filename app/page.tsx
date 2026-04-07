'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight, ShieldCheck, Phone, UserCircle, BadgeCheck, Mail, MapPin, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuthInputField } from '@/components/auth/AuthInputField';
import { withGuardian } from "@/components/guardian/GuardianBeacon";
import { registerNewUserAction } from '@/app/actions/registration-actions';
import { getFormVideoAction } from '@/app/actions/video-bg-actions';
import { LocalDB } from '@/lib/local-db';

const inputMasks = {
  cpf: (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14),
  cnpj: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18),
  phone: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15),
};

function getLoginVideoMimeType(sourceUrl: string): string {
  const base = sourceUrl.split('?')[0].toLowerCase();
  if (base.endsWith('.webm')) return 'video/webm';
  if (base.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
}

type PersonType = 'fisica' | 'juridica' | 'vendedor';

function EntryPageBase(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [personType, setPersonType] = useState<PersonType>('fisica');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    physicalAddress: '',
    documentNumber: '',
    password: ''
  });

  useEffect(() => {
    const fetchVideoConfiguration = async () => {
      const response = await getFormVideoAction();
      if (response.success && response.data) {
        setVideoUrl(response.data.videoUrl || '');
        setIsVideoActive(response.data.isActive ?? true);
      }
    };
    fetchVideoConfiguration();
  }, []);

  const isVideoVisible = Boolean(isVideoActive && videoUrl.trim() !== '');

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let finalValue = value;

    if (field === 'documentNumber') {
      const isCpfGroup = personType === 'fisica' || personType === 'vendedor';
      finalValue = isCpfGroup ? inputMasks.cpf(value) : inputMasks.cnpj(value);
    }

    if (field === 'phoneNumber') {
      finalValue = inputMasks.phone(value);
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
      if (response.data) {
        LocalDB.saveUser({
          type: response.data.documentType === 'CNPJ' ? 'juridica' : 'fisica',
          document: response.data.documentNumber,
          name: response.data.fullName,
          emailAddress: response.data.emailAddress,
          whatsapp: response.data.phoneNumber,
          role: response.data.role,
          isVendedor: response.data.role === 'seller',
          storeName: `${response.data.fullName.split(' ')[0] || 'Minha'} Store`,
        });
      }
      router.push('/dashboard');
    } catch {
      setErrorMessage('Erro de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center p-4">
      
      {isVideoVisible ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          aria-hidden
        >
          <source src={videoUrl} type={getLoginVideoMimeType(videoUrl)} />
        </video>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 to-slate-900" aria-hidden />
      )}

      <div className="absolute inset-0 z-0 bg-black/30" aria-hidden />

      <div className="relative z-10 w-full max-w-[400px] animate-in fade-in zoom-in duration-500 flex flex-col">
        
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-2xl">
            <ShieldCheck size={24} className="text-white drop-shadow-lg" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">Maryland identifique-se</h1>
          <p className="text-white/90 text-xs font-semibold mt-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">Acesse o painel exclusivo.</p>
        </div>

        {errorMessage && (
          <div className="w-full p-2.5 mb-4 bg-red-500/40 border border-red-500/50 text-white text-xs font-bold rounded-xl text-center backdrop-blur-xl shadow-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5">
          
          <div className="flex bg-black/40 rounded-xl p-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/20 backdrop-blur-2xl">
            <button 
              type="button" 
              onClick={() => { setPersonType('fisica'); setFormData((prev) => ({ ...prev, documentNumber: '' })); }}
              className={clsx("flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5", personType === 'fisica' ? "bg-white text-slate-900 shadow-md" : "text-white/80 hover:text-white")}
            >
              <User size={14} /> Pessoa Física
            </button>
            <button 
              type="button" 
              onClick={() => { setPersonType('juridica'); setFormData((prev) => ({ ...prev, documentNumber: '' })); }}
              className={clsx("flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5", personType === 'juridica' ? "bg-white text-slate-900 shadow-md" : "text-white/80 hover:text-white")}
            >
              <Building2 size={14} /> Pessoa Jurídica
            </button>
          </div>

          <button 
            type="button"
            onClick={() => { 
              setPersonType(personType === 'vendedor' ? 'fisica' : 'vendedor');
              setFormData((prev) => ({ ...prev, documentNumber: '' })); 
            }}
            className={twMerge(
              "w-full h-10 rounded-xl text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 border backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
              personType === 'vendedor' ? "bg-white/30 text-white border-white/50" : "bg-black/40 text-white/80 border-white/20 hover:bg-black/60 hover:text-white"
            )}
          >
            <BadgeCheck size={14} />
            Sou Vendedor(a)
          </button>

          <div className="space-y-2.5 mt-1">
            <AuthInputField overVideo={true} icon={UserCircle} required placeholder="Seu Nome Completo" value={formData.fullName} onChange={(value) => handleInputChange('fullName', value)} />
            <AuthInputField overVideo={true} icon={Mail} required type="email" inputMode="email" placeholder="Gmail / E-mail" value={formData.emailAddress} onChange={(value) => handleInputChange('emailAddress', value)} />
            <AuthInputField overVideo={true} icon={Phone} required type="tel" placeholder="WhatsApp / Celular" value={formData.phoneNumber} onChange={(value) => handleInputChange('phoneNumber', value)} />
            <AuthInputField overVideo={true} icon={MapPin} required placeholder="Endereço Completo" value={formData.physicalAddress} onChange={(value) => handleInputChange('physicalAddress', value)} />
            <AuthInputField overVideo={true} icon={ShieldCheck} required inputMode="numeric" placeholder={personType === 'juridica' ? 'CNPJ' : 'CPF'} value={formData.documentNumber} onChange={(value) => handleInputChange('documentNumber', value)} />
            <AuthInputField overVideo={true} icon={Lock} required type="password" placeholder="Crie uma Senha" value={formData.password} onChange={(value) => handleInputChange('password', value)} />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !formData.fullName || !formData.documentNumber}
            className={twMerge(
              "w-full h-12 mt-2 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider",
              "flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isLoading ? 'A Processar...' : 'Acessar Sistema'} <ArrowRight size={16} />
          </button>

        </form>
      </div>
    </main>
  );
}

export default withGuardian(
  EntryPageBase,
  "app/page.tsx",
  "PAGE"
);
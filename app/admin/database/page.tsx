'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight, ShieldCheck, Phone, UserCircle, Mail, MapPin, Lock, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { registerNewUserAction } from '@/app/actions/registration-actions';
import { authenticateUserAction } from '@/app/actions/auth-actions';
import { getFormVideoAction } from '@/app/actions/video-bg-actions';
import { AuthInputField } from '@/components/auth/AuthInputField';

const inputMasks = {
  cpf: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14),
  cnpj: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18),
  phone: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15),
};

function getLoginVideoMimeType(sourceUrl: string): string {
  const base = sourceUrl.split('?')[0].toLowerCase();
  if (base.endsWith('.webm')) return 'video/webm';
  if (base.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
}

type PersonDocumentType = 'CPF' | 'CNPJ';
type AuthenticationMode = 'LOGIN' | 'REGISTER';

export default function AuthenticationPage(): React.JSX.Element {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthenticationMode>('REGISTER');
  const [personType, setPersonType] = useState<PersonDocumentType>('CPF');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    physicalAddress: '',
    documentNumber: '',
    password: '',
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
      finalValue = personType === 'CPF' ? inputMasks.cpf(value) : inputMasks.cnpj(value);
    }
    if (field === 'phoneNumber') {
      finalValue = inputMasks.phone(value);
    }
    setFormData((previousState) => ({ ...previousState, [field]: finalValue }));
  };

  const handleAuthenticationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (authMode === 'REGISTER') {
        const response = await registerNewUserAction({
          fullName: formData.fullName,
          emailAddress: formData.emailAddress,
          phoneNumber: formData.phoneNumber,
          physicalAddress: formData.physicalAddress,
          documentType: personType,
          documentNumber: formData.documentNumber,
          password: formData.password,
        });
        if (!response.success) {
          setErrorMessage(response.error || 'Erro ao criar conta.');
          setIsLoading(false);
          return;
        }
        router.push('/dashboard');
      } else {
        const response = await authenticateUserAction({
          documentOrEmail: formData.emailAddress || formData.documentNumber,
          password: formData.password,
        });
        if (!response.success) {
          setErrorMessage(response.error || 'Erro ao fazer login.');
          setIsLoading(false);
          return;
        }
        router.push('/dashboard');
      }
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
        
        <header className="flex flex-col items-center mb-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-black/40 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-3">
            <ShieldCheck size={24} className="text-white drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {authMode === 'REGISTER' ? 'Criar Conta' : 'Bem-vindo'}
          </h1>
          <p className="text-xs font-semibold text-white/90 mt-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
            {authMode === 'REGISTER' ? 'Preencha os dados para começar' : 'Acesse sua conta para continuar'}
          </p>
        </header>

        {errorMessage ? (
          <div className="w-full rounded-xl border border-red-500/50 bg-red-500/40 p-2.5 mb-4 text-center backdrop-blur-xl shadow-lg">
            <p className="text-xs font-bold text-white drop-shadow-md" role="alert">
              {errorMessage}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleAuthenticationSubmit} className="flex w-full flex-col gap-2.5">
          {authMode === 'REGISTER' ? (
            <div className="flex w-full gap-1.5 rounded-xl border border-white/20 bg-black/40 p-1 backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                onClick={() => {
                  setPersonType('CPF');
                  handleInputChange('documentNumber', '');
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-300',
                  personType === 'CPF'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-white/80 hover:text-white'
                )}
              >
                <User size={14} /> Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersonType('CNPJ');
                  handleInputChange('documentNumber', '');
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-300',
                  personType === 'CNPJ'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-white/80 hover:text-white'
                )}
              >
                <Building2 size={14} /> Pessoa Jurídica
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {authMode === 'REGISTER' ? (
              <AuthInputField
                overVideo={true}
                icon={UserCircle}
                required
                placeholder="Nome Completo"
                value={formData.fullName}
                onChange={(value) => handleInputChange('fullName', value)}
              />
            ) : null}
            
            <AuthInputField
              overVideo={true}
              icon={Mail}
              required
              type="email"
              inputMode="email"
              placeholder={authMode === 'LOGIN' ? 'E-mail ou Documento' : 'Seu melhor E-mail'}
              value={formData.emailAddress}
              onChange={(value) => handleInputChange('emailAddress', value)}
            />
            
            {authMode === 'REGISTER' ? (
              <>
                <AuthInputField
                  overVideo={true}
                  icon={Phone}
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="Número de Celular"
                  value={formData.phoneNumber}
                  onChange={(value) => handleInputChange('phoneNumber', value)}
                />
                <AuthInputField
                  overVideo={true}
                  icon={MapPin}
                  required
                  placeholder="Endereço Completo"
                  value={formData.physicalAddress}
                  onChange={(value) => handleInputChange('physicalAddress', value)}
                />
                <AuthInputField
                  overVideo={true}
                  icon={ShieldCheck}
                  required
                  inputMode="numeric"
                  placeholder={personType === 'CPF' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
                  value={formData.documentNumber}
                  onChange={(value) => handleInputChange('documentNumber', value)}
                />
              </>
            ) : null}
            
            <AuthInputField
              overVideo={true}
              icon={Lock}
              required
              type="password"
              placeholder={authMode === 'REGISTER' ? 'Crie uma Senha Forte' : 'Sua Senha'}
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-black uppercase tracking-wider text-slate-900 shadow-[0_4px_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? 'Processando...' : authMode === 'REGISTER' ? 'Criar Conta Agora' : 'Entrar no Sistema'}
            {authMode === 'REGISTER' ? <ArrowRight size={16} /> : <LogIn size={16} />}
          </button>
        </form>
      </div>
    </main>
  );
}
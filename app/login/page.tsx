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

function loginVideoMime(src: string): string {
  const base = src.split('?')[0].toLowerCase();
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
  const [videoActive, setVideoActive] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    physicalAddress: '',
    documentNumber: '',
    password: '',
  });

  useEffect(() => {
    const fetchVideo = async () => {
      const response = await getFormVideoAction();
      if (response.success && response.data) {
        setVideoUrl(response.data.videoUrl || '');
        setVideoActive(response.data.isActive ?? true);
      }
    };
    fetchVideo();
  }, []);

  const showVideo = Boolean(videoActive && videoUrl.trim() !== '');
  const onVideo = showVideo;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let finalValue = value;
    if (field === 'documentNumber')
      finalValue = personType === 'CPF' ? inputMasks.cpf(value) : inputMasks.cnpj(value);
    if (field === 'phoneNumber') finalValue = inputMasks.phone(value);
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
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

  const titleShadow = onVideo ? '[text-shadow:0_2px_18px_rgba(0,0,0,0.9)]' : '';
  const iconDrop = onVideo ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]' : '';

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden overflow-y-auto">
      {showVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 z-0 h-full w-full object-cover"
          aria-hidden
        >
          <source src={videoUrl} type={loginVideoMime(videoUrl)} />
        </video>
      ) : (
        <div
          className="fixed inset-0 z-0 bg-linear-to-br from-slate-200 via-slate-100 to-slate-300"
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-1 h-28 bg-linear-to-t from-black/25 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center px-5 py-10 sm:py-14">
        {/* UI flutuante: sem painel de fundo — só ícone + título sobre o vídeo */}
        <header className="mb-6 flex w-full max-w-[400px] flex-col items-center gap-2 text-center">
          <ShieldCheck
            size={36}
            strokeWidth={2.2}
            className={clsx(iconDrop, onVideo ? 'text-white' : 'text-slate-800')}
            aria-hidden
          />
          <h1
            className={clsx(
              'text-xl font-black leading-tight tracking-tight sm:text-2xl',
              onVideo ? clsx('text-white', titleShadow) : 'text-slate-900'
            )}
          >
            {authMode === 'REGISTER' ? 'Identifique-se' : 'Acesse sua Conta'}
          </h1>
        </header>

        {errorMessage ? (
          <p
            className={clsx(
              'mb-4 w-full max-w-[400px] text-center text-xs font-bold',
              onVideo
                ? 'text-red-100 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]'
                : 'text-red-700'
            )}
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <form
          onSubmit={handleAuthenticationSubmit}
          className="flex w-full max-w-[400px] flex-col gap-3"
        >
          {authMode === 'REGISTER' ? (
            <div className="flex w-full gap-2 rounded-full p-1">
              <button
                type="button"
                onClick={() => {
                  setPersonType('CPF');
                  handleInputChange('documentNumber', '');
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-bold transition-all',
                  onVideo
                    ? clsx(
                        'border border-white/35 backdrop-blur-xl',
                        personType === 'CPF'
                          ? 'bg-white/90 text-slate-900 shadow-lg'
                          : 'bg-white/20 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]'
                      )
                    : clsx(
                        personType === 'CPF'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white/80 text-slate-700 ring-1 ring-slate-200'
                      )
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
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-bold transition-all',
                  onVideo
                    ? clsx(
                        'border border-white/35 backdrop-blur-xl',
                        personType === 'CNPJ'
                          ? 'bg-white/90 text-slate-900 shadow-lg'
                          : 'bg-white/20 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]'
                      )
                    : clsx(
                        personType === 'CNPJ'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white/80 text-slate-700 ring-1 ring-slate-200'
                      )
                )}
              >
                <Building2 size={14} /> Pessoa Jurídica
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {authMode === 'REGISTER' ? (
              <AuthInputField
                overVideo={onVideo}
                icon={UserCircle}
                required
                placeholder="Nome Completo"
                value={formData.fullName}
                onChange={(v) => handleInputChange('fullName', v)}
              />
            ) : null}
            <AuthInputField
              overVideo={onVideo}
              icon={Mail}
              required
              type="email"
              inputMode="email"
              placeholder={authMode === 'LOGIN' ? 'E-mail ou Documento' : 'Gmail / E-mail'}
              value={formData.emailAddress}
              onChange={(v) => handleInputChange('emailAddress', v)}
            />
            {authMode === 'REGISTER' ? (
              <>
                <AuthInputField
                  overVideo={onVideo}
                  icon={Phone}
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="Número de Celular"
                  value={formData.phoneNumber}
                  onChange={(v) => handleInputChange('phoneNumber', v)}
                />
                <AuthInputField
                  overVideo={onVideo}
                  icon={MapPin}
                  required
                  placeholder="Endereço Completo"
                  value={formData.physicalAddress}
                  onChange={(v) => handleInputChange('physicalAddress', v)}
                />
                <AuthInputField
                  overVideo={onVideo}
                  icon={ShieldCheck}
                  required
                  inputMode="numeric"
                  placeholder={personType === 'CPF' ? 'Digite seu CPF' : 'Digite seu CNPJ (MEI)'}
                  value={formData.documentNumber}
                  onChange={(v) => handleInputChange('documentNumber', v)}
                />
              </>
            ) : null}
            <AuthInputField
              overVideo={onVideo}
              icon={Lock}
              required
              type="password"
              placeholder={authMode === 'REGISTER' ? 'Crie uma Senha' : 'Sua Senha'}
              value={formData.password}
              onChange={(v) => handleInputChange('password', v)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50',
              onVideo
                ? 'border border-white/50 bg-white/90 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl hover:bg-white'
                : 'border border-white/50 bg-white/90 text-slate-900 shadow-lg backdrop-blur-xl hover:bg-white'
            )}
          >
            {isLoading ? 'Processando…' : authMode === 'REGISTER' ? 'Criar Conta' : 'Entrar no Sistema'}
            {authMode === 'REGISTER' ? <ArrowRight size={16} /> : <LogIn size={16} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'REGISTER' ? 'LOGIN' : 'REGISTER');
              setErrorMessage(null);
            }}
            className={clsx(
              'text-[11px] font-bold underline-offset-4 transition-colors hover:underline',
              onVideo
                ? 'text-white/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]'
                : 'text-slate-800'
            )}
          >
            {authMode === 'REGISTER' ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Crie uma agora'}
          </button>
        </div>

        <p
          className={clsx(
            'mt-auto pt-10 text-center text-[10px] font-medium',
            onVideo ? 'text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]' : 'text-slate-600'
          )}
        >
          © 2026 Maryland Architecture.
        </p>
      </div>
    </div>
  );
}

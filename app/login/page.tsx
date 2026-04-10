'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';
import { registerNewUserAction } from '@/app/actions/registration-actions';
import { authenticateUserAction } from '@/app/actions/auth-actions';
import { getFormVideoAction } from '@/app/actions/video-bg-actions';
import { AuthInputField } from '@/components/auth/AuthInputField';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LocalDB } from '@/lib/local-db';

const inputMasks = {
  cpf: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14),
  cnpj: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18),
  phone: (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15),
  cep: (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  },
};

function getLoginVideoMimeType(sourceUrl: string): string {
  const base = sourceUrl.split('?')[0].toLowerCase();
  if (base.endsWith('.webm')) return 'video/webm';
  if (base.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
}

type PersonDocumentType = 'CPF' | 'CNPJ';

export default function AuthenticationPage(): React.JSX.Element {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSignupFields, setShowSignupFields] = useState<boolean>(false);
  const [personType, setPersonType] = useState<PersonDocumentType>('CPF');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    street: '',
    addressNumber: '',
    addressComplement: '',
    district: '',
    city: '',
    state: '',
    postalCode: '',
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
    if (field === 'postalCode') {
      finalValue = inputMasks.cep(value);
    }
    if (field === 'state') {
      finalValue = value.replace(/\d/g, '').toUpperCase().slice(0, 2);
    }
    setFormData((previousState) => ({ ...previousState, [field]: finalValue }));
  };

  const persistSessionAndRedirect = (params: {
    documentType: 'CPF' | 'CNPJ';
    documentNumber: string;
    displayName: string;
    emailAddress: string;
    phoneNumber: string;
    role: string;
  }) => {
    LocalDB.saveUser({
      type: params.documentType === 'CNPJ' ? 'juridica' : 'fisica',
      document: params.documentNumber,
      name: params.displayName,
      emailAddress: params.emailAddress,
      whatsapp: params.phoneNumber,
      role: params.role,
      isVendedor: params.role === 'seller',
      storeName: `${params.displayName.split(' ')[0] || 'Minha'} Store`,
    });
    router.push('/dashboard');
  };

  const handleAuthenticationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const emailTrimmed = formData.emailAddress.trim();

    try {
      const authResponse = await authenticateUserAction({
        documentOrEmail: emailTrimmed,
        password: formData.password,
      });

      if (authResponse.success && authResponse.data) {
        persistSessionAndRedirect({
          documentType: authResponse.data.documentType,
          documentNumber: authResponse.data.documentNumber,
          displayName: authResponse.data.userName,
          emailAddress: authResponse.data.emailAddress,
          phoneNumber: authResponse.data.phoneNumber,
          role: authResponse.data.role,
        });
        return;
      }

      const authError = (authResponse.error ?? '').toLowerCase();
      if (authError.includes('senha incorreta')) {
        setErrorMessage(authResponse.error ?? 'Senha incorreta.');
        setIsLoading(false);
        return;
      }

      if (!authError.includes('não encontrado')) {
        setErrorMessage(authResponse.error || 'Erro ao fazer login.');
        setIsLoading(false);
        return;
      }

      if (!showSignupFields) {
        setErrorMessage(
          'Não encontramos uma conta com este e-mail. Toque em "Se cadastrar" e preencha os dados para criar sua conta.'
        );
        setIsLoading(false);
        return;
      }

      const registerResponse = await registerNewUserAction({
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        addressNumber: formData.addressNumber,
        addressComplement: formData.addressComplement,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        documentType: personType,
        documentNumber: formData.documentNumber,
        password: formData.password,
      });

      if (!registerResponse.success) {
        setErrorMessage(registerResponse.error || 'Erro ao criar conta.');
        setIsLoading(false);
        return;
      }

      if (registerResponse.data) {
        persistSessionAndRedirect({
          documentType: registerResponse.data.documentType,
          documentNumber: registerResponse.data.documentNumber,
          displayName: registerResponse.data.fullName,
          emailAddress: registerResponse.data.emailAddress,
          phoneNumber: registerResponse.data.phoneNumber,
          role: registerResponse.data.role,
        });
        return;
      }

      setErrorMessage('Conta criada, mas não foi possível concluir o acesso. Tente entrar novamente.');
      setIsLoading(false);
    } catch {
      setErrorMessage('Erro de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-slate-900">
      {/* Camada 1: Vídeo de Fundo em Fullscreen */}
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

      {/* Camada 2: Overlay Escuro Suave */}
      <div className="absolute inset-0 z-0 bg-black/30" aria-hidden />

      {/* Camada 3: Conteúdo Flutuante (Sem painel branco) */}
      <div
        className={
          showSignupFields
            ? 'relative z-10 flex h-[100dvh] max-h-[100dvh] w-full flex-col items-center overflow-hidden px-4 py-3 sm:py-5'
            : 'relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-12'
        }
      >
        <div
          className={
            showSignupFields
              ? 'flex min-h-0 w-full max-w-[440px] flex-1 flex-col items-center gap-3 overflow-hidden'
              : 'flex w-full max-w-[440px] flex-col items-center gap-8'
          }
        >
          
          {/* Cabeçalho */}
          <header className={`flex flex-col items-center gap-3 text-center ${showSignupFields ? 'shrink-0' : ''}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <ShieldCheck size={32} className="text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
              {showSignupFields ? 'Criar conta' : 'Entrar'}
            </h1>
            <p className="text-sm font-semibold text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
              {showSignupFields
                ? 'Preencha seus dados. Para voltar ao acesso rápido, use o botão abaixo.'
                : 'Acesse com e-mail e senha. Para criar conta, toque em "Se cadastrar".'}
            </p>
          </header>

          {/* Mensagem de Erro */}
          {errorMessage ? (
            <div className="w-full shrink-0 rounded-2xl border border-red-500/50 bg-red-500/40 p-3 text-center backdrop-blur-xl shadow-lg">
              <p className="text-sm font-bold text-white drop-shadow-md" role="alert">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {/* Formulário: login e cadastro são telas separadas (mutuamente exclusivas), ambas sobre o vídeo */}
          <form
            onSubmit={handleAuthenticationSubmit}
            className={
              showSignupFields
                ? 'flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden'
                : 'flex w-full flex-col gap-4'
            }
          >
            {!showSignupFields ? (
              <>
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                  Login e senha
                </p>
                <div className="flex flex-col gap-3">
                  <AuthInputField
                    overVideo={true}
                    icon={Mail}
                    required
                    type="email"
                    inputMode="email"
                    placeholder="E-mail"
                    value={formData.emailAddress}
                    onChange={(value) => handleInputChange('emailAddress', value)}
                  />
                  <AuthInputField
                    overVideo={true}
                    icon={Lock}
                    required
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(value) => handleInputChange('password', value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupFields(true);
                    setErrorMessage(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-black/35 py-3 text-xs font-bold text-white/95 backdrop-blur-2xl transition-colors hover:bg-black/50 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  Se cadastrar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black uppercase tracking-wider text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoading ? 'Processando...' : 'Entrar'}
                  <LogIn size={18} />
                </button>
              </>
            ) : (
              <>
                <p className="shrink-0 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                  Novo cadastro
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupFields(false);
                    setErrorMessage(null);
                  }}
                  className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-black/35 py-3 text-xs font-bold text-white/95 backdrop-blur-2xl transition-colors hover:bg-black/50 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  <LogIn size={16} aria-hidden />
                  Entrar com login e senha
                </button>
                <div
                  role="region"
                  aria-label="Campos do cadastro"
                  className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl border border-white/15 bg-black/25 px-2 py-2 shadow-inner backdrop-blur-md [-webkit-overflow-scrolling:touch]"
                >
                  <div className="flex flex-col gap-3 pb-2">
                    <RegisterForm
                      personType={personType}
                      fullName={formData.fullName}
                      emailAddress={formData.emailAddress}
                      password={formData.password}
                      phoneNumber={formData.phoneNumber}
                      street={formData.street}
                      addressNumber={formData.addressNumber}
                      addressComplement={formData.addressComplement}
                      district={formData.district}
                      city={formData.city}
                      state={formData.state}
                      postalCode={formData.postalCode}
                      documentNumber={formData.documentNumber}
                      onPersonTypeChange={setPersonType}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black uppercase tracking-wider text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoading ? 'Processando...' : 'Cadastrar e entrar'}
                  <LogIn size={18} />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
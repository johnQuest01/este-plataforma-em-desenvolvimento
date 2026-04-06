'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { UserRegistrationType } from '@/schemas/registration-schema';
import { registerNewUserAction } from '@/app/actions/registration-actions';

function RegistrationFormBlockBase({ config, onAction }: BlockComponentProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegistrationSubmit = async (formData: UserRegistrationType) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const response = await registerNewUserAction(formData);

    if (!response.success) {
      setErrorMessage(response.error || 'Erro desconhecido.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onAction?.('REGISTRATION_SUCCESS', { blockId: config.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-[400px] mx-auto p-2 flex flex-col"
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-black text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">Criar Conta</h2>
        <p className="text-xs font-semibold text-white/90 mt-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">Preencha os seus dados para continuar</p>
      </div>

      {errorMessage && (
        <div className="w-full p-2.5 mb-4 bg-red-500/40 border border-red-500/50 text-white text-xs font-bold rounded-xl text-center backdrop-blur-xl shadow-lg">
          {errorMessage}
        </div>
      )}

      <RegisterForm onSubmitAction={handleRegistrationSubmit} isLoading={isSubmitting} />
    </motion.div>
  );
}

export const RegistrationFormBlock = withGuardian(
  RegistrationFormBlockBase,
  "components/builder/blocks/RegistrationFormBlock.tsx",
  "UI_COMPONENT",
  { label: "Formulário de Registo", description: "Bloco de registo flutuante e compacto com design Glassmorphism." }
);
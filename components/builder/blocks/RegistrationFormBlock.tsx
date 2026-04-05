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
      className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-black">Criar Conta</h2>
        <p className="text-sm text-gray-500 mt-1">Preencha os seus dados para continuar</p>
      </div>

      {errorMessage && (
        <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
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
  { label: "Formulário de Registo", description: "Bloco de registo completo com validação." }
);
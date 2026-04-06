'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { UserRegistrationType } from '@/schemas/registration-schema';
import { registerNewUserAction } from '@/app/actions/registration-actions';
import { UserSessionData } from '@/lib/local-db';

function RegistrationFormBlockBase({ config, onAction }: BlockComponentProps): React.JSX.Element {
  
  /**
   * Interceta a submissão para disparar eventos do Builder,
   * mas retorna a promessa completa para que o RegisterForm 
   * possa gerir o LocalDB e o redirecionamento.
   */
  const handleRegistrationSubmit = async (
    formData: UserRegistrationType
  ): Promise<{ success: boolean; data?: UserSessionData; error?: string }> => {
    
    const response = await registerNewUserAction(formData);

    if (response.success) {
      // Notifica o sistema de blocos (Lego Architecture) que a ação foi concluída
      onAction?.('REGISTRATION_SUCCESS', { blockId: config.id });
    }

    // Retorna a resposta estrita exigida pelo contrato do RegisterForm
    return response;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-[400px] mx-auto p-2 flex flex-col"
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-black text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
          Criar Conta
        </h2>
        <p className="text-xs font-semibold text-white/90 mt-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
          Preencha os seus dados para continuar
        </p>
      </div>

      {/* O RegisterForm agora gere o seu próprio estado de erro e loading internamente */}
      <RegisterForm onSubmitAction={handleRegistrationSubmit} />
    </motion.div>
  );
}

export const RegistrationFormBlock = withGuardian(
  RegistrationFormBlockBase,
  "components/builder/blocks/RegistrationFormBlock.tsx",
  "UI_COMPONENT",
  { 
    label: "Formulário de Registo", 
    description: "Bloco de registo flutuante e compacto com design Glassmorphism." 
  }
);
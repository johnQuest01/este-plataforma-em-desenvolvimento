'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Lock, CreditCard, History } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';

function AccountScreenBlockBase({ config, onAction }: BlockComponentProps): React.JSX.Element {
  
  const accountMenuOptions =[
    {
      id: 'personal-info',
      icon: User,
      title: 'Informações Pessoais',
      subtitle: 'Nome, Endereço, Gmail, Numero de celular',
      action: 'navigate_personal_info'
    },
    {
      id: 'login-security',
      icon: Lock,
      title: 'Login e Senhas',
      subtitle: 'Altere sua senha e autorize autenficação em duas etapas',
      action: 'navigate_security'
    },
    {
      id: 'payment-methods',
      icon: CreditCard,
      title: 'Formas de Pagamentos',
      subtitle: 'Débito, Crédito, Pix',
      action: 'navigate_payments'
    },
    {
      id: 'activity-history',
      icon: History,
      title: 'Historico de Atividades',
      subtitle: 'Pagamentos, Nota Fiscal, Status de pedido',
      action: 'navigate_history'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      // ✅ CORREÇÃO: pt-28 reduzido para pt-8. Como o Header é 'relative', ele já empurra o conteúdo.
      // pb-32 mantido para garantir que o último botão não fique escondido atrás do Footer fixo.
      className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col pt-8 pb-32 px-4"
    >
      {/* Título "Minha Conta" centralizado com margem ajustada */}
      <div className="w-full flex justify-center mb-8">
        <h2 className="text-2xl font-extrabold text-black tracking-tight">Minha Conta</h2>
      </div>

      {/* Lista de Cartões de Navegação */}
      <div className="flex flex-col gap-4 w-full">
        {accountMenuOptions.map((option, index) => {
          const IconComponent = option.icon;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onAction?.(option.action, { blockId: config.id })}
              className="w-full flex items-center text-left p-4 bg-white border-2 border-black rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="flex-shrink-0 mr-4">
                <IconComponent className="w-8 h-8 text-black" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-black leading-tight mb-1">
                  {option.title}
                </span>
                <span className="text-sm font-semibold text-gray-600 leading-snug">
                  {option.subtitle}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export const AccountScreenBlock = withGuardian(
  AccountScreenBlockBase,
  "components/builder/blocks/AccountScreenBlock.tsx",
  "UI_COMPONENT",
  {
    label: "Tela de Minha Conta (Menu)",
    description: "Interface de navegação para as configurações da conta do usuário.",
    tags: ["Account", "Menu", "Navigation"]
  }
);
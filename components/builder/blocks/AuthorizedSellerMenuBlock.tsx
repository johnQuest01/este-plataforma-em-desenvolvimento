'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Banknote, CircleDollarSign, History, LucideIcon } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { AuthorizedSellerMenuDataSchema, type AuthorizedSellerMenuItemType } from '@/schemas/blocks/authorized-seller-menu-schema';

const ICON_MAP: Record<AuthorizedSellerMenuItemType['iconName'], LucideIcon> = {
  'user': User,
  'lock': Lock,
  'banknote': Banknote,
  'circle-dollar-sign': CircleDollarSign,
  'history': History,
};

const DEFAULT_MENU_ITEMS: AuthorizedSellerMenuItemType[] = [
  {
    id: 'personal-info',
    iconName: 'user',
    title: 'Informações Pessoais',
    subtitle: 'Nome, Endereço, Gmail, Numero de celular',
    actionRoute: 'NAVIGATE_PERSONAL_INFO',
  },
  {
    id: 'login-security',
    iconName: 'lock',
    title: 'Login e Senhas',
    subtitle: 'Altere sua senha e autorize autenticação em duas etapas',
    actionRoute: 'NAVIGATE_SECURITY',
  },
  {
    id: 'payment-methods',
    iconName: 'banknote',
    title: 'Formas de Pagamentos',
    subtitle: 'Débito, Crédito, Pix',
    actionRoute: 'NAVIGATE_PAYMENT_METHODS',
  },
  {
    id: 'salary-methods',
    iconName: 'circle-dollar-sign',
    title: 'Formas de Receber Salário',
    subtitle: 'Pix em conta, TED',
    actionRoute: 'NAVIGATE_SALARY_METHODS',
  },
  {
    id: 'activity-history',
    iconName: 'history',
    title: 'Historico de Atividades',
    subtitle: 'Pagamentos, Nota Fiscal, Status de pedido',
    actionRoute: 'NAVIGATE_ACTIVITY_HISTORY',
  },
];

export const AuthorizedSellerMenuBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const validationResult = AuthorizedSellerMenuDataSchema.safeParse(config.data);

  if (!validationResult.success) {
    return (
      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
        [LEGO_ERR]: Configuração de bloco inválida.
      </div>
    );
  }

  const menuItems = validationResult.data.menuItems && validationResult.data.menuItems.length > 0
    ? validationResult.data.menuItems
    : DEFAULT_MENU_ITEMS;

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col gap-4 px-4 py-6 overflow-y-auto overscroll-contain pb-28 bg-white"
      style={{ maxHeight: 'calc(100dvh - 4rem)' }}
    >
      {menuItems.map((item, index) => {
        const IconComponent = ICON_MAP[item.iconName];

        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction?.(item.actionRoute)}
            className="flex items-center w-full p-4 bg-white border border-gray-300 rounded-xl text-left shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            <div className="mr-4 shrink-0 flex items-center justify-center">
              <IconComponent className="w-7 h-7 text-gray-700" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base font-semibold text-gray-800 leading-tight mb-0.5">
                {item.title}
              </span>
              <span className="text-sm font-medium text-gray-500 leading-snug">
                {item.subtitle}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
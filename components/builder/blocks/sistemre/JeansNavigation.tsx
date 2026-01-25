'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { ShoppingBag, Package, Factory } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, Variants } from 'framer-motion';

interface NavigationButtonProps {
  label: string;
  path: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: (path: string) => void;
  variant: 'primary' | 'accent' | 'warning';
}

const NavButton = ({
  label,
  path,
  icon: Icon,
  isActive,
  onClick,
  variant
}: NavigationButtonProps) => {

  // Configuração de Variantes (Cores e Gradientes Premium com Bordas)
  const variants = {
    primary: {
      active: "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 border-2 border-blue-700",
      inactive: "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-blue-200 hover:border-blue-400 shadow-md",
      iconActive: "text-blue-100",
      iconInactive: "text-blue-500 group-hover:text-blue-600"
    },
    accent: {
      active: "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 border-2 border-purple-700",
      inactive: "bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-2 border-purple-200 hover:border-purple-400 shadow-md",
      iconActive: "text-purple-100",
      iconInactive: "text-purple-500 group-hover:text-purple-600"
    },
    warning: {
      active: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 border-2 border-orange-600",
      inactive: "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-2 border-orange-200 hover:border-orange-400 shadow-md",
      iconActive: "text-orange-100",
      iconInactive: "text-orange-500 group-hover:text-orange-600"
    }
  };

  const currentVariant = variants[variant];

  return (
    <button
      onClick={() => onClick(path)}
      className={twMerge(
        // Base classes
        "group relative flex items-center justify-center rounded-xl font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shrink-0",
        // Layout responsivo: largura total no mobile, auto no desktop
        "w-full md:w-auto px-4 py-3 text-xs gap-3",
        // Desktop: padding e texto um pouco maiores
        "md:px-6 md:py-4 md:text-[0.75rem] md:gap-3",
        isActive ? clsx("scale-[1.02]", currentVariant.active) : currentVariant.inactive
      )}
    >
      <Icon
        className={twMerge(
          "transition-transform duration-300 group-hover:scale-110",
          // Tamanho responsivo do ícone
          "w-5 h-5 md:w-[20px] md:h-[20px]",
          isActive ? currentVariant.iconActive : currentVariant.iconInactive
        )}
      />
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </button>
  );
};

export const JeansNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Se a rota for '/inventory/register', estamos no Estoque.
  const isInventoryPage = pathname === '/inventory/register';

  // Configuração de animação escalonada
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] // cubic-bezier equivalente a easeOut
      }
    }
  };

  return (
    <motion.div 
      className={twMerge(
        // Container com background sutil para legibilidade
        "flex items-center justify-center mx-auto pointer-events-auto relative z-10",
        "bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50",
        "p-2 md:p-3",
        // Layout vertical no mobile, horizontal no desktop
        "flex-col md:flex-row gap-2 w-full max-w-[90%] md:max-w-2xl"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 🛍️ BOTÃO PDV / CAIXA */}
      <motion.div variants={buttonVariants} className="w-full md:w-auto">
        <NavButton 
          label="PDV / Caixa" 
          path="/pos" 
          icon={ShoppingBag}
          isActive={pathname === '/pos'}
          onClick={handleNavigation}
          variant="primary"
        />
      </motion.div>

      {/* 📦 BOTÃO ESTOQUE */}
      {!isInventoryPage && (
        <motion.div variants={buttonVariants} className="w-full md:w-auto">
          <NavButton 
            label="Estoque" 
            path="/inventory/register" 
            icon={Package}
            isActive={false}
            onClick={handleNavigation}
            variant="accent"
          />
        </motion.div>
      )}

      {/* 🏭 BOTÃO PRODUÇÃO */}
      <motion.div variants={buttonVariants} className="w-full md:w-auto">
        <NavButton 
          label="Produção" 
          path="/production" 
          icon={Factory}
          isActive={pathname === '/production'}
          onClick={handleNavigation}
          variant="warning"
        />
      </motion.div>
    </motion.div>
  );
};
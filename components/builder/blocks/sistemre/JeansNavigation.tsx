'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { ShoppingBag, Package, Factory } from 'lucide-react';
import { clsx } from 'clsx';

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

  // Configuração de Variantes (Cores e Gradientes Premium)
  const variants = {
    primary: {
      active: "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20",
      inactive: "text-gray-500 hover:bg-blue-50 hover:text-blue-600",
      iconActive: "text-blue-100",
      iconInactive: "text-blue-400 group-hover:text-blue-600"
    },
    accent: {
      active: "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 ring-1 ring-white/20",
      inactive: "text-gray-500 hover:bg-purple-50 hover:text-purple-600",
      iconActive: "text-purple-100",
      iconInactive: "text-purple-400 group-hover:text-purple-600"
    },
    warning: {
      active: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/20",
      inactive: "text-gray-500 hover:bg-orange-50 hover:text-orange-600",
      iconActive: "text-orange-100",
      iconInactive: "text-orange-400 group-hover:text-orange-600"
    }
  };

  const currentVariant = variants[variant];

  return (
    <button
      onClick={() => onClick(path)}
      className={twMerge(
        // Base classes
        "group relative flex items-center justify-center rounded-full font-bold uppercase tracking-wider transition-all duration-300 border border-transparent active:scale-95",
        // Mobile (Compacto)
        "px-3 py-2 text-[0.6rem] gap-1.5",
        // Desktop (Original)
        "md:px-5 md:py-3 md:text-[0.7rem] md:gap-2.5",
        isActive ? clsx("scale-105", currentVariant.active) : currentVariant.inactive
      )}
    >
      <Icon
        className={twMerge(
          "transition-transform duration-300 group-hover:scale-110",
          // Tamanho responsivo do ícone
          "w-3.5 h-3.5 md:w-[18px] md:h-[18px]",
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
  // Usado para ocultar o botão de estoque quando já estamos nele.
  const isInventoryPage = pathname === '/inventory/register';

  return (
    <div className={twMerge(
      // Container Base com Blur Forte e Sombra
      "flex items-center justify-center bg-white/90 backdrop-blur-2xl rounded-full border border-white/50 shadow-2xl shadow-gray-300/50 mx-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ring-1 ring-gray-100 relative z-50",
      // Ajustes do Container: Mobile vs Desktop
      "p-1 gap-1 w-[95%] max-w-fit overflow-x-auto scrollbar-hide", // Mobile
      "md:p-1.5 md:gap-1 md:w-fit md:overflow-visible" // Desktop
    )}>
      
      {/* 🛍️ BOTÃO PDV / CAIXA */}
      <NavButton 
        label="PDV / Caixa" 
        path="/pos" 
        icon={ShoppingBag}
        isActive={pathname === '/pos'}
        onClick={handleNavigation}
        variant="primary"
      />

      {/* 📦 BOTÃO ESTOQUE: SÓ APARECE SE NÃO ESTIVER NO ESTOQUE */}
      {!isInventoryPage && (
        <NavButton 
          label="Estoque" 
          path="/inventory/register" 
          icon={Package}
          isActive={false}
          onClick={handleNavigation}
          variant="accent"
        />
      )}

      {/* 🏭 BOTÃO PRODUÇÃO */}
      <NavButton 
        label="Produção" 
        path="/production" 
        icon={Factory}
        isActive={pathname === '/production'}
        onClick={handleNavigation}
        variant="warning"
      />
    </div>
  );
};
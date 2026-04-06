'use client';

import React from 'react';
import { UserSessionData } from '@/lib/local-db';
import { cn } from '@/lib/utils';

interface AuthorizedSellerBadgeProps {
  user: UserSessionData;
  className?: string;
}

export function AuthorizedSellerBadge({ user, className }: AuthorizedSellerBadgeProps): React.JSX.Element | null {
  // Utiliza o sistema de roles oficial do Prisma em vez do antigo booleano
  const isVendedor = user.role === 'seller' || user.role === 'admin';
  
  if (!isVendedor) {
    return null;
  }

  // Mapeamento para o novo contrato (fullName)
  const displayName = user.fullName && user.fullName.trim().length > 0 ? user.fullName.trim() : 'Usuário';
  const isActive = true;
  
  // Como nameGender não existe no schema oficial, usamos uma label neutra
  const sellerLabel = 'Vendedor(a) Autorizado(a)';

  return (
    <div className={cn("relative w-full rounded-3xl shadow-lg overflow-hidden bg-white", className)}>
      {/* Faixa rosa mais forte no topo */}
      <div className="h-[35%] bg-[#F5A5C2] w-full absolute top-0 left-0" />
      
      {/* Container principal */}
      <div className="relative flex flex-col items-center pt-6 pb-3">
        {/* Avatar circular com placeholder */}
        <div className="relative z-10 mb-3">
          <div className="w-24 h-24 rounded-full border-2 border-gray-800 overflow-hidden bg-white flex items-center justify-center">
            {/* Placeholder de paisagem */}
            <svg 
              width="96" 
              height="96" 
              viewBox="0 0 96 96" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Céu */}
              <rect width="96" height="60" fill="#87CEEB" />
              {/* Nuvem */}
              <ellipse cx="30" cy="25" rx="12" ry="8" fill="white" opacity="0.9" />
              {/* Colina 1 */}
              <path d="M0 60 L30 50 L60 60 L96 55 L96 96 L0 96 Z" fill="#90EE90" />
              {/* Colina 2 */}
              <path d="M40 60 L60 55 L80 60 L96 58 L96 96 L40 96 Z" fill="#7CCD7C" />
            </svg>
          </div>
        </div>

        {/* Badge "Vendedora Autorizada" */}
        <div className="relative z-10 w-[85%] max-w-[280px] bg-[#F5A5C2] rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            {/* Título */}
            <h3 className="text-sm font-bold text-gray-900 text-center">
              {sellerLabel}
            </h3>
            
            {/* Nome e Status */}
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="text-base font-bold text-gray-900 flex-1 text-center">
                {displayName}
              </span>
              
              {/* Badge de Status */}
              {isActive && (
                <span className="px-2.5 py-1 bg-[#50E3C2] text-white text-xs font-bold rounded-lg whitespace-nowrap">
                  Ativa
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
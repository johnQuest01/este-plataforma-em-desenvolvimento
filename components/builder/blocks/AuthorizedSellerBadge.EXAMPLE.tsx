/**
 * 🎯 EXEMPLO DE MIGRAÇÃO PARA DESIGN SYSTEM
 * 
 * Este arquivo mostra como o AuthorizedSellerBadge seria
 * usando o Design System ao invés de classes hardcoded.
 * 
 * 📦 COMPARAÇÃO:
 * - ANTES: Classes Tailwind hardcoded
 * - DEPOIS: Tokens do Design System
 * 
 * ✅ BENEFÍCIOS:
 * - Mais legível
 * - Mais consistente
 * - Mais fácil de manter
 * - Autocomplete TypeScript
 */

'use client';

import React from 'react';
import { UserData } from '@/lib/local-db';
import { 
  SIZING, 
  SPACING, 
  COLORS, 
  BORDERS, 
  SHADOWS, 
  TYPOGRAPHY,
  cn 
} from '@/lib/design-system';

interface AuthorizedSellerBadgeProps {
  user: UserData;
  className?: string;
}

export function AuthorizedSellerBadgeWithDesignSystem({ user, className }: AuthorizedSellerBadgeProps) {
  const isVendedor = typeof user.isVendedor === 'boolean' && user.isVendedor === true;
  
  if (!isVendedor) {
    return null;
  }

  const displayName = typeof user.name === 'string' && user.name.trim().length > 0 ? user.name.trim() : 'Usuário';
  const isActive = true;
  
  // Determina o gênero do nome para formatação do texto
  const nameGender = typeof user.nameGender === 'string' && (user.nameGender === 'feminino' || user.nameGender === 'masculino')
    ? user.nameGender
    : 'masculino'; // Fallback padrão
  
  const sellerLabel = nameGender === 'feminino' ? 'Vendedora Autorizada' : 'Vendedor Autorizado';

  return (
    <div className={cn(
      "relative",
      SIZING.container.mobile,           // w-full
      BORDERS.radius['3xl'],             // rounded-3xl
      SHADOWS.lg,                        // shadow-lg
      "overflow-hidden",
      COLORS.bg.white,                   // bg-white
      className
    )}>
      {/* Faixa rosa mais forte no topo */}
      <div className={cn(
        "h-[35%] absolute top-0 left-0",
        SIZING.container.mobile,         // w-full
        COLORS.bg.secondary              // bg-[#F5A5C2]
      )} />
      
      {/* Container principal */}
      <div className={cn(
        "relative flex flex-col items-center",
        SPACING.vertical.xl,             // pt-6
        "pb-3"                           // pb-3
      )}>
        {/* Avatar circular com placeholder */}
        <div className={cn(
          "relative z-10",
          SPACING.margin.component        // mb-3
        )}>
          <div className={cn(
            SIZING.avatar.lg,             // w-24 h-24
            BORDERS.radius.full,          // rounded-full
            BORDERS.width.medium,         // border-2
            "border-gray-800",
            "overflow-hidden",
            COLORS.bg.white,              // bg-white
            "flex items-center justify-center"
          )}>
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
        <div className={cn(
          "relative z-10 w-[85%] max-w-[280px]",
          COLORS.bg.secondary,            // bg-[#F5A5C2]
          BORDERS.radius['2xl'],          // rounded-2xl
          SPACING.horizontal.md,          // px-4
          "py-2.5",
          SHADOWS.sm                      // shadow-sm
        )}>
          <div className={cn(
            "flex flex-col items-center",
            SPACING.gap.sm                // gap-2
          )}>
            {/* Título */}
            <h3 className={cn(
              TYPOGRAPHY.size.sm,         // text-sm
              TYPOGRAPHY.weight.bold,     // font-bold
              "text-gray-900 text-center"
            )}>
              {sellerLabel}
            </h3>
            
            {/* Nome e Status */}
            <div className={cn(
              "flex items-center justify-center w-full",
              SPACING.gap.sm              // gap-2
            )}>
              <span className={cn(
                TYPOGRAPHY.size.base,     // text-base
                TYPOGRAPHY.weight.bold,   // font-bold
                "text-gray-900 flex-1 text-center"
              )}>
                {displayName}
              </span>
              
              {/* Badge de Status */}
              {isActive && (
                <span className={cn(
                  SIZING.badge.sm,        // h-5 px-2
                  "py-1",
                  COLORS.bg.success,      // bg-[#50E3C2]
                  COLORS.text.white,      // text-white
                  TYPOGRAPHY.size.xs,     // text-xs
                  TYPOGRAPHY.weight.bold, // font-bold
                  BORDERS.radius.lg,      // rounded-lg
                  "whitespace-nowrap"
                )}>
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

/**
 * 📊 COMPARAÇÃO DE CÓDIGO:
 * 
 * ============================================
 * ANTES (hardcoded):
 * ============================================
 * className="w-full rounded-3xl shadow-lg bg-white"
 * 
 * ============================================
 * DEPOIS (Design System):
 * ============================================
 * className={cn(
 *   SIZING.container.mobile,
 *   BORDERS.radius['3xl'],
 *   SHADOWS.lg,
 *   COLORS.bg.white
 * )}
 * 
 * ============================================
 * VANTAGENS:
 * ============================================
 * 
 * 1. ✅ LEGIBILIDADE
 *    - Antes: "w-full" (o que isso significa?)
 *    - Depois: SIZING.container.mobile (aha! é um container mobile!)
 * 
 * 2. ✅ MANUTENÇÃO
 *    - Antes: Mudar shadow em 50 componentes = 50 edições
 *    - Depois: Mudar SHADOWS.lg em 1 arquivo = 50 componentes atualizados
 * 
 * 3. ✅ CONSISTÊNCIA
 *    - Antes: shadow-lg, shadow-xl, shadow-2xl misturados
 *    - Depois: SHADOWS.component.card (sempre o mesmo para cards)
 * 
 * 4. ✅ AUTOCOMPLETE
 *    - Antes: Memorizar todas as classes Tailwind
 *    - Depois: SIZING. (IDE mostra todas as opções)
 * 
 * 5. ✅ DOCUMENTAÇÃO
 *    - Antes: README separado
 *    - Depois: Código = documentação (comentários inline)
 */

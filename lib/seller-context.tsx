'use client';

/**
 * SellerContext — Contexto global de modo vendedora.
 *
 * Quando o dashboard detecta ?seller=[slug] na URL, ele:
 *  1. Busca os produtos da vendedora no servidor
 *  2. Provê este contexto para TODOS os blocos filhos
 *
 * Blocos que exibem produtos (CategorySectionBlock, ProductGridBlock, etc.)
 * verificam este contexto antes de chamar getProductsAction().
 * Se isSellerMode = true  → mostram apenas os produtos da vendedora
 * Se isSellerMode = false → comportamento normal (todos os produtos)
 */

import React, { createContext, useContext } from 'react';
import type { SellerEcosystemProductDTO } from '@/app/actions/seller-store-actions';

export interface SellerContextValue {
  isSellerMode:   boolean;
  /**
   * true = visitante acessou via link do vendedor SEM estar logado.
   * Neste caso toda navegação além do dashboard e tela de produto
   * deve ser redirecionada para o cadastro.
   */
  isPreviewMode:  boolean;
  sellerSlug:     string;
  /** Produtos do estoque pessoal da vendedora, já carregados pelo DashboardPage */
  sellerProducts: SellerEcosystemProductDTO[];
}

const defaultValue: SellerContextValue = {
  isSellerMode:   false,
  isPreviewMode:  false,
  sellerSlug:     '',
  sellerProducts: [],
};

export const SellerContext = createContext<SellerContextValue>(defaultValue);

/** Hook para consumir o contexto em qualquer componente filho */
export function useSellerContext(): SellerContextValue {
  return useContext(SellerContext);
}

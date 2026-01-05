// path: src/app/product/[id]/page.tsx
import React from 'react';
import { getProductByIdAction } from '@/app/actions/product';
import { INITIAL_BLOCKS } from '@/data/initial-state';
import { BlockConfig } from '@/types/builder';

// ✅ Importamos o Shell Rastreado
import { ProductPageShell } from '@/components/shop/ProductPageShell';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ❌ SEM 'use client' (Mantém Server Side Rendering para SEO)
// ❌ SEM withGuardian aqui (Pois é async)
export default async function ProductPage({ params }: PageProps) {
  // 1. Resolvemos os parâmetros
  const { id } = await params;
  
  // 2. Buscamos dados no servidor
  const product = await getProductByIdAction(id);
  const footerBlock = INITIAL_BLOCKS.find(b => b.type === 'footer') as BlockConfig | undefined;

  // 3. Renderizamos o Shell (que contém o Guardian)
  return (
    <ProductPageShell 
      product={product} 
      footerBlock={footerBlock} 
    />
  );
}
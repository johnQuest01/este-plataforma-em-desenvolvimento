// path: src/app/product/[id]/page.tsx
import React from 'react';
import { getProductByIdAction } from '@/app/actions/product';

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

  // 3. Renderizamos o Shell (Footer agora é global via RootLayoutShell)
  return (
    <ProductPageShell 
      product={product} 
    />
  );
}
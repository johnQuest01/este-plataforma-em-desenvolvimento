import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicStoreAction } from '@/app/actions/seller-store-actions';
import { PublicStorefront } from '@/components/seller-store/PublicStorefront';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const res = await getPublicStoreAction(slug);
  if (!res.success) return { title: 'Loja não encontrada — Maryland' };
  return {
    title:       `Loja de ${res.data.seller.name} — Maryland`,
    description: `Veja os produtos disponíveis na loja de ${res.data.seller.name}. Faça seu pedido direto!`,
  };
}

export default async function SellerStorePage({ params }: Props) {
  const { slug } = await params;
  const res = await getPublicStoreAction(slug);

  if (!res.success) notFound();

  return <PublicStorefront storeData={res.data} sellerSlug={slug} />;
}

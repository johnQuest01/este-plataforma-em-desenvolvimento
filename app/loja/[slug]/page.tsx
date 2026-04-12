import { redirect } from 'next/navigation';

/**
 * Redireciona links antigos /loja/[slug] para o dashboard real com ?seller=[slug].
 * O dashboard é a tela principal do site — o mesmo layout, mesmos blocos,
 * apenas com produtos filtrados pelo estoque da vendedora.
 */
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SellerStoreLegacyRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/dashboard?seller=${slug}`);
}

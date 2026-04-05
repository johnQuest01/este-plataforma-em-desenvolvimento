import { redirect } from 'next/navigation';

/**
 * Histórico de atividades é renderizado por blocos dentro de /account (SPA).
 * Links antigos ou favoritos em /activity-history passam a abrir o mesmo fluxo sem nova árvore de página.
 */
export default function ActivityHistoryPage(): never {
  redirect('/account?view=history');
}

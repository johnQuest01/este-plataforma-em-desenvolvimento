'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, X } from 'lucide-react';
import { SIZING, SPACING, COLORS, BORDERS, SHADOWS, TYPOGRAPHY, cn } from '@/lib/design-system';
import {
  getSellerClientsFromOrdersAction,
  type SellerClientRow,
} from '@/app/actions/session-sync-actions';

/**
 * Lista expansível de clientes para vendedores: contatos derivados de `Order`
 * nas lojas onde o utilizador é `Store.ownerId`.
 */

interface MeusClientesExpandibleProps {
  isOpen: boolean;
  onClose: () => void;
  /** ID Prisma do utilizador (mesmo valor guardado em `LocalDB` / sessão). */
  sellerUserId: string | null;
}

export function MeusClientesExpandible({ isOpen, onClose, sellerUserId }: MeusClientesExpandibleProps) {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [clientes, setClientes] = React.useState<SellerClientRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !sellerUserId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void getSellerClientsFromOrdersAction(sellerUserId).then((response) => {
      if (cancelled) return;
      setLoading(false);
      if (!response.success) {
        setLoadError(response.error ?? 'Não foi possível carregar os clientes.');
        setClientes([]);
        return;
      }
      setClientes(response.clients);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sellerUserId]);

  // Filtrar clientes por termo de busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  );

  const handleAdicionarCliente = () => {
    // TODO: Abrir modal de cadastro de cliente
  };

  const handleVerCliente = (clienteId: string) => {
    // TODO: Abrir detalhes do cliente
    console.log('Ver cliente:', clienteId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            "w-full overflow-hidden",
            COLORS.bg.white              // bg-white
          )}
        >
          <div className={cn(
            SPACING.horizontal.md,       // px-4
            SPACING.vertical.sm,         // py-2
            "w-full"
          )}>
            {/* Header da seção */}
            <div className={cn(
              "flex items-center justify-between",
              SPACING.margin.component   // mb-2
            )}>
              <h2 className={cn(
                TYPOGRAPHY.heading.h4,   // text-lg font-bold
                COLORS.text.black        // text-gray-900
              )}>
                Meus Clientes
              </h2>

              <div className="flex items-center gap-2">
                {/* Botão Adicionar */}
                <button
                  onClick={handleAdicionarCliente}
                  className={cn(
                    SIZING.button.iconSm,      // w-8 h-8
                    "flex items-center justify-center",
                    COLORS.bg.success,         // bg-[#50E3C2]
                    COLORS.text.white,         // text-white
                    BORDERS.radius.lg,         // rounded-lg
                    SHADOWS.sm,                // shadow-sm
                    "transition-all duration-200",
                    "hover:scale-105",
                    "active:scale-95"
                  )}
                >
                  <UserPlus size={16} />
                </button>

                {/* Botão Fechar */}
                <button
                  onClick={onClose}
                  className={cn(
                    SIZING.button.iconSm,      // w-8 h-8
                    "flex items-center justify-center",
                    COLORS.bg.gray,            // bg-gray-100
                    COLORS.text.gray,          // text-gray-600
                    BORDERS.radius.lg,         // rounded-lg
                    "transition-all duration-200",
                    "hover:bg-gray-200",
                    "active:scale-95"
                  )}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className={cn(
              "relative",
              SPACING.margin.component     // mb-2
            )}>
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                COLORS.text.muted,         // text-gray-500
                SIZING.icon.sm             // w-5 h-5
              )} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  SIZING.container.mobile, // w-full
                  SIZING.input.sm,         // h-8
                  "pl-10 pr-3",
                  COLORS.bg.grayLight,     // bg-gray-50
                  BORDERS.radius.lg,       // rounded-lg
                  BORDERS.width.thin,      // border
                  "border-gray-200",
                  TYPOGRAPHY.body.sm,      // text-sm
                  "placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                )}
              />
            </div>

            {/* Lista de Clientes */}
            <div className={cn(
              "max-h-[300px] overflow-y-auto scrollbar-hide",
              "flex flex-col",
              SPACING.gap.xs             // gap-1
            )}>
              {loading ? (
                <div className={cn('flex justify-center py-8', TYPOGRAPHY.caption.xs, COLORS.text.muted)}>
                  A carregar contactos…
                </div>
              ) : loadError ? (
                <p className={cn(TYPOGRAPHY.caption.xs, COLORS.text.muted, 'text-center py-4')}>
                  {loadError}
                </p>
              ) : clientesFiltrados.length === 0 ? (
                // Estado vazio
                <div className={cn(
                  "flex flex-col items-center justify-center py-8",
                  SPACING.gap.sm         // gap-2
                )}>
                  <div className={cn(
                    SIZING.icon.lg,        // w-8 h-8
                    COLORS.text.muted,     // text-gray-500
                    "opacity-50"
                  )}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <p className={cn(
                    TYPOGRAPHY.caption.xs,   // text-xs text-gray-500
                    "text-center"
                  )}>
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Ainda não há pedidos com dados de cliente'}
                  </p>
                </div>
              ) : (
                // Lista de clientes
                <>
                  {clientesFiltrados.map((cliente) => (
                    <motion.button
                      key={cliente.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleVerCliente(cliente.id)}
                      className={cn(
                        SIZING.container.mobile, // w-full
                        "px-3 py-2",
                        COLORS.bg.grayLight,     // bg-gray-50
                        BORDERS.radius.lg,       // rounded-lg
                        BORDERS.width.thin,      // border
                        "border-gray-200",
                        "hover:bg-gray-100",
                        "hover:border-gray-300",
                        "active:scale-[0.98]",
                        "transition-all duration-150",
                        "text-left"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className={cn(
                          SIZING.avatar.xs,        // w-8 h-8
                          BORDERS.radius.full,     // rounded-full
                          COLORS.bg.primary,       // bg-[#5874f6]
                          COLORS.text.white,       // text-white
                          "flex items-center justify-center shrink-0",
                          TYPOGRAPHY.size.xs,      // text-xs
                          TYPOGRAPHY.weight.bold   // font-bold
                        )}>
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            TYPOGRAPHY.size.sm,    // text-sm
                            TYPOGRAPHY.weight.medium, // font-medium
                            COLORS.text.black,     // text-gray-900
                            "truncate"
                          )}>
                            {cliente.nome}
                          </h3>
                          <p className={cn(
                            TYPOGRAPHY.size.xs,    // text-xs
                            COLORS.text.muted,     // text-gray-500
                            "truncate"
                          )}>
                            {cliente.telefone}
                          </p>
                        </div>

                        {/* Indicador de nova janela */}
                        <div className={cn(
                          SIZING.icon.xs,          // w-4 h-4
                          COLORS.text.muted        // text-gray-500
                        )}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </>
              )}
            </div>

            {/* Footer - Total */}
            <div className={cn(
              "pt-2 border-t border-gray-200 mt-2"
            )}>
              <p className={cn(
                TYPOGRAPHY.caption.xs,     // text-xs text-gray-500
                "text-center"
              )}>
                <span className={TYPOGRAPHY.weight.semibold}>
                  {clientesFiltrados.length}
                </span>
                {' '}
                {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

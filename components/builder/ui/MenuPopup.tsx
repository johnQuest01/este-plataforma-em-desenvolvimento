// path: /components/builder/ui/MenuPopup.tsx
'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // ✅ NOVO: Importação do Router
import { 
  X, Home, History, Award, AlertTriangle, CreditCard, Shirt, 
  ShoppingCart, Store, UserCircle, DoorOpen, Share2, User, 
  Heart, Package, HelpCircle, Calculator, LogOut 
} from 'lucide-react';

// 📚 Rex Intelligence: Importação do HOC para monitoramento
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { MenuItem, MenuStyle } from '@/types/builder';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  history: History,
  award: Award,
  alert: AlertTriangle,
  card: CreditCard,
  category: Shirt,
  cart: ShoppingCart,
  hanger: Shirt,
  store: Store,
  account: UserCircle,
  closet: DoorOpen,
  share: Share2,
  user: User,
  heart: Heart,
  inventory: Package,
  calculator: Calculator,
  logout: LogOut,
  default: HelpCircle
};

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  theme?: Partial<MenuStyle>;
  onItemClick?: (item: MenuItem) => void;
}

/**
 * MenuPopupBase: Implementação pura do componente de Menu.
 * Este componente é renderizado via Portal para garantir que fique acima de qualquer camada.
 */
const MenuPopupBase = ({ 
  isOpen, 
  onClose, 
  items, 
  theme, 
  onItemClick 
}: MenuPopupProps) => {
  const isClient = useIsClient();
  const router = useRouter(); // ✅ NOVO: Instância do Router

  const styles = {
    overlay: { backgroundColor: theme?.overlayColor || 'rgba(0,0,0,0.6)' },
    modal: { backgroundColor: theme?.backgroundColor || '#ffffff' },
    text: { color: theme?.textColor || '#1f2937' },
    icon: { color: theme?.iconColor || '#000000' }
  };

  if (!isClient) return null;

  // ✅ NOVO: Função interceptadora de cliques para navegação
  const handleItemInteraction = (item: MenuItem) => {
    // Se o item tiver um link direto ou a ação for 'account', navega para a tela
    if (item.link === '/account' || item.action === 'account' || item.icon === 'account') {
      router.push('/account');
      onClose();
      return;
    }

    // Comportamento padrão
    if (item.link) {
      router.push(item.link);
      onClose();
    } else {
      onItemClick?.(item);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] pointer-events-none flex flex-col justify-center items-center px-2 sm:px-4">
      <AnimatePresence>
        {isOpen && (
          <React.Fragment key="menu-wrapper">
            {/* Overlay de Fundo com Blur */}
            <motion.div
              key="menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 backdrop-blur-sm pointer-events-auto"
              style={styles.overlay}
            />

            {/* Container do Modal (Layout Card detectável pelo Rex) */}
            <motion.div
              key="menu-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative z-[100000] w-full max-w-[380px]",
                "rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem]",
                "bg-white shadow-2xl overflow-hidden pointer-events-auto border border-gray-100",
                "max-h-[90vh] overflow-y-auto scrollbar-hide"
              )}
              style={styles.modal}
            >
              {/* Botão de Fechar */}
              <div className="flex justify-end p-1 sm:p-1.5 md:p-2">
                <button 
                  onClick={onClose} 
                  className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-all active:scale-90 touch-manipulation"
                  style={styles.icon}
                  aria-label="Fechar menu"
                >
                  <X size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Grade de Itens (Botões detectáveis pelo Rex) */}
              <div className={cn(
                "grid grid-cols-3",
                "gap-y-2 gap-x-0.5 sm:gap-y-3 sm:gap-x-1 md:gap-y-4",
                "p-1.5 pb-3 sm:p-2 sm:pb-4 md:p-2.5 md:pb-5"
              )}>
                {items.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] || ICON_MAP.default;
                  const isLogout = item.icon === 'logout';

                  return (
                    <button 
                      key={item.id} 
                      onClick={() => handleItemInteraction(item)} // ✅ NOVO: Usando a função interceptadora
                      className={cn(
                        "flex flex-col items-center justify-center",
                        "gap-1.5 sm:gap-2 md:gap-2.5",
                        "group transition-all active:scale-95 touch-manipulation",
                        "min-h-[70px] sm:min-h-[80px] md:min-h-[90px]",
                        "px-0.5 sm:px-1"
                      )}
                      aria-label={item.label}
                    >
                      <div className={cn(
                        "transform transition-transform",
                        "group-hover:scale-110 group-active:scale-95",
                        "flex items-center justify-center"
                      )}>
                        <IconComponent 
                          strokeWidth={1.5}
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
                          style={{ 
                            color: isLogout ? '#ef4444' : styles.icon.color 
                          }} 
                        />
                      </div>
                      
                      <span 
                        className={cn(
                          "font-semibold text-center leading-tight line-clamp-2",
                          "text-[11px] sm:text-[12px] md:text-[13px]",
                          "px-0.5 w-full"
                        )}
                        style={{ 
                          color: isLogout ? '#ef4444' : styles.text.color 
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

/**
 * ✅ EXPORTAÇÃO COM GUARDIAN OS
 * O Rex Intelligence agora mapeia este arquivo físico e monitora instâncias de POPUP.
 */
export const MenuPopup = withGuardian(
  MenuPopupBase, 
  "components/builder/ui/MenuPopup.tsx", 
  "POPUP"
);
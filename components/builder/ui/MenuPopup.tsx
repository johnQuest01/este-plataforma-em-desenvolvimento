'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, History, Award, AlertTriangle, CreditCard, Shirt, 
  ShoppingCart, Store, UserCircle, DoorOpen, Share2, User, 
  Heart, Package, HelpCircle, Calculator, LogOut 
} from 'lucide-react';
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

export const MenuPopup = ({ 
  isOpen, 
  onClose, 
  items, 
  theme, 
  onItemClick 
}: MenuPopupProps) => {
  const isClient = useIsClient();

  const styles = {
    overlay: { backgroundColor: theme?.overlayColor || 'rgba(0,0,0,0.6)' },
    modal: { backgroundColor: theme?.backgroundColor || '#ffffff' },
    text: { color: theme?.textColor || '#1f2937' },
    icon: { color: theme?.iconColor || '#000000' }
  };

  // Se não estiver no cliente, não renderiza o Portal (evita erro de SSR)
  if (!isClient) return null;

  return createPortal(
    /* A div container deve estar sempre presente para o AnimatePresence 
       poder gerenciar os filhos que entram e saem.
    */
    <div className="fixed inset-0 z-[99999] pointer-events-none flex flex-col justify-start items-center">
      <AnimatePresence>
        {isOpen && (
          <React.Fragment key="menu-wrapper">
            {/* Overlay - Adicionado 'key' e pointer-events-auto */}
            <motion.div
              key="menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 backdrop-blur-sm pointer-events-auto"
              style={styles.overlay}
            />

            {/* Modal - Adicionado 'key' e pointer-events-auto */}
            <motion.div
              key="menu-modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 100 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="relative z-[100000] w-[90%] max-w-[380px] rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              style={styles.modal}
            >
              <div className="flex justify-end p-4">
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-black/5 transition-all active:scale-90"
                  style={styles.icon}
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-y-8 gap-x-2 p-6 pb-10">
                {items.map((item) => {
                  const IconComponent = ICON_MAP[item.icon] || ICON_MAP.default;
                  const isLogout = item.icon === 'logout';

                  return (
                    <button 
                      key={item.id} 
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        "flex flex-col items-center gap-2 group",
                        "transition-all active:scale-95"
                      )}
                    >
                      <div className="transform transition-transform group-hover:scale-110">
                        <IconComponent 
                          size={32} 
                          strokeWidth={1.5} 
                          style={{ 
                            color: isLogout ? '#ef4444' : styles.icon.color 
                          }} 
                        />
                      </div>
                      
                      <span 
                        className="text-[11px] font-semibold text-center leading-tight line-clamp-2"
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
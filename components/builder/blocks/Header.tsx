'use client';

import React, { useState } from 'react';
import { Search, Menu, MapPin, ChevronLeft } from 'lucide-react';
import { BlockConfig, MenuItem } from '@/types/builder';
import { MenuPopup } from '@/components/builder/ui/MenuPopup';
import { useRouter } from 'next/navigation';
import { LocalDB } from '@/lib/local-db';

// --- CONFIGURAÇÃO DOS LINKS ---
const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', label: 'Início', icon: 'home', link: '/dashboard' },
  { id: '16', label: 'Caixa (PDV)', icon: 'calculator', link: '/pos' },
  { id: '17', label: 'Produção', icon: 'inventory', link: '/production' }, 
  { id: '2', label: 'Histórico', icon: 'history', link: '/history' },
  { id: '3', label: 'Mais Vendidos', icon: 'award', link: '/bestsellers' },
  { id: '4', label: 'Avisos', icon: 'alert', link: '/alerts' },
  { id: '5', label: 'Pagamentos', icon: 'card', link: '/payments' },
  { id: '6', label: 'Categorias', icon: 'category', link: '/categories' },
  { id: '7', label: 'Compras', icon: 'cart', link: '/cart' },
  { id: '8', label: 'Modinha', icon: 'hanger', link: '/trends' },
  { id: '9', label: 'Lojas oficiais', icon: 'store', link: '/official-stores' },
  { id: '10', label: 'Minha conta', icon: 'account', link: '/account' },
  { id: '11', label: 'Meu closet', icon: 'closet', link: '/closet' },
  { id: '12', label: 'Redes Sociais', icon: 'share', link: '/social' },
  { id: '13', label: 'Minhas informações', icon: 'user', link: '/profile' },
  { id: '14', label: 'Favoritos', icon: 'heart', link: '/favorites' },
  { id: '15', label: 'Meu Inventário', icon: 'inventory', link: '/inventory' },
  { id: 'logout', label: 'Sair do App', icon: 'logout' }, 
];

interface StoreHeaderProps {
  style?: { bgColor?: string; textColor?: string; };
  data?: { address?: string; title?: string; };
  showBack?: boolean;
  onBack?: () => void;
}

export const StoreHeader = ({ 
  style = { bgColor: '#5874f6', textColor: '#ffffff' }, 
  data = { address: 'Selecione o endereço', title: 'Loja' },
  showBack = false,
  onBack
}: StoreHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleItemClick = (item: MenuItem) => {
    setIsMenuOpen(false); // Fecha o menu primeiro

    if (item.id === 'logout') {
      setTimeout(() => {
        if (window.confirm("Deseja realmente sair?")) {
          LocalDB.clearUser();
          router.replace('/'); 
        }
      }, 100);
      return;
    }

    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <>
      <div 
        className="flex flex-col gap-3 p-4 pb-4 shadow-md relative z-[100] transition-colors duration-300"
        style={{ backgroundColor: style.bgColor, color: style.textColor }}
      >
        <div className="flex items-center justify-between gap-3 pt-safe-top">
          {showBack ? (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors active:scale-90 flex items-center gap-1 shrink-0"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
              <span className="font-bold text-sm hidden sm:inline">Voltar</span>
            </button>
          ) : (
            <h1 className="text-2xl font-black tracking-tight shrink-0">{data.title || 'Loja'}</h1>
          )}

          <div className="flex-1 h-10 bg-white rounded-full flex items-center px-4 shadow-inner overflow-hidden">
            <Search size={18} className="text-gray-400 mr-2 shrink-0" />
            <span className="text-gray-400 text-sm truncate select-none">Buscar na loja...</span>
          </div>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="cursor-pointer shrink-0 active:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/10"
          >
            <Menu size={32} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium opacity-90 pl-1">
          <MapPin size={18} />
          <span className="truncate text-xs sm:text-sm">{data.address}</span>
        </div>
      </div>

      <MenuPopup 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        items={MOCK_MENU_ITEMS}
        onItemClick={handleItemClick}
      />
    </>
  );
};

export const HeaderBlock = ({ config }: { config: BlockConfig }) => {
  return (
    <StoreHeader 
      style={config.style}
      data={{ 
        address: config.data.address as string,
        title: 'Loja'
      }}
    />
  );
};
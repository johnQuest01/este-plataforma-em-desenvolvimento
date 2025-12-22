'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { BlockConfig, FooterItem, SaleRecord } from '@/types/builder';

const MOCK_SALES: SaleRecord[] = [
  { id: '1', productName: 'Camiseta Oversized Black', totalValue: 380.00, quantity: 2, date: '2025-12-20T14:30:00', sellerName: 'Amanda Costa' },
  { id: '2', productName: 'Tênis Urban Sport', totalValue: 1250.90, quantity: 1, date: '2025-12-19T10:15:00', sellerName: 'Mariana Silva' },
  { id: '3', productName: 'Calça Cargo Utility', totalValue: 245.00, quantity: 1, date: '2025-12-18T09:45:00', sellerName: 'Amanda Costa' },
];

const THEME_PRIMARY = '#5874f6';

const FOOTER_ITEMS: FooterItem[] = [
  { id: 'footer_cart', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'footer_heart', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'footer_home', icon: 'sync', isVisible: true, isHighlight: true, route: '/' },
  { id: 'footer_verified', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'footer_package', icon: 'package-check', isVisible: true, route: '/inventory' }
];

export default function HistoryPage() {
  const [activeView, setActiveView] = useState<'main' | 'total-sales'>('main');
  const [searchQuery, setSearchQuery] = useState('');

  const isBrunoFound = searchQuery.toLowerCase().includes('bruno');

  const handleAction = (action: string, payload?: unknown) => {
    switch (action) {
      case 'search_input':
        if (typeof payload === 'string') setSearchQuery(payload);
        break;
      case 'view_total_sales':
        setActiveView('total-sales');
        break;
      case 'back_to_history':
        setActiveView('main');
        break;
      default:
        console.log(`Ação: ${action}`, payload);
    }
  };

  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      <div className="w-full h-full bg-white flex flex-col relative overflow-hidden lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px] lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl">
        
        <StoreHeader 
          showBack={activeView !== 'main'} 
          onBack={() => setActiveView('main')}
          data={{ 
            title: activeView === 'main' ? 'Histórico' : 'Vendas', 
            address: activeView === 'main' ? 'Gestão Maryland' : 'Relatório de Vendas' 
          }} 
          style={{ bgColor: THEME_PRIMARY, textColor: '#ffffff' }} 
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white pb-24">
          {activeView === 'main' ? (
            <div className="animate-in fade-in duration-500">
              <BlockRenderer 
                config={{
                  id: 'search_block',
                  type: 'history-search',
                  isVisible: true,
                  style: { bgColor: 'white' },
                  data: { title: 'Histórico' }
                }} 
                onAction={handleAction} 
              />

              {!isBrunoFound && (
                <BlockRenderer 
                  config={{
                    id: 'sales_links_block',
                    type: 'history-links',
                    isVisible: true,
                    style: { bgColor: 'white' },
                    data: {} 
                  }} 
                  onAction={handleAction} 
                />
              )}

              {isBrunoFound && (
                <div className="px-4 animate-in slide-in-from-bottom-4 duration-500 mt-2">
                  <BlockRenderer 
                    config={{
                      id: 'result_card_bruno',
                      type: 'client-history-card',
                      isVisible: true,
                      style: { bgColor: 'transparent' },
                      data: {
                        name: 'Bruno',
                        role: 'Lojista: cliente',
                        address: 'Rua José',
                        since: 'Cliente há 2 anos',
                        contact: 'instagram/bruno_dev',
                        image: 'https://placehold.co/150x150/e0e0e0/333333?text=B'
                      }
                    }} 
                    onAction={handleAction} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300 h-full">
              <BlockRenderer 
                config={{
                  id: 'total_sales_view',
                  type: 'total-sales',
                  isVisible: true,
                  style: { bgColor: '#ffffff', accentColor: THEME_PRIMARY },
                  data: { sales: MOCK_SALES }
                }} 
                onAction={handleAction} 
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full shrink-0 pb-safe-bottom bg-white border-t border-gray-100 z-50">
          <ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: THEME_PRIMARY }} />
        </div>
      </div>
    </main>
  );
}
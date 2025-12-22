// components/builder/ui/ButtonsFooter.tsx
'use client';

import React, { useMemo } from 'react';
import { 
    ShoppingCart, Heart, Package, BadgeCheck, 
    RefreshCw, Check, HelpCircle, Box 
} from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { usePathname } from 'next/navigation';
import Link from 'next/link'; 
import { FooterItem, BlockStyle } from '@/types/builder';

interface ButtonsFooterProps {
    items: FooterItem[];
    style: BlockStyle;
}

export const ButtonsFooter = ({ items, style }: ButtonsFooterProps) => {
    const pathname = usePathname();

    // 1. Filtra itens visíveis (Memorizado para performance)
    const visibleItems = useMemo(() => {
        return items.filter(item => item.isVisible);
    }, [items]);

    // 2. ESTADO DERIVADO (A Correção Definitiva):
    // Não usamos useState nem useEffect. Calculamos o ID ativo baseando-se diretamente na URL atual.
    // Se o usuário navegar (clicar ou voltar), o pathname muda e isso recalcula automaticamente.
    const activeId = useMemo(() => {
        const activeItem = visibleItems.find(item => item.route === pathname);
        // Retorna o item encontrado ou 'f3' (Home) como padrão se estiver em uma rota desconhecida
        return activeItem ? activeItem.id : 'f3';
    }, [pathname, visibleItems]);

    const renderIcon = (name: string, isActive: boolean) => {
        const size = isActive ? 28 : 20; 
        const props = { size, strokeWidth: 2.5 };
        
        const activeClass = "text-white";
        const inactiveClass = "text-[#5874f6]";

        switch (name) {
            case 'cart': return <ShoppingCart {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            case 'heart': return <Heart {...props} className={cn(isActive ? "fill-white text-white" : "fill-[#ff69b4] text-black")} />;
            case 'sync': return <RefreshCw {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            case 'verified': return <BadgeCheck {...props} className={cn(isActive ? "text-white fill-white/20" : "text-[#5874f6] fill-blue-100")} />;
            case 'package-check':
                return (
                    <div className="relative flex items-center justify-center">
                        <Package size={size} strokeWidth={2.5} className={cn(isActive ? activeClass : inactiveClass)} />
                        <div className={cn("absolute -top-2 -right-2 rounded-full w-4 h-4 flex items-center justify-center border-2", isActive ? "bg-white text-[#5874f6] border-[#5874f6]" : "bg-[#5874f6] text-white border-white")}>
                            <Check size={8} strokeWidth={4} />
                        </div>
                    </div>
                );
            case 'inventory': return <Box {...props} className={cn(isActive ? activeClass : inactiveClass)} />;
            default: return <HelpCircle {...props} className={cn(isActive ? activeClass : "text-gray-400")} />;
        }
    };

    return (
        <div className="w-full relative h-[80px] flex items-end pointer-events-none">
            
            {/* BARRA DE FUNDO */}
            <div
                className="absolute bottom-0 left-0 w-full h-[60px] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pointer-events-auto"
                style={{ backgroundColor: style.bgColor || '#5874f6' }}
            />

            {/* BOTÕES */}
            <div className="relative z-10 w-full flex justify-evenly items-end h-full px-2 pointer-events-auto">
                {visibleItems.map((item) => {
                    // O botão "sabe" se está ativo comparando seu ID com o ID calculado pela URL
                    const isActive = item.id === activeId;
                    const transitionClass = "transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)";

                    // Se tiver rota, usamos Link. 
                    // Removemos o onClick manual, pois a mudança de rota via Link
                    // já vai atualizar o pathname, que por sua vez atualiza o activeId automaticamente.
                    if (item.route) {
                        return (
                            <Link
                                key={item.id}
                                href={item.route}
                                prefetch={true} 
                                className={cn(
                                    "flex items-center justify-center shadow-xl rounded-full border-4",
                                    transitionClass,
                                    isActive 
                                        ? "w-16 h-16 -mt-6 mb-4 border-white ring-4 ring-[#5874f6]/20 z-20" 
                                        : "w-12 h-12 mt-4 mb-3 border-transparent bg-white z-10",
                                    isActive ? "bg-[#5874f6]" : "bg-white" 
                                )}
                            >
                                {renderIcon(item.icon, isActive)}
                            </Link>
                        );
                    }

                    // Fallback para botões sem rota (apenas visual - raro no footer atual)
                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "flex items-center justify-center shadow-xl rounded-full border-4",
                                transitionClass,
                                isActive 
                                    ? "w-16 h-16 -mt-6 mb-4 border-white ring-4 ring-[#5874f6]/20 z-20" 
                                    : "w-12 h-12 mt-4 mb-3 border-transparent bg-white z-10",
                                isActive ? "bg-[#5874f6]" : "bg-white" 
                            )}
                        >
                            {renderIcon(item.icon, isActive)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Store } from 'lucide-react';
import clsx from 'clsx';
import { LocalDB } from '@/lib/local-db';

const menuItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
  { icon: Package, label: 'Produtos', path: '/dashboard/products' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/dashboard/orders' },
  { icon: Users, label: 'Clientes', path: '/dashboard/customers' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    LocalDB.clearUser(); // Limpa o banco local
    router.push('/');    // Redireciona para a tela de Cadastro/Login (app/page.tsx)
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50 hidden md:flex">
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <div className="w-10 h-10 bg-[#5874f6] rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-200">
          <Store size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-black text-gray-900 text-lg leading-none">B2B Engine</h1>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Painel Lojista</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={clsx("flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group", isActive ? "bg-[#5874f6] text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={clsx(isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-bold text-sm group">
          <LogOut size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          <span>Sair do App</span>
        </button>
      </div>
    </aside>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { UserRole } from '@/backend/core/models/UserRole';

interface SidebarProps {
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay para fechar o sidebar quando clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Botão do hambúrguer */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-200 group"
        title="Menu"
      >
        <Menu size={20} className="text-gray-300 group-hover:text-white transition-colors" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header do sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button
            onClick={closeSidebar}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Conteúdo do sidebar */}
        <div className="p-4 space-y-2">
          {/* Botões de navegação (apenas para Admin) */}
          {userRole === UserRole.ADMIN && (
            <>
              <Link href="/allocation" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                >
                  Alocação Semanal
                </Button>
              </Link>
              <Link href="/projetos" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                >
                  Gerenciar Projetos
                </Button>
              </Link>
              <Link href="/pessoas" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                >
                  Gerenciar Pessoas
                </Button>
              </Link>
              <Link href="/usuarios" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                >
                  Gerenciar Usuários
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

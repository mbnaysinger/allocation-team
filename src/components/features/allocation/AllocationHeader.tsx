import React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const AllocationHeader = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="bg-slate-800 text-white p-8 border-b border-slate-700/50 shadow-lg relative">
      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-200 group"
        title="Sair"
      >
        <LogOut size={20} className="text-gray-300 group-hover:text-white transition-colors" />
      </button>
      
      {/* Conteúdo centralizado */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Painel de Alocação Semanal
        </h1>
        <div className="text-lg text-cyan-400">
          Time de Soluções
        </div>
      </div>
    </div>
  );
};

export default AllocationHeader; 
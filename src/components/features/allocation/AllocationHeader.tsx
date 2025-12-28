import React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { UserRole } from "@/backend/core/models/UserRole";
import Sidebar from "@/components/ui/Sidebar";

const AllocationHeader = ({ userRole }: { userRole: UserRole }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Sidebar com menu hambúrguer */}
      <Sidebar userRole={userRole} />

      <div className="flex flex-col gap-4">
        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-200 group"
          title="Sair"
        >
          <LogOut size={20} className="text-gray-300 group-hover:text-white transition-colors" />
        </button>
        
        {/* Conteúdo à esquerda */}
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white pt-4 pl-20">
            Alocação Semanal
            <span className="text-cyan-400 text-xl text-center pl-6">Soluções Corporativas e de Negócios</span>
          </h2>
        </div>
      </div>
    </>
  );
};

export default AllocationHeader; 
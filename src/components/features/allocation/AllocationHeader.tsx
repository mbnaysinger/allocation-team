import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@/backend/core/models/UserRole";

const AllocationHeader = ({ userRole }: { userRole: UserRole }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
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
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white pt-4 pl-4">
          Alocação Semanal
        </h2>
        <div className="text-sm text-cyan-400 pl-4">
          Time de Soluções
        </div>
        {/* Botões de Navegação (Apenas para Admin) */}
      {userRole === UserRole.ADMIN && (
        <div className="flex justify-center gap-4 pb-4">
          <Link href="/projetos" passHref>
            <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white">
              Gerenciar Projetos
            </Button>
          </Link>
          <Link href="/pessoas" passHref>
            <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white">
              Gerenciar Pessoas
            </Button>
          </Link>
          <Link href="/usuarios" passHref>
            <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white">
              Gerenciar Usuários
            </Button>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
};

export default AllocationHeader; 
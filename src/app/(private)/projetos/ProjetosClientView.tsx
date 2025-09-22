'use client';

import React from 'react';
import { Projeto } from '@/core/models';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { Eye, Pencil } from 'lucide-react';

interface ProjetosClientViewProps {
  projetos: Projeto[];
}

const ProjetosClientView: React.FC<ProjetosClientViewProps> = ({ projetos }) => {
  return (
    <div className="p-8">
      <Heading level={1} aria-label="Gestão de Projetos">Gestão de Projetos</Heading>

      <div className="mt-8 bg-gray-800/50 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-accent/20">
              <tr>
                <th className="p-4 font-semibold">Abreviatura</th>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Entidade</th>
                <th className="p-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((projeto) => (
                <tr key={projeto.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-mono text-accent">{projeto.abreviatura}</td>
                  <td className="p-4">{projeto.nome}</td>
                  <td className="p-4">{projeto.entidade || 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" className="p-2">
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm" className="p-2">
                        <Pencil size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjetosClientView;

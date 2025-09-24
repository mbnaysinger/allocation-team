import React from 'react';
import ProjetosClientView from './ProjetosClientView';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { Projeto } from '@/backend/core/models';

async function getProjetosData(): Promise<Projeto[]> {
  try {
    const buscarProjetos = dependencyFactory.createBuscarProjetos();
    const projetos = await buscarProjetos.execute();
    return projetos;
  } catch (error) {
    console.error("Falha ao buscar dados de projetos diretamente do serviço:", error);
    return [];
  }
}

export default async function ProjetosPage() {
  const projetos = await getProjetosData();

  return (
    <main className="min-h-screen bg-bg text-text-light">
      <div className="max-w-8xl mx-auto">
        <ProjetosClientView projetos={projetos} />
      </div>
    </main>
  );
}

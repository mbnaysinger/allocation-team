import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function GET() {
  try {
    
    const projetoService = dependencyFactory.createProjetoService();
    const projetos = await projetoService.buscarProjetosAtivos();

    return NextResponse.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
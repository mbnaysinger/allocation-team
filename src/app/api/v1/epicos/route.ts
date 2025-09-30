import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

const epicoService = dependencyFactory.createEpicoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projetoId = searchParams.get('projetoId');
    
    const epicoService = dependencyFactory.createEpicoService();
    
    let epicos;
    if (projetoId) {
      epicos = await epicoService.buscarEpicosPorProjeto(projetoId);
    } else {
      epicos = await epicoService.buscarEpicos();
    }
    
    const epicosComTarefas = await Promise.all(
      epicos.map(async (epico) => {
        const tarefaService = dependencyFactory.createTarefaService();
        const tarefas = await tarefaService.buscarTarefasPorEpico(epico.epicoId);
        return {
          ...epico,
          tarefas
        };
      })
    );

    return NextResponse.json(epicosComTarefas);
  } catch (error) {
    console.error('Erro ao buscar épicos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("POST /api/v1/epicos - body:", body);
  const { nome, descricao, status, dataInicio, dataFimPrevisto, projetoId } = body;

  if (!nome || !status || !dataInicio || !dataFimPrevisto || !projetoId) {
    return new Response(JSON.stringify({ message: 'Campos obrigatórios não preenchidos' }), { status: 400 });
  }

  try {
    const epico = await epicoService.criarEpico({ nome, descricao, status, dataInicio, dataFimPrevisto, projetoId });
    return new Response(JSON.stringify(epico), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Erro ao criar épico' }), { status: 500 });
  }
}

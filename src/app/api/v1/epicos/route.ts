import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { DadosEpico } from '@/backend/core/models/projeto/Epico';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const epicoService = dependencyFactory.createEpicoService();
    
    const dadosEpico: DadosEpico = {
      nome: body.title || body.nome,
      descricao: body.description || body.descricao || '',
      projetoId: body.projectId,
      status: body.status || 'planejado',
      dataInicio: body.startDate || body.dataInicio || new Date(),
      dataFimPrevisto: body.endDate || body.dataFimPrevisto || new Date(),
      dataFimReal: body.dataFimReal || new Date(),
    };
    
    const novoEpico = await epicoService.criarEpico(dadosEpico);
    
    return NextResponse.json(novoEpico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar épico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

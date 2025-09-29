import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { DadosTarefa } from '@/backend/core/models/projeto/Tarefa';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const epicoId = searchParams.get('epicoId');
    
    const tarefaService = dependencyFactory.createTarefaService();
    
    let tarefas;
    if (epicoId) {
      tarefas = await tarefaService.buscarTarefasPorEpico(epicoId);
    } else {
      tarefas = await tarefaService.buscarTarefas();
    }
    
    return NextResponse.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tarefaService = dependencyFactory.createTarefaService();
    
    const dadosTarefa: DadosTarefa = {
      nome: body.title || body.nome,
      descricao: body.description || body.descricao || '',
      epicoId: body.epicId,
      executorId: body.assignee ? [body.assignee] : [],
      status: body.status || 'nao_iniciada',
      dataInicio: body.dataInicio || new Date(),
      dataFimPrevisto: body.dueDate || body.dataFimPrevisto || new Date(),
      dataFimReal: body.dataFimReal || new Date(),
    };
    
    const novaTarefa = await tarefaService.criarTarefa(dadosTarefa);
    
    return NextResponse.json(novaTarefa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { Projeto, DadosProjeto } from '@/backend/core/models/projeto/Projeto';
import { Epico } from '@/backend/core/models/projeto/Epico';
import { Tarefa } from '@/backend/core/models/projeto/Tarefa';

export async function GET() {
  try {
    const projetoService = dependencyFactory.createProjetoService();
    const epicoService = dependencyFactory.createEpicoService();
    
    const projetos = await projetoService.buscarProjetos();
    const projetosComEpicos = await Promise.all(
      projetos.map(async (projeto) => {
        const epicos = await epicoService.buscarEpicosPorProjeto(projeto.projetoId);
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
        return {
          ...projeto,
          epicos: epicosComTarefas
        };
      })
    );

    return NextResponse.json(projetosComEpicos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projetoService = dependencyFactory.createProjetoService();
    
    const dadosProjeto: DadosProjeto = {
      abreviatura: body.abreviatura || body.title?.substring(0, 3).toUpperCase(),
      nome: body.title || body.nome,
      descricao: body.description || body.descricao || '',
      entidade: body.entidade,
      linkDocumentacao: body.linkDocumentacao,
      responsavelId: body.owner || body.responsavelId,
      fase: body.fase || 'internal',
      status: body.status || 'backlog',
      dataInicio: body.startDate || body.dataInicio || new Date(),
      dataFimPrevisto: body.endDate || body.dataFimPrevisto || new Date(),
      dataFimReal: body.dataFimReal || new Date(),
    };
    
    const novoProjeto = await projetoService.criarProjeto(dadosProjeto);
    
    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
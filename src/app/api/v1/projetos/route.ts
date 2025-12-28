import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { DadosProjeto } from '@/backend/core/models/projeto/Projeto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const squads = searchParams.getAll('squads');
    const pessoas = searchParams.getAll('pessoas');

    const projetoService = dependencyFactory.createProjetoService();
    
    const projetos = await projetoService.buscarProjetos(
      squads.length > 0 ? squads : undefined,
      pessoas.length > 0 ? pessoas : undefined
    );

    return NextResponse.json(projetos);
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
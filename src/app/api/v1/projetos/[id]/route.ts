import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'ID do projeto não encontrado' }, { status: 400 });
    }
    const dados = await request.json();
    const projetoService = dependencyFactory.createProjetoService();
    const projeto = await projetoService.atualizarProjeto(id, dados);
    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
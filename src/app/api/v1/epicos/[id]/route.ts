import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'ID do épico não encontrado' }, { status: 400 });
    }
    const dados = await request.json();
    const projetoService = dependencyFactory.createEpicoService();
    const projeto = await projetoService.atualizarEpico(id, dados);
    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao atualizar épico:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
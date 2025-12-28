import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { StatusAtividade } from '@/backend/core/models/Atividade';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'ID da atividade e novo status são obrigatórios.' }, { status: 400 });
    }

    // Validar se o status é um dos valores permitidos
    const validStatus: StatusAtividade[] = ['planejada', 'concluida', 'nao_realizada'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ message: 'Status inválido.' }, { status: 400 });
    }

    const atividadeService = dependencyFactory.createAtividadeService();
    await atividadeService.updateStatus(id, status);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return NextResponse.json({ message: 'Erro ao atualizar o status da atividade.', error: errorMessage }, { status: 500 });
  }
}


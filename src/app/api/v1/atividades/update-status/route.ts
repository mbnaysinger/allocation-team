import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/infrastructure/factories/DependencyFactory';
import { StatusAtividade } from '@/core/models';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'ID da atividade e novo status são obrigatórios.' }, { status: 400 });
    }

    // Validar se o status é um dos valores permitidos
    const validStatus: StatusAtividade[] = ['planejado', 'concluido', 'nao_realizado'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ message: 'Status inválido.' }, { status: 400 });
    }

    const atualizarStatusAtividade = dependencyFactory.createAtualizarAtividade();
    const atividadeAtualizada = await atualizarStatusAtividade.updateStatus(id, status);

    return NextResponse.json(atividadeAtualizada, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return NextResponse.json({ message: 'Erro ao atualizar o status da atividade.', error: errorMessage }, { status: 500 });
  }
}

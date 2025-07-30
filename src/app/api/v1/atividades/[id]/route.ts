import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../../infrastructure/factories/DependencyFactory';
import { DadosAtividade } from '../../../../../core/models';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dados: Partial<DadosAtividade> = await request.json();

    const atualizarAtividade = dependencyFactory.createAtualizarAtividade();
    const atividadeAtualizada = await atualizarAtividade.execute(id, dados);

    return NextResponse.json(atividadeAtualizada);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao atualizar atividade:', err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletarAtividade = dependencyFactory.createDeletarAtividade();
    await deletarAtividade.execute(id);

    return NextResponse.json({ message: 'Atividade deletada com sucesso.' }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao deletar atividade:', err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
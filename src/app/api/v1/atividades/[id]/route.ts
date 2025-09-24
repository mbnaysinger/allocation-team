import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../../backend/infrastructure/factories/DependencyFactory';


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
import { NextResponse } from 'next/server';
import { AtualizarAtividade } from '../../../../../core/services/AtualizarAtividade';
import { MongoDbAtividadeRepository } from '../../../../../infrastructure/repositories/mongodb/MongoDbAtividadeRepository';
import { DadosAtividade } from '../../../../../core/models';
import { DeletarAtividade } from '../../../../../core/services/DeletarAtividade';

interface ActivityRouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: ActivityRouteParams) {
  try {
    const { id } = params; // Captura o ID da URL
    const dados: Partial<DadosAtividade> = await request.json();

    const atividadeRepository = new MongoDbAtividadeRepository();
    const atualizarAtividade = new AtualizarAtividade(atividadeRepository); // Chama o serviço

    const atividadeAtualizada = await atualizarAtividade.execute(id, dados);

    return NextResponse.json(atividadeAtualizada);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao atualizar atividade:', err.message);

    // Retorna a mensagem de erro da validação do serviço
    return NextResponse.json(
      { message: err.message },
      { status: 400 } // Bad Request para erros de validação
    );
  }
}

export async function DELETE(request: Request, { params }: ActivityRouteParams) {
  try {
    const { id } = params;

    const atividadeRepository = new MongoDbAtividadeRepository();
    const deletarAtividade = new DeletarAtividade(atividadeRepository); // Chama o serviço

    await deletarAtividade.execute(id);

    return NextResponse.json({ message: 'Atividade deletada com sucesso.' }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao deletar atividade:', err.message);
    
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
} 
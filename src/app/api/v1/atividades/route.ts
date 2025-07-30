import { NextResponse } from 'next/server';
import { BuscarAlocacaoSemana } from '../../../../core/services/BuscarAlocacaoSemana';
import { MongoDbAtividadeRepository } from '../../../../infrastructure/repositories/mongodb/MongoDbAtividadeRepository';
import { MongoDbPessoaRepository } from '../../../../infrastructure/repositories/mongodb/MongoDbPessoaRepository';
import { MongoDbProjetoRepository } from '../../../../infrastructure/repositories/mongodb/MongoDbProjetoRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { message: 'Parâmetros dataInicio e dataFim são obrigatórios.' },
        { status: 400 }
      );
    }

    // --- Injeção de Dependência Manual (futuramente usaremos uma Factory) ---
    const atividadeRepository = new MongoDbAtividadeRepository();
    const pessoaRepository = new MongoDbPessoaRepository();
    const projetoRepository = new MongoDbProjetoRepository();

    const buscarAlocacaoSemana = new BuscarAlocacaoSemana(
      pessoaRepository,
      projetoRepository,
      atividadeRepository
    );

    const alocacao = await buscarAlocacaoSemana.execute({ dataInicio, dataFim });

    return NextResponse.json(alocacao);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API de alocação:', err.message);
    return NextResponse.json(
      { message: 'Erro interno do servidor.', error: err.message },
      { status: 500 }
    );
  }
}

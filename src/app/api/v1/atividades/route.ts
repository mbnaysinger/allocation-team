import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../backend/infrastructure/factories/DependencyFactory';
import { DadosAtividade } from '../../../../core/models';

/**
 * @swagger
 * /api/v1/atividades:
 *   get:
 *     summary: Retorna a alocação de uma semana.
 *     description: Busca todas as pessoas, projetos e atividades dentro de um período de datas especificado.
 *     tags:
 *       - Atividades
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início da semana (YYYY-MM-DD).
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim da semana (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Dados da alocação da semana.
 */
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

    const buscarAlocacaoSemana = dependencyFactory.createBuscarAlocacaoSemana();
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

/**
 * @swagger
 * /api/v1/atividades:
 *   post:
 *     summary: Cria uma nova atividade.
 *     description: Adiciona uma nova atividade ao sistema.
 *     tags:
 *       - Atividades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               data: { type: string, format: date }
 *               pessoaId: { type: string }
 *               tipo: { type: string, enum: [Projeto, Melhoria, Sustentação] }
 *               projetoId: { type: string }
 *               horas: { type: number }
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso.
 */
export async function POST(request: Request) {
  try {
    const dados: DadosAtividade = await request.json();

    const criarAtividade = dependencyFactory.createCriarAtividade();
    const novaAtividade = await criarAtividade.execute(dados);

    return NextResponse.json(novaAtividade, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao criar atividade:', err.message);
    
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}
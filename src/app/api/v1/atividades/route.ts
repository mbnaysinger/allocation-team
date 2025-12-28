import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../backend/infrastructure/factories/DependencyFactory';
import { DadosAtividade } from '../../../../backend/core/models/Atividade';

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
 *               tempo: { type: number, description: 'Tempo em segundos' }
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso.
 */
export async function POST(request: Request) {
  try {
    const dados: DadosAtividade = await request.json();

    const atividadeService = dependencyFactory.createAtividadeService();
    const novaAtividade = await atividadeService.add(dados);

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
import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pessoaId, semana, comentario } = body;

    if (!pessoaId || !semana || typeof comentario !== 'string') {
      return NextResponse.json({ message: 'Campos pessoaId, semana e comentario são obrigatórios.' }, { status: 400 });
    }

    const salvarResumoSemanal = dependencyFactory.createSalvarResumoSemanal();
    const resumoSalvo = await salvarResumoSemanal.execute({ pessoaId, semana, comentario });

    return NextResponse.json(resumoSalvo, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return NextResponse.json({ message: 'Erro ao salvar o resumo semanal.', error: errorMessage }, { status: 500 });
  }
}

// src/app/api/v1/resumo-semanal/semana/[semana]/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ semana: string }> }
) {
  try {
    const { semana } = await params;
    const { searchParams } = new URL(request.url);
    const pessoaIds = searchParams.getAll('pessoaIds');

    if (!semana) {
      return NextResponse.json({ message: 'O parâmetro semana é obrigatório' }, { status: 400 });
    }

    if (!pessoaIds || pessoaIds.length === 0) {
      return NextResponse.json({ resumos: [] });
    }

    const resumosSemanaisService = dependencyFactory.createResumosSemanaisService();
    const resumos = await resumosSemanaisService.getInitialLoadData(pessoaIds, semana);

    return NextResponse.json(resumos);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
    return NextResponse.json({ message: 'Erro ao buscar resumos semanais.', error: errorMessage }, { status: 500 });
  }
}

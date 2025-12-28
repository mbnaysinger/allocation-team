import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function POST(req: NextRequest) {
  try {
    const { pessoaId, data, orderedActivityIds } = await req.json();

    if (!pessoaId || !data || !orderedActivityIds || !Array.isArray(orderedActivityIds)) {
      return NextResponse.json({ message: 'Dados inválidos para reordenação.' }, { status: 400 });
    }

    const atividadeService = dependencyFactory.createAtividadeService();
    await atividadeService.reorderActivities(pessoaId, data, orderedActivityIds);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao reordenar atividades:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao reordenar atividades.' }, { status: 500 });
  }
}

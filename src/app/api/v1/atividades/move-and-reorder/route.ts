import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';

export async function POST(req: NextRequest) {
  try {
    const { atividadeId, pessoaId, novaData, novaOrderedActivityIds } = await req.json();

    if (!atividadeId || !pessoaId || !novaData || !novaOrderedActivityIds || !Array.isArray(novaOrderedActivityIds)) {
      return NextResponse.json({ message: 'Dados inválidos para mover e reordenar atividade.' }, { status: 400 });
    }

    const atividadeService = dependencyFactory.createAtividadeService();
    await atividadeService.moveColumnAndReorderActivity(atividadeId, pessoaId, novaData, novaOrderedActivityIds);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao mover e reordenar atividade:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao mover e reordenar atividade.' }, { status: 500 });
  }
}

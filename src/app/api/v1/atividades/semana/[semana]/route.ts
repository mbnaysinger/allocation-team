import { NextResponse } from 'next/server';
import { dependencyFactory } from '@/backend/infrastructure/factories/DependencyFactory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { UserRole } from '@/backend/core/models/UserRole';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ semana: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;
    const personIds = session?.user?.personIds;
    const { semana } = await params;

    if (!semana) {
      return NextResponse.json({ message: 'O parâmetro semana é obrigatório' }, { status: 400 });
    }

    const buscarAlocacaoSemana = dependencyFactory.createBuscarAlocacaoSemana();

    // Se o usuário for USER e não tiver pessoas associadas, retorna vazio.
    if (userRole === UserRole.USER && (!personIds || personIds.length === 0)) {
      return NextResponse.json({ pessoas: [], projetos: [], atividades: [] });
    }

    const alocacaoData = await buscarAlocacaoSemana.execute({
      semana,
      personIds: userRole === UserRole.ADMIN ? undefined : personIds,
    });

    return NextResponse.json(alocacaoData);

  } catch (error) {
    console.error('Falha ao buscar dados de alocação:', error);
    return NextResponse.json({ message: 'Não foi possível carregar os dados de alocação.' }, { status: 500 });
  }
}

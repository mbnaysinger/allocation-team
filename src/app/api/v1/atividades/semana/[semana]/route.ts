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
    const userPersonIds = session?.user?.personIds;
    const { semana } = await params;

    const { searchParams } = new URL(request.url);
    const squads = searchParams.getAll('squads');
    const pessoas = searchParams.getAll('pessoas');
    const projetos = searchParams.getAll('projetos');

    if (!semana) {
      return NextResponse.json({ message: 'O parâmetro semana é obrigatório' }, { status: 400 });
    }

    const alocacaoSemanalService = dependencyFactory.createAlocacaoSemanalService();

    // Se o usuário for USER e não tiver pessoas associadas, e nenhum filtro for aplicado, retorna vazio.
    if (userRole === UserRole.USER && (!userPersonIds || userPersonIds.length === 0) && squads.length === 0 && pessoas.length === 0) {
      return NextResponse.json({ pessoas: [], projetos: [], atividades: [] });
    }

    const alocacaoData = await alocacaoSemanalService.getWeeklyAllocationWithFilters({
      semana,
      squads: squads.length > 0 ? squads : undefined,
      pessoas: pessoas.length > 0 ? pessoas : undefined,
      projetos: projetos.length > 0 ? projetos : undefined,
      personIds: userRole === UserRole.USER ? userPersonIds : undefined,
    });

    return NextResponse.json(alocacaoData);

  } catch (error) {
    console.error('Falha ao buscar dados de alocação:', error);
    return NextResponse.json({ message: 'Não foi possível carregar os dados de alocação.' }, { status: 500 });
  }
}

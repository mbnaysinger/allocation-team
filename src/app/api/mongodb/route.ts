import { NextRequest, NextResponse } from 'next/server';
import { MongoDBService } from '../../../lib/mongodb-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'dataInicio e dataFim são obrigatórios' },
        { status: 400 }
      );
    }

    const [pessoas, projetos, atividades] = await Promise.all([
      MongoDBService.getPessoas(),
      MongoDBService.getProjetos(),
      MongoDBService.getAtividadesCompletasPorPeriodo(dataInicio, dataFim)
    ]);

    return NextResponse.json({
      pessoas,
      projetos,
      atividades
    });
  } catch (error) {
    console.error('Erro ao buscar dados do MongoDB:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'addPessoa':
        const novaPessoa = await MongoDBService.addPessoa({
          ...data,
          ativo: true
        });
        return NextResponse.json({ success: true, data: novaPessoa });

      case 'addProjeto':
        const novoProjeto = await MongoDBService.addProjeto({
          ...data,
          ativo: true
        });
        return NextResponse.json({ success: true, data: novoProjeto });

      case 'addAtividade':
        const novaAtividade = await MongoDBService.addAtividade(data);
        return NextResponse.json({ success: true, data: novaAtividade });

      case 'updateAtividade':
        const { id, ...updateData } = data;
        const sucesso = await MongoDBService.updateAtividade(id, updateData);
        return NextResponse.json({ success: sucesso });

      case 'deleteAtividade':
        const deletado = await MongoDBService.deleteAtividade(data.id);
        return NextResponse.json({ success: deletado });

      case 'cloneAtividade':
        const atividadeClonada = await MongoDBService.cloneAtividade(data.id);
        return NextResponse.json({ success: true, data: atividadeClonada });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
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

      // ===== NOVOS CASOS PARA ATUALIZAÇÕES OTIMIZADAS =====
      
      case 'updateAtividadeOptimized':
        const { id: atividadeId, pessoaId, dataInicio, dataFim, ...dadosAtualizados } = data;
        const sucessoUpdate = await MongoDBService.updateAtividade(atividadeId, dadosAtualizados);
        
        if (sucessoUpdate && pessoaId && dataInicio && dataFim) {
          // Retornar apenas os dados atualizados do usuário específico
          const atividadesAtualizadas = await MongoDBService.getAtividadesCompletasPorPessoaESemana(
            pessoaId, 
            dataInicio, 
            dataFim
          );
          return NextResponse.json({ 
            success: true, 
            data: atividadesAtualizadas,
            pessoaId,
            dataInicio,
            dataFim
          });
        }
        return NextResponse.json({ success: sucessoUpdate });

      case 'addAtividadeOptimized':
        const novaAtividadeOpt = await MongoDBService.addAtividade(data);
        if (novaAtividadeOpt && data.pessoaId && data.dataInicio && data.dataFim) {
          // Retornar apenas os dados atualizados do usuário específico
          const atividadesAtualizadas = await MongoDBService.getAtividadesCompletasPorPessoaESemana(
            data.pessoaId, 
            data.dataInicio, 
            data.dataFim
          );
          return NextResponse.json({ 
            success: true, 
            data: atividadesAtualizadas,
            pessoaId: data.pessoaId,
            dataInicio: data.dataInicio,
            dataFim: data.dataFim
          });
        }
        return NextResponse.json({ success: true, data: novaAtividadeOpt });

      case 'deleteAtividadeOptimized':
        const { id: atividadeIdDelete, pessoaId: pessoaIdDelete, dataInicio: dataInicioDelete, dataFim: dataFimDelete } = data;
        const deletadoOpt = await MongoDBService.deleteAtividade(atividadeIdDelete);
        
        if (deletadoOpt && pessoaIdDelete && dataInicioDelete && dataFimDelete) {
          // Retornar apenas os dados atualizados do usuário específico
          const atividadesAtualizadas = await MongoDBService.getAtividadesCompletasPorPessoaESemana(
            pessoaIdDelete, 
            dataInicioDelete, 
            dataFimDelete
          );
          return NextResponse.json({ 
            success: true, 
            data: atividadesAtualizadas,
            pessoaId: pessoaIdDelete,
            dataInicio: dataInicioDelete,
            dataFim: dataFimDelete
          });
        }
        return NextResponse.json({ success: deletadoOpt });

      case 'cloneAtividadeOptimized':
        const { id: atividadeIdClone, pessoaId: pessoaIdClone, dataInicio: dataInicioClone, dataFim: dataFimClone } = data;
        const atividadeClonadaOpt = await MongoDBService.cloneAtividade(atividadeIdClone);
        
        if (atividadeClonadaOpt && pessoaIdClone && dataInicioClone && dataFimClone) {
          // Retornar apenas os dados atualizados do usuário específico
          const atividadesAtualizadas = await MongoDBService.getAtividadesCompletasPorPessoaESemana(
            pessoaIdClone, 
            dataInicioClone, 
            dataFimClone
          );
          return NextResponse.json({ 
            success: true, 
            data: atividadesAtualizadas,
            pessoaId: pessoaIdClone,
            dataInicio: dataInicioClone,
            dataFim: dataFimClone
          });
        }
        return NextResponse.json({ success: true, data: atividadeClonadaOpt });

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
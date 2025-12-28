import { Collection, Document, Filter } from 'mongodb';
import { getCollection } from '../../../../config/databases/mongodb';
import { IAtividadeRepository } from '../../../core/ports/IAtividadeRepository';
import { Atividade, DadosAtividade, StatusAtividade } from '../../../core/models/Atividade';

const fromDocument = (doc: Document): Atividade => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    id: data.id,
    titulo: data.titulo,
    data: data.data,
    semana: data.semana,
    pessoaId: data.pessoaId,
    isDesvio: data.isDesvio,
    tipo: data.tipo,
    projetoId: data.projetoId,
    descricaoJira: data.descricaoJira,
    tempo: data.tempo,
    tmp_executado: data.tmp_executado,
    status: data.status,
    posicao: data.posicao,
    version: data.version, // Inclui a versão
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Atividade;
};

export class AtividadeRepository implements IAtividadeRepository {
  private async getAtividadesCollection(): Promise<Collection<Document>> {
    return getCollection('atividades');
  }

  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Atividade[]> {
    const collection = await this.getAtividadesCollection();
    const documents = await collection.find({
      data: { $gte: dataInicio, $lte: dataFim }
    }).toArray();
    return documents.map(fromDocument);
  }

  async getByWeekWithFilters(semana: string, pessoaIds: string[], projetoIds?: string[]): Promise<Atividade[]> {
    const collection = await this.getAtividadesCollection();
    const query: Filter<Document> = { semana };

    if (pessoaIds.length === 0) {
      pessoaIds = [""];
    }

    if (pessoaIds && pessoaIds.length > 0) {
      query.pessoaId = { $in: pessoaIds };
    }

    if (projetoIds && projetoIds.length > 0) {
      query.projetoId = { $in: projetoIds };
    }

    const documents = await collection.find(query).sort({ posicao: 1 }).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorPessoaEPeriodo(pessoaId: string, dataInicio: string, dataFim: string): Promise<Atividade[]> {
    const collection = await this.getAtividadesCollection();
    const documents = await collection.find({
      pessoaId,
      data: { $gte: dataInicio, $lte: dataFim }
    }).toArray();
    return documents.map(fromDocument);
  }

  async criar(dados: DadosAtividade): Promise<Atividade> {
    const collection = await this.getAtividadesCollection();
    const now = new Date();
    const nextPosicao = await this.getNextPosicaoForDay(dados.pessoaId, dados.data);

    const novaAtividade: Omit<Atividade, 'id'> & { id?: string } = {
      ...dados,
      id: `ativ_${Date.now()}`,
      tmp_executado: 0,
      posicao: nextPosicao,
      version: 1, // Inicializa a versão com 1
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(novaAtividade);

    return {
      id: novaAtividade.id!,
      ...novaAtividade
    } as Atividade;
  }

  async getNextPosicaoForDay(pessoaId: string, data: string): Promise<number> {
    const collection = await this.getAtividadesCollection();
    const latestActivity = await collection.find(
      { pessoaId, data },
      { sort: { posicao: -1 }, limit: 1 }
    ).toArray();

    if (latestActivity.length > 0 && latestActivity[0].posicao !== undefined) {
      return latestActivity[0].posicao + 1;
    }
    return 0; // Se não houver atividades, começa com 0
  }

  async atualizar(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null> {
    const collection = await this.getAtividadesCollection();

    const atividadeExistente = await this.buscarPorId(id);

    if (!atividadeExistente) {
      return null; // Atividade não encontrada
    }

    // Se uma versão foi fornecida nos dados, verificar a concorrência
    if (dados.version !== undefined) {
      if (atividadeExistente.version !== dados.version) {
        throw new Error('Conflito de versão: A atividade foi modificada por outro usuário. Por favor, recarregue a página e tente novamente.');
      }
      // Incrementa a versão para a próxima atualização
      dados.version = atividadeExistente.version + 1;
    } else {
      // Se nenhuma versão foi fornecida, mas a atividade existente tem uma,
      // isso pode indicar uma tentativa de atualização sem controle de versão.
      // Dependendo da política, pode-se lançar um erro ou apenas ignorar.
      // Por enquanto, vamos apenas garantir que a versão existente seja mantida se não for fornecida.
      // Ou, se a intenção é sempre usar controle de versão, pode-se forçar a inclusão da versão.
      // Para este caso, vamos apenas manter a versão existente se não for fornecida.
      dados.version = atividadeExistente.version;
    }

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }

    return null;
  }

  async deletar(id: string): Promise<void> {
    const collection = await this.getAtividadesCollection();
    await collection.deleteOne({ id });
  }

  async buscarPorId(id: string): Promise<Atividade | null> {
    const collection = await this.getAtividadesCollection();
    const document = await collection.findOne({ id });
    return document ? fromDocument(document) : null;
  }

  async updateStatus(id: string, status: StatusAtividade): Promise<Atividade | null> {
    const collection = await this.getAtividadesCollection();

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }

    return null;
  }

  async reorderActivities(pessoaId: string, data: string, orderedActivityIds: string[]): Promise<void> {
    const collection = await this.getAtividadesCollection();
    const bulkOperations = orderedActivityIds.map((atividadeId, index) => ({
      updateOne: {
        filter: { id: atividadeId, pessoaId, data },
        update: { $set: { posicao: index, updatedAt: new Date() } },
      },
    }));

    if (bulkOperations.length > 0) {
      await collection.bulkWrite(bulkOperations);
    }
  }
}

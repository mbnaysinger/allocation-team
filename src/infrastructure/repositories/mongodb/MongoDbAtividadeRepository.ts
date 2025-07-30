import { Collection, Document } from 'mongodb';
import { getCollection } from '../../database/mongodb';
import { IAtividadeRepository } from '../../../core/ports/IAtividadeRepository';
import { Atividade, DadosAtividade } from '../../../core/models';

const fromDocument = (doc: Document): Atividade => {
  const { _id, ...data } = doc;
  return {
    id: data.id,
    titulo: data.titulo,
    data: data.data,
    pessoaId: data.pessoaId,
    tipo: data.tipo,
    projetoId: data.projetoId,
    descricaoJira: data.descricaoJira,
    horas: data.horas,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Atividade;
};

export class MongoDbAtividadeRepository implements IAtividadeRepository {
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

    const novaAtividade: Omit<Atividade, 'id'> & { id?: string } = {
      ...dados,
      id: `ativ_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(novaAtividade);

    return {
        id: novaAtividade.id!,
        ...novaAtividade
    } as Atividade;
  }

  async atualizar(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null> {
    const collection = await this.getAtividadesCollection();

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result?.value ? fromDocument(result.value) : null;
  }

  async deletar(id: string): Promise<void> {
    const collection = await this.getAtividadesCollection();
    await collection.deleteOne({ id });
  }
}

import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../../config/databases/mongodb';
import { IEpicoRepository } from '../../../core/ports/IEpicoRepository';
import { Epico, DadosEpico } from '../../../core/models/projeto/Epico';

const fromDocument = (doc: Document): Epico => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    epicoId: data.epicoId,
    nome: data.nome,
    descricao: data.descricao,
    projetoId: data.projetoId,
    status: data.status,
    dataInicio: new Date(data.dataInicio),
    dataFimPrevisto: new Date(data.dataFimPrevisto),
    dataFimReal: data.dataFimReal ? new Date(data.dataFimReal) : new Date(),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Epico;
};

export class MongoDbEpicoRepository implements IEpicoRepository {
  private async getEpicosCollection(): Promise<Collection<Document>> {
    return getCollection('epicos');
  }

  async buscarTodos(): Promise<Epico[]> {
    const collection = await this.getEpicosCollection();
    const documents = await collection.find({}).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorProjetoId(projetoId: string): Promise<Epico[]> {
    const collection = await this.getEpicosCollection();
    const documents = await collection.find({ projetoId }).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorId(id: string): Promise<Epico | null> {
    const collection = await this.getEpicosCollection();
    const document = await collection.findOne({ epicoId: id });
    return document ? fromDocument(document) : null;
  }

  async criar(dados: DadosEpico): Promise<Epico> {
    const collection = await this.getEpicosCollection();
    const now = new Date();

    console.log("------Chegou aqui: " + dados);
    const novoEpico: Omit<Epico, 'epicoId'> & { epicoId?: string } = {
      ...dados,
      epicoId: `epic_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(novoEpico);
    
    return {
      epicoId: novoEpico.epicoId!,
      ...novoEpico
    } as Epico;
  }

  async atualizar(id: string, dados: Partial<DadosEpico>): Promise<Epico | null> {
    const collection = await this.getEpicosCollection();

    const result = await collection.findOneAndUpdate(
      { epicoId: id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }
    
    return null;
  }

  async deletar(id: string): Promise<boolean> {
    const collection = await this.getEpicosCollection();
    const result = await collection.deleteOne({ epicoId: id });
    return result.deletedCount > 0;
  }
}

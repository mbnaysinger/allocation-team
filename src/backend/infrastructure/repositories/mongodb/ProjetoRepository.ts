import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../../config/databases/mongodb';
import { IProjetoRepository } from '../../../core/ports/IProjetoRepository';
import { Projeto, DadosProjeto } from '../../../core/models/projeto/Projeto';

const fromDocument = (doc: Document): Projeto => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    projetoId: data.projetoId,
    abreviatura: data.abreviatura,
    nome: data.nome,
    descricao: data.descricao,
    entidade: data.entidade,
    linkDocumentacao: data.linkDocumentacao,
    responsavelId: data.responsavelId,
    fase: data.fase,
    status: data.status,
    dataInicio: data.dataInicio,
    dataFimPrevisto: data.dataFimPrevisto,
    dataFimReal: data.dataFimReal,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Projeto;
};

export class MongoDbProjetoRepository implements IProjetoRepository {
  private async getProjetosCollection(): Promise<Collection<Document>> {
    return getCollection('projetos');
  }

  async buscarTodos(): Promise<Projeto[]> {
    const collection = await this.getProjetosCollection();
    const documents = await collection.find({}).toArray();
    return documents.map(fromDocument);
  }

  async buscarAtivos(): Promise<Projeto[]> {
    const collection = await this.getProjetosCollection();
    const documents = await collection.find({ ativo: true }).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorId(id: string): Promise<Projeto | null> {
    const collection = await this.getProjetosCollection();
    const document = await collection.findOne({ id });
    return document ? fromDocument(document) : null;
  }

  async criar(dados: DadosProjeto): Promise<Projeto> {
    const collection = await this.getProjetosCollection();
    const now = new Date();

    const novoProjeto: Omit<Projeto, 'id'> & { id?: string } = {
      ...dados,
      projetoId: `proj_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(novoProjeto);
    
    return {
        id: novoProjeto.id!,
        ...novoProjeto
    } as Projeto
  }

  async atualizar(id: string, dados: Partial<DadosProjeto>): Promise<Projeto | null> {
    const collection = await this.getProjetosCollection();

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result) {
      return fromDocument(result);
    }
    
    return null;
  }

  async alternarAtivo(id: string, ativo: boolean): Promise<Projeto | null> {
    const collection = await this.getProjetosCollection();

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ativo, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result) {
      return fromDocument(result);
    }
    
    return null;
  }
}

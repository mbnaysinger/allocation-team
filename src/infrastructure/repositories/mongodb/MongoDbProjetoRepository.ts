import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../config/databases/mongodb';
import { IProjetoRepository } from '../../../core/ports/IProjetoRepository';
import { Projeto, DadosProjeto } from '../../../core/models';

const fromDocument = (doc: Document): Projeto => {
  const { _id, ...data } = doc;
  return {
    id: data.id,
    nome: data.nome,
    abreviatura: data.abreviatura,
    descricao: data.descricao,
    entidade: data.entidade,
    linkJira: data.linkJira,
    ativo: data.ativo,
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
      id: `proj_${Date.now()}`,
      ativo: true,
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

    if (result && result.value) {
      return fromDocument(result.value as Document);
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

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }
    
    return null;
  }
}

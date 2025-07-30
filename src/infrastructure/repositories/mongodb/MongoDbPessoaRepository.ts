import { Collection, Document } from 'mongodb';
import { getCollection } from '../../database/mongodb';
import { IPessoaRepository } from '../../../core/ports/IPessoaRepository';
import { Pessoa, DadosPessoa } from '../../../core/models';

// Helper to convert MongoDB document to a Pessoa object
const fromDocument = (doc: Document): Pessoa => {
  const { _id, ...data } = doc;
  return {
    id: data.id,
    nome: data.nome,
    cargo: data.cargo,
    ativo: data.ativo,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Pessoa;
};

export class MongoDbPessoaRepository implements IPessoaRepository {
  private async getPessoasCollection(): Promise<Collection<Document>> {
    return getCollection('pessoas');
  }

  async buscarTodos(): Promise<Pessoa[]> {
    const collection = await this.getPessoasCollection();
    const documents = await collection.find({}).toArray();
    return documents.map(fromDocument);
  }

  async buscarAtivos(): Promise<Pessoa[]> {
    const collection = await this.getPessoasCollection();
    const documents = await collection.find({ ativo: true }).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorId(id: string): Promise<Pessoa | null> {
    const collection = await this.getPessoasCollection();
    const document = await collection.findOne({ id });
    return document ? fromDocument(document) : null;
  }

  async criar(dados: DadosPessoa): Promise<Pessoa> {
    const collection = await this.getPessoasCollection();
    const now = new Date();
    
    const novaPessoa: Omit<Pessoa, 'id'> & { id?: string } = {
      ...dados,
      id: `pessoa_${Date.now()}`,
      ativo: true,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await collection.insertOne(novaPessoa);

    return {
      id: novaPessoa.id!,
      ...novaPessoa
    } as Pessoa;
  }

  async atualizar(id: string, dados: Partial<DadosPessoa>): Promise<Pessoa | null> {
    const collection = await this.getPessoasCollection();
    
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result ? fromDocument(result) : null;
  }
  
  async alternarAtivo(id: string, ativo: boolean): Promise<Pessoa | null> {
    const collection = await this.getPessoasCollection();
    
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { ativo, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result ? fromDocument(result) : null;
  }
}

import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../config/databases/mongodb';
import { IPessoaRepository } from '../../../core/ports/IPessoaRepository';
import { Pessoa, DadosPessoa } from '../../../core/models';

// Helper to convert MongoDB document to a Pessoa object
const fromDocument = (doc: Document): Pessoa => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async findByIds(ids: string[]): Promise<Pessoa[]> {
    const collection = await this.getPessoasCollection();
    const documents = await collection.find({ id: { $in: ids } }).toArray();
    return documents.map(fromDocument);
  }

  async buscarAtivos(): Promise<Pessoa[]> {
    const collection = await this.getPessoasCollection();
    const documents = await collection.find({ ativo: true })
    .sort({ nome: 1 })
    .toArray();
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
    
    await collection.insertOne(novaPessoa);

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

    if (result) {
      return fromDocument(result);
    }
    
    return null;
  }
  
  async alternarAtivo(id: string, ativo: boolean): Promise<Pessoa | null> {
    const collection = await this.getPessoasCollection();
    
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

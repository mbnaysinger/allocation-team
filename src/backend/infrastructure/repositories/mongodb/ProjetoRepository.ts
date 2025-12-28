import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../../config/databases/mongodb';
import { IProjetoRepository } from '../../../core/ports/IProjetoRepository';
import { Projeto, DadosProjeto, ProjetoSelect } from '../../../core/models/projeto/Projeto';

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

const fromDocumentSelect = (doc: Document): ProjetoSelect => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    projetoId: data.projetoId,
    abreviatura: data.abreviatura,
    nome: data.nome,
  } as ProjetoSelect;
};

export class ProjetoRepository implements IProjetoRepository {
  private async getProjetosCollection(): Promise<Collection<Document>> {
    return getCollection('projetos');
  }

  private async getAtividadesCollection(): Promise<Collection<Document>> {
    return getCollection('atividades');
  }

  private async getPessoasCollection(): Promise<Collection<Document>> {
    return getCollection('pessoas');
  }

  async buscarProjetos(squads?: string[], pessoas?: string[]): Promise<Projeto[]> {
    const atividadesCollection = await this.getAtividadesCollection();
    
    const pipeline: Document[] = [];

    // Se pessoas for especificado, o filtro principal é por pessoaId
    if (pessoas && pessoas.length > 0) {
      pipeline.push({ $match: { pessoaId: { $in: pessoas } } });
    } 
    // Se não, e se squads for especificado, precisamos buscar as pessoas do squad primeiro
    else if (squads && squads.length > 0) {
      const pessoasCollection = await this.getPessoasCollection();
      const pessoasNoSquad = await pessoasCollection.find({ squad: { $in: squads } }).project({ id: 1 }).toArray();
      const pessoasIds = pessoasNoSquad.map(p => p.id);
      pipeline.push({ $match: { pessoaId: { $in: pessoasIds } } });
    }

    // Agrupa para obter projetos distintos
    pipeline.push({ $group: {  _id: '$projetoId' } });
    pipeline.push({ $project: { projetoId: '$_id' } });

    const atividades = await atividadesCollection.aggregate(pipeline).toArray();
    const projetoIds = atividades.map(a => a.projetoId).filter(id => id);

    if (projetoIds.length === 0) {
      return [];
    }

    const projetosCollection = await this.getProjetosCollection();
    const projetos = await projetosCollection.find({ projetoId: { $in: projetoIds } }).sort({ nome: 1 }).toArray();

    return projetos.map(fromDocument);
  }

  async buscarProjetosPorIds(projetoIds: string[]): Promise<Projeto[]> {
    if (projetoIds.length === 0) {
      return [];
    }

    const projetosCollection = await this.getProjetosCollection();
    const projetos = await projetosCollection.find({ projetoId: { $in: projetoIds } }).sort({ nome: 1 }).toArray();

    return projetos.map(fromDocument);
  }

  async buscarAtivos(): Promise<Projeto[]> {
    const collection = await this.getProjetosCollection();
    const documents = await collection.find({}).sort({ nome: 1 }).toArray();
    return documents.map(fromDocument);
  }

  async buscarSelect(): Promise<ProjetoSelect[]> {
    const collection = await this.getProjetosCollection();
    const documents = await collection.find({}).sort({ nome: 1 }).toArray();
    return documents.map(fromDocumentSelect);
  }

  async buscarPorId(id: string): Promise<Projeto | null> {
    const collection = await this.getProjetosCollection();
    const document = await collection.findOne({ id });
    return document ? fromDocument(document) : null;
  }
  
  async buscarProjetosCardPorId(projetoId: string): Promise<ProjetoSelect> {
    const collection = await this.getProjetosCollection();
    const document = await collection.findOne({ projetoId });
    if (!document) {
      throw new Error('Projeto não encontrado');
    }
    return fromDocumentSelect(document);
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

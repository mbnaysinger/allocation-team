import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../../config/databases/mongodb';
import { ITarefaRepository } from '../../../core/ports/ITarefaRepository';
import { Tarefa, DadosTarefa } from '../../../core/models/projeto/Tarefa';

const fromDocument = (doc: Document): Tarefa => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    tarefaId: data.tarefaId,
    nome: data.nome,
    descricao: data.descricao,
    epicoId: data.epicoId,
    executorId: data.executorId,
    status: data.status,
    dataInicio: new Date(data.dataInicio),
    dataFimPrevisto: new Date(data.dataFimPrevisto),
    dataFimReal: data.dataFimReal ? new Date(data.dataFimReal) : new Date(),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Tarefa;
};

export class MongoDbTarefaRepository implements ITarefaRepository {
  private async getTarefasCollection(): Promise<Collection<Document>> {
    return getCollection('tarefas');
  }

  async buscarTodos(): Promise<Tarefa[]> {
    const collection = await this.getTarefasCollection();
    const documents = await collection.find({}).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorEpicoId(epicoId: string): Promise<Tarefa[]> {
    const collection = await this.getTarefasCollection();
    const documents = await collection.find({ epicoId }).toArray();
    return documents.map(fromDocument);
  }

  async buscarPorId(id: string): Promise<Tarefa | null> {
    const collection = await this.getTarefasCollection();
    const document = await collection.findOne({ tarefaId: id });
    return document ? fromDocument(document) : null;
  }

  async criar(dados: DadosTarefa): Promise<Tarefa> {
    const collection = await this.getTarefasCollection();
    const now = new Date();

    const novaTarefa: Omit<Tarefa, 'tarefaId'> & { tarefaId?: string } = {
      ...dados,
      tarefaId: `task_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(novaTarefa);
    
    return {
      tarefaId: novaTarefa.tarefaId!,
      ...novaTarefa
    } as Tarefa;
  }

  async atualizar(id: string, dados: Partial<DadosTarefa>): Promise<Tarefa | null> {
    const collection = await this.getTarefasCollection();

    const result = await collection.findOneAndUpdate(
      { tarefaId: id },
      { $set: { ...dados, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }
    
    return null;
  }

  async deletar(id: string): Promise<boolean> {
    const collection = await this.getTarefasCollection();
    const result = await collection.deleteOne({ tarefaId: id });
    return result.deletedCount > 0;
  }
}

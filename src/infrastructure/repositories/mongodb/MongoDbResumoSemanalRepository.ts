import { Collection, Document } from 'mongodb';
import { getCollection } from '../../../config/databases/mongodb';
import { IResumoSemanalRepository } from '../../../core/ports/IResumoSemanalRepository';
import { ResumoSemanal } from '../../../core/models';

const fromDocument = (doc: Document): ResumoSemanal => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...data } = doc;
  return {
    id: data.id,
    pessoaId: data.pessoaId,
    semana_inicio: data.semana_inicio,
    comentario: data.comentario,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as ResumoSemanal;
};

export class MongoDbResumoSemanalRepository implements IResumoSemanalRepository {
  private async getResumosCollection(): Promise<Collection<Document>> {
    return getCollection('resumos_semanais');
  }

  async salvar(resumo: Omit<ResumoSemanal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResumoSemanal> {
    const collection = await this.getResumosCollection();
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { 
        pessoaId: resumo.pessoaId,
        semana_inicio: resumo.semana_inicio,
      },
      { 
        $set: { 
          comentario: resumo.comentario,
          updatedAt: now,
        },
        $setOnInsert: {
          id: `res_${Date.now()}`,
          pessoaId: resumo.pessoaId,
          semana_inicio: resumo.semana_inicio,
          createdAt: now,
        }
      },
      { 
        upsert: true,
        returnDocument: 'after' 
      }
    );

    if (result && result.value) {
      return fromDocument(result.value as Document);
    }
    
    // Este fallback pode ser necessário se o upsert não retornar o documento em alguns casos raros
    // ou se a lógica precisar ser mais explícita.
    const novoDocumento = await collection.findOne({ 
        pessoaId: resumo.pessoaId,
        semana_inicio: resumo.semana_inicio,
    });
    
    if(!novoDocumento) throw new Error("Não foi possível salvar ou encontrar o resumo semanal.");

    return fromDocument(novoDocumento);
  }

  async buscarPorPessoasESemana(pessoaIds: string[], semana_inicio: string): Promise<ResumoSemanal[]> {
    const collection = await this.getResumosCollection();
    const documents = await collection.find({
      pessoaId: { $in: pessoaIds },
      semana_inicio: semana_inicio,
    }).toArray();

    return documents.map(fromDocument);
  }
}

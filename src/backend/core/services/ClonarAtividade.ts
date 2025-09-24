import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Atividade, STATUS_ATIVIDADE } from '../models';

export class ClonarAtividade {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(id: string): Promise<Atividade> {
    try {
      const atividadeOriginal = await this.atividadeRepository.buscarPorId(id); // Precisamos adicionar isso no port

      if (!atividadeOriginal) {
        throw new Error("Atividade original não encontrada para clonagem.");
      }

      // Prepara os dados para a nova atividade clonada
      const novaAtividadeDados = {
        titulo: `${atividadeOriginal.titulo} (Cópia)`,
        data: atividadeOriginal.data,
        pessoaId: atividadeOriginal.pessoaId,
        tipo: atividadeOriginal.tipo,
        projetoId: atividadeOriginal.projetoId,
        descricaoJira: atividadeOriginal.descricaoJira,
        status: STATUS_ATIVIDADE[0],  // Planejada
        horas: atividadeOriginal.horas,
      };

      const atividadeClonada = await this.atividadeRepository.criar(novaAtividadeDados);

      return atividadeClonada;
    } catch (error) {
      console.error("Erro ao clonar atividade:", error);
      throw new Error(`Falha ao clonar atividade: ${(error as Error).message}`);
    }
  }
} 
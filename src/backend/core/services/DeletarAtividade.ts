import { IAtividadeRepository } from '../ports/IAtividadeRepository';

export class DeletarAtividade {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.atividadeRepository.deletar(id);
    } catch (error) {
      console.error("Erro ao deletar atividade:", error);
      throw new Error(`Falha ao deletar atividade: ${(error as Error).message}`);
    }
  }
} 
import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Atividade, DadosAtividade, StatusAtividade } from '../models';
import { getWeekString } from '@/app/utils/date';

// Reutilizamos a mesma validação da criação, mas a adaptamos se necessário no futuro
const validarDadosAtividade = (dados: Partial<DadosAtividade>): void => {
  if (dados.titulo && dados.titulo.trim().length < 3) {
    throw new Error('O título da atividade deve ter pelo menos 3 caracteres.');
  }
  if (dados.tipo === 'Projeto' && !dados.projetoId) {
    throw new Error('Um projeto deve ser selecionado para atividades do tipo "Projeto".');
  }
  if (dados.horas !== undefined && dados.horas <= 0) {
    throw new Error('A quantidade de horas deve ser maior que zero.');
  }
};

export class AtualizarAtividade {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null> {
    try {
      validarDadosAtividade(dados);
      const atividadeAtualizada = await this.atividadeRepository.atualizar(id, dados);
      
      if (dados.data) {
        // Converte a string 'YYYY-MM-DD' para um objeto Date.
        // O formato YYYY-MM-DD é interpretado como UTC, o que é seguro.
        const dateObject = new Date(dados.data);
        dados.semana = getWeekString(dateObject);
      }

      if (!atividadeAtualizada) {
        throw new Error("Atividade não encontrada ou não pôde ser atualizada.");
      }

      return atividadeAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      throw new Error(`Falha ao atualizar atividade: ${(error as Error).message}`);
    }
  }

  async updateStatus(id: string, status: StatusAtividade): Promise<void> {
    const atividadeAtualizada = await this.atividadeRepository.updateStatus(id, status);
    if (!atividadeAtualizada) {
      throw new Error('Atividade não encontrada ou não pôde ser atualizada.');
    }
  }
}
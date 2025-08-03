import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Atividade, DadosAtividade } from '../models';

const validarDadosAtividade = (dados: DadosAtividade): void => {
  if (!dados.titulo || dados.titulo.trim().length < 3) {
    throw new Error('O título da atividade é obrigatório e deve ter pelo menos 3 caracteres.');
  }
  if (!dados.data) {
    throw new Error('A data da atividade é obrigatória.');
  }
  if (!dados.pessoaId) {
    throw new Error('A pessoa responsável pela atividade é obrigatória.');
  }
  if (dados.tipo === 'Projeto' && !dados.projetoId) {
    throw new Error('Um projeto deve ser selecionado para atividades do tipo "Projeto".');
  }
  if (dados.horas <= 0) {
    throw new Error('A quantidade de horas deve ser maior que zero.');
  }
};

export class CriarAtividade {
  constructor(private atividadeRepository: IAtividadeRepository) {}

  async execute(dados: DadosAtividade): Promise<Atividade> {
    try {
      validarDadosAtividade(dados);
      const novaAtividade = await this.atividadeRepository.criar(dados);
      return novaAtividade;
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      throw new Error(`Falha ao criar atividade: ${(error as Error).message}`);
    }
  }
} 
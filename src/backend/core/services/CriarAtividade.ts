import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Atividade, DadosAtividade } from '../models';
import { getWeekNumber } from '@/app/utils/date';

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

  async execute(dados: DadosAtividade): Promise<Atividade[]> {
    try {
      validarDadosAtividade(dados);

      if (dados) {
        dados.semana = getWeekNumber(dados.data);
      }
      
      const atividadesCriadas: Atividade[] = [];

      // 1. Criar a atividade principal
      const atividadePrincipal = await this.atividadeRepository.criar(dados);
      atividadesCriadas.push(atividadePrincipal);

      // 2. Criar atividades para colaboradores
      if (dados.colaboradoresIds && dados.colaboradoresIds.length > 0) {
        for (const colaboradorId of dados.colaboradoresIds) {
          const dadosColaborador: DadosAtividade = {
            ...dados,
            pessoaId: colaboradorId,
            colaboradoresIds: [] // Evitar loop infinito
          };
          validarDadosAtividade(dadosColaborador);
          const atividadeColaborador = await this.atividadeRepository.criar(dadosColaborador);
          atividadesCriadas.push(atividadeColaborador);
        }
      }

      return atividadesCriadas;
    } catch (error) {
      console.error("Erro ao criar atividades:", error);
      throw new Error(`Falha ao criar atividades: ${(error as Error).message}`);
    }
  }
} 
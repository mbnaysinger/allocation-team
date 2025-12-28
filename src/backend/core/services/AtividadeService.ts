import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Atividade, AtividadeCard, DadosAtividade, STATUS_ATIVIDADE, StatusAtividade } from '../models/Atividade';
import { getWeekString } from '@/app/utils/date';
import { IProjetoRepository } from '../ports/IProjetoRepository';
import { ProjetoSelect } from '../models/projeto/Projeto';

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
};

const validarDadosAtualizacao = (dados: Partial<DadosAtividade>): void => {
  if (dados.titulo && dados.titulo.trim().length < 3) {
    throw new Error('O título da atividade deve ter pelo menos 3 caracteres.');
  }
  if (dados.tipo === 'Projeto' && !dados.projetoId) {
    throw new Error('Um projeto deve ser selecionado para atividades do tipo "Projeto".');
  }
  if (dados.tmp_executado !== undefined && dados.tmp_executado < 0) {
    throw new Error('O tempo executado não pode ser negativo.');
  }
};

export class AtividadeService {
  constructor(private atividadeRepository: IAtividadeRepository,
    private projetoRepository: IProjetoRepository
  ) { }

  async add(dados: DadosAtividade): Promise<AtividadeCard[]> {
    try {
      validarDadosAtividade(dados);

      if (dados) {
        dados.semana = getWeekString(new Date(dados.data));
        if (dados.tmp_executado === undefined || dados.tmp_executado === null) {
          dados.tmp_executado = 0;
        }
      }

      const atividadesCriadas: AtividadeCard[] = [];

      // 1. Criar a atividade principal
      const atividadePrincipal = await this.atividadeRepository.criar(dados);
      let projeto: ProjetoSelect | undefined;
      if (dados.projetoId) {
        projeto = await this.projetoRepository.buscarProjetosCardPorId(dados.projetoId);
      }
      atividadesCriadas.push({ ...atividadePrincipal, projeto });

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
          atividadesCriadas.push({ ...atividadeColaborador, projeto });
        }
      }

      return atividadesCriadas;
    } catch (error) {
      console.error("Erro ao criar atividades:", error);
      throw new Error(`Falha ao criar atividades: ${(error as Error).message}`);
    }
  }

  async update(id: string, dados: Partial<DadosAtividade>): Promise<AtividadeCard | null> {
    try {
      validarDadosAtualizacao(dados);
      const atividadeAtualizada = await this.atividadeRepository.atualizar(id, dados);

      if (dados.data) {
        // Converte a string 'YYYY-MM-DD' para um objeto Date.
        // O formato YYYY-MM-DD é interpretado como UTC, o que é seguro.
        const dateObject = new Date(dados.data);
        dados.semana = getWeekString(dateObject).toString();
      }

      let projeto: ProjetoSelect | undefined;
      if (dados.projetoId) {
        projeto = await this.projetoRepository.buscarProjetosCardPorId(dados.projetoId);
      }

      if (!atividadeAtualizada) {
        throw new Error("Atividade não encontrada ou não pôde ser atualizada.");
      }

      return { ...atividadeAtualizada, projeto };
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

  async clone(id: string): Promise<AtividadeCard> {
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
        semana: atividadeOriginal.semana,
        status: STATUS_ATIVIDADE[0],  // Planejada
        tempo: atividadeOriginal.tempo,
      };

      // Adiciona a nova atividade ao repositório
      const atividadeClonada = await this.atividadeRepository.criar(novaAtividadeDados);

      // Busca o projeto associado à atividade clonada
      let projeto: ProjetoSelect | undefined;
      if (atividadeClonada.projetoId) {
        projeto = await this.projetoRepository.buscarProjetosCardPorId(atividadeClonada.projetoId);
      }

      return { ...atividadeClonada, projeto };
    } catch (error) {
      console.error("Erro ao clonar atividade:", error);
      throw new Error(`Falha ao clonar atividade: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.atividadeRepository.deletar(id);
    } catch (error) {
      console.error("Erro ao deletar atividade:", error);
      throw new Error(`Falha ao deletar atividade: ${(error as Error).message}`);
    }
  }

  async getByWeekWithFilters(semana: string, pessoaIds: string[], projetoIds?: string[]): Promise<Atividade[]> {
    try {
      return await this.atividadeRepository.getByWeekWithFilters(semana, pessoaIds, projetoIds);
    } catch (error) {
      console.error("Erro ao buscar atividades por semana:", error);
      throw new Error(`Falha ao buscar atividades por semana: ${(error as Error).message}`);
    }
  }

  async reorderActivities(pessoaId: string, data: string, orderedActivityIds: string[]): Promise<void> {
    try {
      await this.atividadeRepository.reorderActivities(pessoaId, data, orderedActivityIds);
    } catch (error) {
      console.error("Erro ao reordenar atividades:", error);
      throw new Error(`Falha ao reordenar atividades: ${(error as Error).message}`);
    }
  }

  async moveColumnAndReorderActivity(atividadeId: string, pessoaId: string, novaData: string, newOrderedActivityIds: string[]): Promise<void> {
    try {
      const updatedActivity = await this.atividadeRepository.atualizar(atividadeId, {
        data: novaData,
      });

      if (!updatedActivity) {
        throw new Error("Falha ao atualizar a atividade movida.");
      }

      //reordenando as atividades na nova data
      await this.atividadeRepository.reorderActivities(
        pessoaId,
        novaData,
        newOrderedActivityIds
      );

    } catch (error) {
      console.error("Erro ao mover e reordenar atividade:", error);
      throw new Error(`Falha ao mover e reordenar atividade: ${(error as Error).message}`);
    }
  }
} 
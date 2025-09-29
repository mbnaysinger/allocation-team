import { ITarefaRepository } from '../../ports/ITarefaRepository';
import { Tarefa, DadosTarefa } from '../../models/projeto/Tarefa';

const validarDadosTarefa = (dados: DadosTarefa): void => {
  if (!dados.nome || dados.nome.trim().length < 3) {
    throw new Error('O nome da tarefa é obrigatório e deve ter pelo menos 3 caracteres.');
  }
  if (!dados.descricao || dados.descricao.trim().length < 5) {
    throw new Error('A descrição da tarefa é obrigatória e deve ter pelo menos 5 caracteres.');
  }
  if (!dados.epicoId) {
    throw new Error('O ID do épico é obrigatório.');
  }
  if (!dados.executorId || dados.executorId.length === 0) {
    throw new Error('Pelo menos um executor deve ser atribuído à tarefa.');
  }
};

export class TarefaService {
  constructor(private tarefaRepository: ITarefaRepository) {}

  async criarTarefa(dados: DadosTarefa): Promise<Tarefa> {
    try {
      validarDadosTarefa(dados);
      const novaTarefa = await this.tarefaRepository.criar(dados);
      return novaTarefa;
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw new Error(`Falha ao criar tarefa: ${(error as Error).message}`);
    }
  }

  async buscarTarefas(): Promise<Tarefa[]> {
    return this.tarefaRepository.buscarTodos();
  }

  async buscarTarefasPorEpico(epicoId: string): Promise<Tarefa[]> {
    return this.tarefaRepository.buscarPorEpicoId(epicoId);
  }

  async buscarTarefaPorId(id: string): Promise<Tarefa | null> {
    return this.tarefaRepository.buscarPorId(id);
  }

  async atualizarTarefa(id: string, dados: Partial<DadosTarefa>): Promise<Tarefa | null> {
    try {
      return await this.tarefaRepository.atualizar(id, dados);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      throw new Error(`Falha ao atualizar tarefa: ${(error as Error).message}`);
    }
  }

  async deletarTarefa(id: string): Promise<boolean> {
    try {
      return await this.tarefaRepository.deletar(id);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw new Error(`Falha ao deletar tarefa: ${(error as Error).message}`);
    }
  }
}

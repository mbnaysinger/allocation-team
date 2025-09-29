import { Tarefa, DadosTarefa } from '../models/projeto/Tarefa';

export interface ITarefaRepository {
  buscarTodos(): Promise<Tarefa[]>;
  buscarPorEpicoId(epicoId: string): Promise<Tarefa[]>;
  buscarPorId(id: string): Promise<Tarefa | null>;
  criar(dados: DadosTarefa): Promise<Tarefa>;
  atualizar(id: string, dados: Partial<DadosTarefa>): Promise<Tarefa | null>;
  deletar(id: string): Promise<boolean>;
}

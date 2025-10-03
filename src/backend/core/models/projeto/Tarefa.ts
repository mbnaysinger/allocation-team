export type StatusTarefa = 'nao_iniciada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Tarefa {
  tarefaId: string;
  nome: string;
  descricao: string;
  epicoId: string;
  executorId: string[];
  status: StatusTarefa;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DadosTarefa {
  nome: string;
  descricao: string;
  epicoId: string;
  executorId: string[];
  status: StatusTarefa;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal: Date;
}

export const STATUS_TAREFA: StatusTarefa[] = [
  'nao_iniciada',
  'em_andamento',
  'concluida',
  'cancelada'
];

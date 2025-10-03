export type StatusEpico = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Epico {
  epicoId: string;
  nome: string;
  descricao: string;
  projetoId: string;
  status: StatusEpico;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DadosEpico {
  nome: string;
  descricao: string;
  projetoId: string;
  status: StatusEpico;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal?: Date;
}

export const STATUS_EPICO: StatusEpico[] = [
  'planejado',
  'em_andamento',
  'concluido',
  'cancelado'
];

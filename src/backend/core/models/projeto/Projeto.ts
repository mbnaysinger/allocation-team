export type Entidade = 'SESI' | 'SENAI' | 'IEL' | 'CIERGS' | 'GINFO' | 'SISTEMA FIERGS';
export type FaseProjeto = 'upstream' | 'downstream' | 'internal' | 'cancelled';
export type StatusProjeto = 'backlog' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Projeto {  
  projetoId: string;
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkDocumentacao?: string;
  responsavelId: string
  fase: FaseProjeto;
  status: StatusProjeto;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjetoSelect {
  projetoId: string;
  nome: string;
  abreviatura: string;
}

export interface DadosProjeto {
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkDocumentacao?: string;
  responsavelId: string
  fase: FaseProjeto;
  status: StatusProjeto;
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal: Date;
}

export const ENTIDADES: Entidade[] = [
  'SESI',
  'SENAI', 
  'IEL',
  'CIERGS',
  'GINFO',
  'SISTEMA FIERGS'
];

export const FASES_PROJETO: FaseProjeto[] = [
  'upstream',
  'downstream',
  'internal',
  'cancelled'
];

export const STATUS_PROJETO: StatusProjeto[] = [
  'backlog',
  'em_andamento',
  'concluido',
  'cancelado'
];

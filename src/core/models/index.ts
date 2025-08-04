export type Cargo = 'Analista de TI' | 'Analista de Negócios';
export type TipoAtividade = 'Projeto' | 'Melhoria' | 'Sustentação';
export type Entidade = 'SESI' | 'SENAI' | 'IEL' | 'CIERGS' | 'GINFO' | 'SISTEMA FIERGS';
export type StatusAtividade = 'planejado' | 'concluido' | 'nao_realizado';

export interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Projeto {
  id: string;
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkJira?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Atividade {
  id:string;
  titulo: string;
  data: string; // YYYY-MM-DD format
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string; // Obrigatório se tipo === "Projeto"
  descricaoJira?: string; // Máximo 100 caracteres
  horas: number;
  status?: StatusAtividade;
  createdAt: Date;
  updatedAt: Date;
}

export interface AtividadeCompleta extends Atividade {
  pessoa: Pessoa;
  projeto?: Projeto;
}

export interface ResumoSemanal {
  id: string;
  pessoaId: string;
  semana_inicio: string; // YYYY-MM-DD
  comentario: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DadosPessoa {
  nome: string;
  cargo: Cargo;
}

export interface DadosProjeto {
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkJira?: string;
}

export interface DadosAtividade {
  titulo: string;
  data: string;
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string;
  descricaoJira?: string;
  horas: number;
  colaboradoresIds?: string[];
  status: 'planejada' | 'concluida' | 'nao_realizada';
}

// Enums para uso em componentes
export const CARGOS: Cargo[] = [
  'Analista de TI',
  'Analista de Negócios'
];

export const TIPOS_ATIVIDADE: TipoAtividade[] = [
  'Melhoria',
  'Projeto',
  'Sustentação'
];

export const ENTIDADES: Entidade[] = [
  'SESI',
  'SENAI', 
  'IEL',
  'CIERGS',
  'GINFO',
  'SISTEMA FIERGS'
];

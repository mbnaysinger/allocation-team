import { Projeto } from "./projeto/Projeto";

export type Cargo = 'Analista de TI' | 'Analista de Negócios';
export type TipoAtividade = 'Projeto' | 'Melhoria' | 'Sustentação' | 'Administrativo' | 'Capacitação';
export type Entidade = 'SESI' | 'SENAI' | 'IEL' | 'CIERGS' | 'GINFO' | 'SISTEMA FIERGS';
export type StatusAtividade = 'planejada' | 'concluida' | 'nao_realizada';

export interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Atividade {
  id:string;
  titulo: string;
  data: string; // YYYY-MM-DD format
  semana: string;
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string; // Obrigatório se tipo === "Projeto"
  descricaoJira?: string; // Máximo 100 caracteres
  horas: number;
  status: StatusAtividade;
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
  semana: string;
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
  semana: string;
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string;
  descricaoJira?: string;
  horas: number;
  colaboradoresIds?: string[];
  status: StatusAtividade;
}

// Enums para uso em componentes
export const CARGOS: Cargo[] = [
  'Analista de TI',
  'Analista de Negócios'
];

export const TIPOS_ATIVIDADE: TipoAtividade[] = [
  'Melhoria',
  'Projeto',
  'Sustentação',
  'Administrativo',
  'Capacitação'
];

export const ENTIDADES: Entidade[] = [
  'SESI',
  'SENAI', 
  'IEL',
  'CIERGS',
  'GINFO',
  'SISTEMA FIERGS'
];

export const STATUS_ATIVIDADE: StatusAtividade[] = [
  'planejada',
  'concluida',
  'nao_realizada'
];

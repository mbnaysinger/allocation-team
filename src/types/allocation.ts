export type Cargo = 'Analista de TI' | 'Analista de Negócios';
export type TipoAtividade = 'Projeto' | 'Melhoria' | 'Sustentação';
export type Entidade = 'SESI' | 'SENAI' | 'IEL' | 'CIERGS' | 'GINFO' | 'SISTEMA FIERGS';

// Tipo para timestamp do Firestore
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo;
  ativo: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface Projeto {
  id: string;
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkJira?: string;
  ativo: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface Atividade {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD format
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string; // Obrigatório se tipo === "Projeto"
  descricaoJira?: string; // Máximo 100 caracteres
  horas: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface AtividadeCompleta extends Atividade {
  pessoa: Pessoa;
  projeto?: Projeto;
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

// Utilitários
export const getCoresHoras = (totalHoras: number) => {
  if (totalHoras === 0) return { cor: '#f3f4f6', texto: '#000000' }; // Cinza claro
  if (totalHoras <= 4) return { cor: '#f7fc6d', texto: '#000000' };   // Amarelo claro
  if (totalHoras <= 8) return { cor: '#6af27a', texto: '#000000' };   // Verde claro
  if (totalHoras > 8) return { cor: '#f53b3b', texto: '#FFFFFF' };    // Vermelho claro
  return { cor: '#f3f4f6', texto: '#000000' };
}; 
export type Cargo = 'Analista de TI' | 'Analista de Negócios';
export type TipoAtividade = 'Projeto' | 'Melhoria' | 'Sustentação';
export type Entidade = 'SESI' | 'SENAI' | 'IEL' | 'CIERGS' | 'GINFO' | 'SISTEMA FIERGS';

export interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo;
  ativo: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Projeto {
  id: string;
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade;
  linkJira?: string;
  ativo: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
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
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
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
  'Projeto',
  'Melhoria',
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
  if (totalHoras === 0) return { cor: '#f8f9fa', texto: '#6c757d' }; // Cinza claro
  if (totalHoras <= 4) return { cor: '#fff3cd', texto: '#856404' };   // Amarelo claro
  if (totalHoras <= 8) return { cor: '#d1edff', texto: '#0c5460' };   // Azul claro
  if (totalHoras > 8) return { cor: '#f8d7da', texto: '#721c24' };    // Vermelho claro
  return { cor: '#f8f9fa', texto: '#6c757d' };
}; 
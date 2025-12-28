import { Pessoa } from "./Pessoa";
import { Projeto, ProjetoSelect } from "./projeto/Projeto";

export type StatusAtividade = 'planejada' | 'concluida' | 'nao_realizada';
export type TipoAtividade = 'Projeto' | 'Melhoria' | 'Sustentação' | 'Administrativo' | 'Capacitação';


export interface Atividade {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD format
  semana: string;
  pessoaId: string;
  tipo: TipoAtividade;
  isDesvio?: boolean;
  projetoId?: string; // Obrigatório se tipo === "Projeto"
  descricaoJira?: string; // Máximo 8000 caracteres
  tempo: number;
  tmp_executado: number;
  status: StatusAtividade;
  posicao: number;
  version?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AtividadeCompleta extends Atividade {
  pessoa: Pessoa;
  projeto?: Projeto;
}

export interface AtividadeCard extends Atividade {
  projeto?: ProjetoSelect;
}

export interface DadosAtividade {
  titulo: string;
  data: string;
  semana: string;
  pessoaId: string;
  tipo: TipoAtividade;
  projetoId?: string;
  descricaoJira?: string;
  tempo: number;
  tmp_executado?: number; // Adicionado para o tempo executado
  colaboradoresIds?: string[];
  status: StatusAtividade;
  version?: number;
  isDesvio?: boolean;
  posicao?: number;
}

export const TIPOS_ATIVIDADE: TipoAtividade[] = [
  'Melhoria',
  'Projeto',
  'Sustentação',
  'Administrativo',
  'Capacitação'
];

export const STATUS_ATIVIDADE: StatusAtividade[] = [
  'planejada',
  'concluida',
  'nao_realizada'
];
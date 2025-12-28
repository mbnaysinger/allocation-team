export type Cargo = 'Analista de TI' | 'Analista de Negócios';
export type Squad = 'Desenvolvimento' | 'Integrações' | 'Oracle' | 'ERP Protheus' | 'SGE' | 'Power Platform';

export interface Pessoa {
    id: string;
    nome: string;
    cargo: Cargo;
    squad: Squad;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

export interface DadosPessoa {
    nome: string;
    cargo: Cargo;
    squad: Squad;
  }

// Enums para uso em componentes
export const CARGOS: Cargo[] = [
    'Analista de TI',
    'Analista de Negócios'
  ];

export const SQUADS: Squad[] = [
    'Desenvolvimento',
    'Integrações',
    'Oracle',
    'ERP Protheus',
    'SGE',
    'Power Platform'
  ];
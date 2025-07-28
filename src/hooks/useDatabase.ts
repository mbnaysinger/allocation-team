import { useMongoDBClient } from './useMongoDBClient';
import { isUsingMongoDB } from '../lib/config';
import { Pessoa, Projeto, AtividadeCompleta } from '../types/allocation';

interface UseDatabaseProps {
  dataInicio: string;
  dataFim: string;
}

interface DatabaseHookReturn {
  pessoas: Pessoa[];
  projetos: Projeto[];
  atividades: AtividadeCompleta[];
  loading: boolean;
  error: string | null;
  adicionarPessoa: (dados: any) => Promise<void>;
  adicionarProjeto: (dados: any) => Promise<void>;
  adicionarAtividade: (dados: any) => Promise<void>;
  editarAtividade: (id: string, dados: any) => Promise<void>;
  deletarAtividade: (id: string) => Promise<void>;
  clonarAtividade: (id: string) => Promise<void>;
  calcularHorasDia: (pessoaId: string, data: string) => Promise<number>;
  recarregarDados: () => Promise<void>;
  limparErro: () => void;
  databaseType: 'mongodb' | 'firebase';
}

/**
 * Hook que escolhe automaticamente entre Firebase e MongoDB
 * baseado na configuração do ambiente
 */
export const useDatabase = ({ dataInicio, dataFim }: UseDatabaseProps): DatabaseHookReturn => {
  const mongodbHook = useMongoDBClient({ dataInicio, dataFim });

  // Escolhe o hook baseado na configuração
  if (isUsingMongoDB()) {
    return {
      ...mongodbHook,
      databaseType: 'mongodb' as const
    };
  } else {
    // Importação dinâmica do Firebase apenas quando necessário
    const { useGerenciadorAtividades } = require('./useGerenciadorAtividades');
    const firebaseHook = useGerenciadorAtividades({ dataInicio, dataFim });
    
    return {
      ...firebaseHook,
      databaseType: 'firebase' as const
    };
  }
};

// Hook específico para MongoDB (força o uso do MongoDB)
export const useMongoDBOnly = ({ dataInicio, dataFim }: UseDatabaseProps): DatabaseHookReturn => {
  return {
    ...useMongoDBClient({ dataInicio, dataFim }),
    databaseType: 'mongodb' as const
  };
};

// Hook específico para Firebase (força o uso do Firebase)
export const useFirebaseOnly = ({ dataInicio, dataFim }: UseDatabaseProps): DatabaseHookReturn => {
  const { useGerenciadorAtividades } = require('./useGerenciadorAtividades');
  return {
    ...useGerenciadorAtividades({ dataInicio, dataFim }),
    databaseType: 'firebase' as const
  };
}; 
import { useMongoDBClient } from './useMongoDBClient';
import { isUsingMongoDB } from '../lib/config';
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';

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
  adicionarPessoa: (dados: DadosPessoa) => Promise<void>;
  adicionarProjeto: (dados: DadosProjeto) => Promise<void>;
  adicionarAtividade: (dados: DadosAtividade) => Promise<void>;
  editarAtividade: (id: string, dados: Partial<DadosAtividade>) => Promise<void>;
  deletarAtividade: (id: string) => Promise<void>;
  clonarAtividade: (id: string) => Promise<void>;
  calcularHorasDia: (pessoaId: string, data: string) => Promise<number>;
  recarregarDados: () => Promise<void>;
  limparErro: () => void;
  databaseType: 'mongodb' | 'firebase';
  
  // Funções otimizadas para atualizações específicas
  adicionarAtividadeOptimized?: (dados: DadosAtividade, pessoaId: string) => Promise<void>;
  editarAtividadeOptimized?: (id: string, dados: Partial<DadosAtividade>, pessoaId: string) => Promise<void>;
  deletarAtividadeOptimized?: (id: string, pessoaId: string) => Promise<void>;
  clonarAtividadeOptimized?: (id: string, pessoaId: string) => Promise<void>;
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useGerenciadorAtividades } = require('./useGerenciadorAtividades');
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useGerenciadorAtividades } = require('./useGerenciadorAtividades');
  return {
    ...useGerenciadorAtividades({ dataInicio, dataFim }),
    databaseType: 'firebase' as const
  };
}; 
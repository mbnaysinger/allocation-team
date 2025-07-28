import { useState, useEffect, useCallback } from 'react';
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';
import { useScrollPreservation } from './useScrollPreservation';

interface UseMongoDBClientProps {
  dataInicio: string;
  dataFim: string;
}

export const useMongoDBClient = ({ dataInicio, dataFim }: UseMongoDBClientProps) => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [atividades, setAtividades] = useState<AtividadeCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { executeWithScrollPreservation } = useScrollPreservation();

  // Função para recarregar todos os dados
  const recarregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/mongodb?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }
      
      const data = await response.json();
      
      setPessoas(data.pessoas || []);
      setProjetos(data.projetos || []);
      setAtividades(data.atividades || []);
    } catch (err) {
      console.error('Erro ao recarregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  // Recarregar dados quando as datas mudam
  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  // Função para fazer requisições POST
  const makeRequest = useCallback(async (action: string, data: any) => {
    try {
      const response = await fetch('/api/mongodb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error(`Erro na ação ${action}:`, err);
      throw err;
    }
  }, []);

  // Função para adicionar pessoa
  const adicionarPessoa = useCallback(async (dadosPessoa: DadosPessoa) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('addPessoa', dadosPessoa);
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao adicionar pessoa:', err);
        setError(err instanceof Error ? err.message : 'Erro ao adicionar pessoa');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // Função para adicionar projeto
  const adicionarProjeto = useCallback(async (dadosProjeto: DadosProjeto) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('addProjeto', dadosProjeto);
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao adicionar projeto:', err);
        setError(err instanceof Error ? err.message : 'Erro ao adicionar projeto');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // Função para adicionar atividade
  const adicionarAtividade = useCallback(async (dadosAtividade: DadosAtividade) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('addAtividade', dadosAtividade);
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao adicionar atividade:', err);
        setError(err instanceof Error ? err.message : 'Erro ao adicionar atividade');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // Função para editar atividade
  const editarAtividade = useCallback(async (atividadeId: string, dadosAtualizados: Partial<DadosAtividade>) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('updateAtividade', { id: atividadeId, ...dadosAtualizados });
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao editar atividade:', err);
        setError(err instanceof Error ? err.message : 'Erro ao editar atividade');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // Função para deletar atividade
  const deletarAtividade = useCallback(async (atividadeId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('deleteAtividade', { id: atividadeId });
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao deletar atividade:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // Função para clonar atividade
  const clonarAtividade = useCallback(async (atividadeId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        await makeRequest('cloneAtividade', { id: atividadeId });
        await recarregarDados();
      } catch (err) {
        console.error('Erro ao clonar atividade:', err);
        setError(err instanceof Error ? err.message : 'Erro ao clonar atividade');
        throw err;
      }
    });
  }, [makeRequest, recarregarDados, executeWithScrollPreservation]);

  // ===== FUNÇÕES OTIMIZADAS PARA ATUALIZAÇÕES ESPECÍFICAS =====
  
  // Função para adicionar atividade otimizada
  const adicionarAtividadeOptimized = useCallback(async (dadosAtividade: DadosAtividade, pessoaId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        const response = await makeRequest('addAtividadeOptimized', {
          ...dadosAtividade,
          pessoaId,
          dataInicio,
          dataFim
        });
        
        if (response.success && response.data) {
          // Atualizar apenas as atividades do usuário específico
          setAtividades(prevAtividades => {
            // Remover atividades antigas do usuário
            const outrasAtividades = prevAtividades.filter(a => a.pessoaId !== pessoaId);
            // Adicionar as novas atividades
            return [...outrasAtividades, ...response.data];
          });
        }
      } catch (err) {
        console.error('Erro ao adicionar atividade otimizada:', err);
        setError(err instanceof Error ? err.message : 'Erro ao adicionar atividade');
        throw err;
      }
    });
  }, [makeRequest, dataInicio, dataFim, executeWithScrollPreservation]);

  // Função para editar atividade otimizada
  const editarAtividadeOptimized = useCallback(async (atividadeId: string, dadosAtualizados: Partial<DadosAtividade>, pessoaId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        const response = await makeRequest('updateAtividadeOptimized', {
          id: atividadeId,
          pessoaId,
          dataInicio,
          dataFim,
          ...dadosAtualizados
        });
        
        if (response.success && response.data) {
          // Atualizar apenas as atividades do usuário específico
          setAtividades(prevAtividades => {
            // Remover atividades antigas do usuário
            const outrasAtividades = prevAtividades.filter(a => a.pessoaId !== pessoaId);
            // Adicionar as novas atividades
            return [...outrasAtividades, ...response.data];
          });
        }
      } catch (err) {
        console.error('Erro ao editar atividade otimizada:', err);
        setError(err instanceof Error ? err.message : 'Erro ao editar atividade');
        throw err;
      }
    });
  }, [makeRequest, dataInicio, dataFim, executeWithScrollPreservation]);

  // Função para deletar atividade otimizada
  const deletarAtividadeOptimized = useCallback(async (atividadeId: string, pessoaId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        const response = await makeRequest('deleteAtividadeOptimized', {
          id: atividadeId,
          pessoaId,
          dataInicio,
          dataFim
        });
        
        if (response.success && response.data) {
          // Atualizar apenas as atividades do usuário específico
          setAtividades(prevAtividades => {
            // Remover atividades antigas do usuário
            const outrasAtividades = prevAtividades.filter(a => a.pessoaId !== pessoaId);
            // Adicionar as novas atividades
            return [...outrasAtividades, ...response.data];
          });
        }
      } catch (err) {
        console.error('Erro ao deletar atividade otimizada:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
        throw err;
      }
    });
  }, [makeRequest, dataInicio, dataFim, executeWithScrollPreservation]);

  // Função para clonar atividade otimizada
  const clonarAtividadeOptimized = useCallback(async (atividadeId: string, pessoaId: string) => {
    return executeWithScrollPreservation(async () => {
      try {
        setError(null);
        const response = await makeRequest('cloneAtividadeOptimized', {
          id: atividadeId,
          pessoaId,
          dataInicio,
          dataFim
        });
        
        if (response.success && response.data) {
          // Atualizar apenas as atividades do usuário específico
          setAtividades(prevAtividades => {
            // Remover atividades antigas do usuário
            const outrasAtividades = prevAtividades.filter(a => a.pessoaId !== pessoaId);
            // Adicionar as novas atividades
            return [...outrasAtividades, ...response.data];
          });
        }
      } catch (err) {
        console.error('Erro ao clonar atividade otimizada:', err);
        setError(err instanceof Error ? err.message : 'Erro ao clonar atividade');
        throw err;
      }
    });
  }, [makeRequest, dataInicio, dataFim, executeWithScrollPreservation]);

  // Função para calcular horas do dia
  const calcularHorasDia = useCallback(async (pessoaId: string, data: string): Promise<number> => {
    try {
      const atividadesPessoa = atividades.filter(a => 
        a.pessoaId === pessoaId && a.data === data
      );
      return atividadesPessoa.reduce((total, atividade) => total + (atividade.horas || 0), 0);
    } catch (err) {
      console.error('Erro ao calcular horas do dia:', err);
      return 0;
    }
  }, [atividades]);

  return {
    // Estados
    pessoas,
    projetos,
    atividades,
    loading,
    error,
    
    // Funções principais
    recarregarDados,
    adicionarPessoa,
    adicionarProjeto,
    adicionarAtividade,
    editarAtividade,
    deletarAtividade,
    clonarAtividade,
    calcularHorasDia,
    
    // Funções otimizadas
    adicionarAtividadeOptimized,
    editarAtividadeOptimized,
    deletarAtividadeOptimized,
    clonarAtividadeOptimized,
    
    // Função para limpar erro
    limparErro: () => setError(null)
  };
}; 
import { useState, useEffect, useCallback } from 'react';
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';

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
    try {
      setError(null);
      await makeRequest('addPessoa', dadosPessoa);
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao adicionar pessoa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pessoa');
      throw err;
    }
  }, [makeRequest, recarregarDados]);

  // Função para adicionar projeto
  const adicionarProjeto = useCallback(async (dadosProjeto: DadosProjeto) => {
    try {
      setError(null);
      await makeRequest('addProjeto', dadosProjeto);
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao adicionar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar projeto');
      throw err;
    }
  }, [makeRequest, recarregarDados]);

  // Função para adicionar atividade
  const adicionarAtividade = useCallback(async (dadosAtividade: DadosAtividade) => {
    try {
      setError(null);
      await makeRequest('addAtividade', dadosAtividade);
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar atividade');
      throw err;
    }
  }, [makeRequest, recarregarDados]);

  // Função para editar atividade
  const editarAtividade = useCallback(async (atividadeId: string, dadosAtualizados: Partial<DadosAtividade>) => {
    try {
      setError(null);
      await makeRequest('updateAtividade', { id: atividadeId, ...dadosAtualizados });
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao editar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao editar atividade');
      throw err;
    }
  }, [makeRequest, recarregarDados]);

  // Função para deletar atividade
  const deletarAtividade = useCallback(async (atividadeId: string) => {
    try {
      setError(null);
      await makeRequest('deleteAtividade', { id: atividadeId });
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao deletar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
      throw err;
    }
  }, [makeRequest, recarregarDados]);

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
    calcularHorasDia,
    
    // Função para limpar erro
    limparErro: () => setError(null)
  };
}; 
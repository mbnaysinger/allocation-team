import { useState, useEffect, useCallback } from 'react';
import { MongoDBService } from '../lib/mongodb-service';
import { Pessoa, Projeto, Atividade, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';

interface UseMongoDBProps {
  dataInicio: string;
  dataFim: string;
}

export const useMongoDB = ({ dataInicio, dataFim }: UseMongoDBProps) => {
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
      
      const [pessoasData, projetosData, atividadesData] = await Promise.all([
        MongoDBService.getPessoas(),
        MongoDBService.getProjetos(),
        MongoDBService.getAtividadesCompletasPorPeriodo(dataInicio, dataFim)
      ]);
      
      setPessoas(pessoasData);
      setProjetos(projetosData);
      setAtividades(atividadesData);
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

  // Função para adicionar pessoa
  const adicionarPessoa = useCallback(async (dadosPessoa: DadosPessoa) => {
    try {
      setError(null);
      const novaPessoa = await MongoDBService.addPessoa({
        ...dadosPessoa,
        ativo: true
      });
      if (novaPessoa) {
        await recarregarDados();
      }
    } catch (err) {
      console.error('Erro ao adicionar pessoa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pessoa');
      throw err;
    }
  }, [recarregarDados]);

  // Função para adicionar projeto
  const adicionarProjeto = useCallback(async (dadosProjeto: DadosProjeto) => {
    try {
      setError(null);
      const novoProjeto = await MongoDBService.addProjeto({
        ...dadosProjeto,
        ativo: true
      });
      if (novoProjeto) {
        await recarregarDados();
      }
    } catch (err) {
      console.error('Erro ao adicionar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar projeto');
      throw err;
    }
  }, [recarregarDados]);

  // Função para adicionar atividade
  const adicionarAtividade = useCallback(async (dadosAtividade: DadosAtividade) => {
    try {
      setError(null);
      const novaAtividade = await MongoDBService.addAtividade(dadosAtividade);
      if (novaAtividade) {
        await recarregarDados();
      }
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar atividade');
      throw err;
    }
  }, [recarregarDados]);

  // Função para editar atividade
  const editarAtividade = useCallback(async (atividadeId: string, dadosAtualizados: Partial<DadosAtividade>) => {
    try {
      setError(null);
      const sucesso = await MongoDBService.updateAtividade(atividadeId, dadosAtualizados);
      if (sucesso) {
        await recarregarDados();
      }
    } catch (err) {
      console.error('Erro ao editar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao editar atividade');
      throw err;
    }
  }, [recarregarDados]);

  // Função para deletar atividade
  const deletarAtividade = useCallback(async (atividadeId: string) => {
    try {
      setError(null);
      const sucesso = await MongoDBService.deleteAtividade(atividadeId);
      if (sucesso) {
        await recarregarDados();
      }
    } catch (err) {
      console.error('Erro ao deletar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
      throw err;
    }
  }, [recarregarDados]);

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
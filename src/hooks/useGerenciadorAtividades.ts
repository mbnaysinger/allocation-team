import { useState, useEffect, useCallback } from 'react';
import { 
  getPessoas, 
  getProjetos, 
  getAtividadesSemana, 
  criarPessoa, 
  criarProjeto, 
  criarAtividade, 
  atualizarAtividade, 
  deletarAtividade,
  getTotalHorasPorDia
} from '../lib/firestore';
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from '../types/allocation';

interface UseGerenciadorAtividadesProps {
  dataInicio: string;
  dataFim: string;
}

export const useGerenciadorAtividades = ({ dataInicio, dataFim }: UseGerenciadorAtividadesProps) => {
  // Estados
  const [atividades, setAtividades] = useState<AtividadeCompleta[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para recarregar todos os dados
  const recarregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pessoasData, projetosData, atividadesData] = await Promise.all([
        getPessoas(),
        getProjetos(),
        getAtividadesSemana(dataInicio, dataFim)
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
      await criarPessoa(dadosPessoa);
      await recarregarDados();
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
      await criarProjeto(dadosProjeto);
      await recarregarDados();
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
      await criarAtividade(dadosAtividade);
      await recarregarDados();
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
      await atualizarAtividade(atividadeId, dadosAtualizados);
      await recarregarDados();
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
      await deletarAtividade(atividadeId);
      await recarregarDados();
    } catch (err) {
      console.error('Erro ao deletar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
      throw err;
    }
  }, [recarregarDados]);

  // Função para calcular horas do dia (com cache local)
  const calcularHorasDia = useCallback(async (pessoaId: string, data: string): Promise<number> => {
    try {
      return await getTotalHorasPorDia(pessoaId, data);
    } catch (err) {
      console.error('Erro ao calcular horas do dia:', err);
      return 0;
    }
  }, []);

  // Função para obter atividades de uma pessoa em uma data específica
  const getAtividadesPessoaData = useCallback((pessoaId: string, data: string) => {
    return atividades.filter(atividade => 
      atividade.pessoaId === pessoaId && atividade.data === data
    );
  }, [atividades]);

  // Função para obter pessoas ativas
  const getPessoasAtivas = useCallback(() => {
    return pessoas.filter(pessoa => pessoa.ativo);
  }, [pessoas]);

  // Função para obter projetos ativos
  const getProjetosAtivos = useCallback(() => {
    return projetos.filter(projeto => projeto.ativo);
  }, [projetos]);

  return {
    // Estados
    atividades,
    pessoas,
    projetos,
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
    
    // Funções utilitárias
    getAtividadesPessoaData,
    getPessoasAtivas,
    getProjetosAtivos,
    
    // Função para limpar erro
    limparErro: () => setError(null)
  };
}; 
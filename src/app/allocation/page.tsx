"use client";

import React, { useState } from "react";
import AllocationHeader from "../molecules/AllocationHeader";
import AllocationControls from "../molecules/AllocationControls";
import PersonCard from "../molecules/PersonCard";
import AllocationLegend from "../molecules/AllocationLegend";
import ModalAdicionarPessoa from "../molecules/ModalAdicionarPessoa";
import ModalAdicionarProjeto from "../molecules/ModalAdicionarProjeto";
import ModalAdicionarAtividade from "../molecules/ModalAdicionarAtividade";
import ModalEditarAtividade from "../molecules/ModalEditarAtividade";
import FirebaseDebugger from "../atoms/FirebaseDebugger";
import { useDatabase } from "../../hooks/useDatabase";
import { DadosPessoa, DadosProjeto, DadosAtividade, AtividadeCompleta, Pessoa } from "../../types/allocation";
import { transactionLogger } from "../../lib/logger";



const AllocationPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Estados dos modais
  const [modalAdicionarPessoa, setModalAdicionarPessoa] = useState(false);
  const [modalAdicionarProjeto, setModalAdicionarProjeto] = useState(false);
  const [modalAdicionarAtividade, setModalAdicionarAtividade] = useState(false);
  const [modalEditarAtividade, setModalEditarAtividade] = useState(false);
  const [modalFirebaseDebugger, setModalFirebaseDebugger] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<AtividadeCompleta | null>(null);
  const [loading, setLoading] = useState(false);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return { start, end };
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const { start, end } = getWeekDates(currentWeek);
  
  // Hook para gerenciar dados
  const {
    pessoas,
    projetos,
    atividades,
    loading: dadosLoading,
    error,
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
    clonarAtividadeOptimized
  } = useDatabase({
    dataInicio: start.toISOString().split('T')[0],
    dataFim: end.toISOString().split('T')[0]
  });

  // Handlers dos modais
  const handleAdicionarPessoa = async (dados: DadosPessoa) => {
    const transactionId = transactionLogger.startTransaction('handleAdicionarPessoa', { dados });
    
    setLoading(true);
    try {
      transactionLogger.logOperation('Iniciando adição de pessoa na página', { dados });
      await adicionarPessoa(dados);
      transactionLogger.successTransaction(transactionId, 'handleAdicionarPessoa', { dados });
      // Fechar modal apenas em caso de sucesso
      setModalAdicionarPessoa(false);
    } catch (error) {
      transactionLogger.errorTransaction(transactionId, 'handleAdicionarPessoa', error);
      console.error('Erro ao adicionar pessoa:', error);
      // Não fechar modal em caso de erro para permitir correção
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarProjeto = async (dados: DadosProjeto) => {
    setLoading(true);
    try {
      await adicionarProjeto(dados);
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarAtividade = async (dados: DadosAtividade) => {
    setLoading(true);
    try {
      // Usar função otimizada se disponível, senão usar a normal
      if (adicionarAtividadeOptimized) {
        await adicionarAtividadeOptimized(dados, dados.pessoaId);
      } else {
        await adicionarAtividade(dados);
      }
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarAtividade = async (atividadeId: string, dados: Partial<DadosAtividade>) => {
    setLoading(true);
    try {
      // Encontrar a atividade para obter o pessoaId
      const atividade = atividades.find(a => a.id === atividadeId);
      const pessoaId = atividade?.pessoaId;
      
      // Usar função otimizada se disponível e pessoaId encontrado, senão usar a normal
      if (editarAtividadeOptimized && pessoaId) {
        await editarAtividadeOptimized(atividadeId, dados, pessoaId);
      } else {
        await editarAtividade(atividadeId, dados);
      }
    } catch (error) {
      console.error('Erro ao editar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarAtividade = async (atividadeId: string) => {
    setLoading(true);
    try {
      // Encontrar a atividade para obter o pessoaId
      const atividade = atividades.find(a => a.id === atividadeId);
      const pessoaId = atividade?.pessoaId;
      
      // Usar função otimizada se disponível e pessoaId encontrado, senão usar a normal
      if (deletarAtividadeOptimized && pessoaId) {
        await deletarAtividadeOptimized(atividadeId, pessoaId);
      } else {
        await deletarAtividade(atividadeId);
      }
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClonarAtividade = async (atividadeId: string) => {
    setLoading(true);
    try {
      // Encontrar a atividade para obter o pessoaId
      const atividade = atividades.find(a => a.id === atividadeId);
      const pessoaId = atividade?.pessoaId;
      
      // Usar função otimizada se disponível e pessoaId encontrado, senão usar a normal
      if (clonarAtividadeOptimized && pessoaId) {
        await clonarAtividadeOptimized(atividadeId, pessoaId);
      } else {
        await clonarAtividade(atividadeId);
      }
    } catch (error) {
      console.error('Erro ao clonar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveAtividade = async (atividadeId: string, novaData: string) => {
    setLoading(true);
    try {
      // Encontrar a atividade para obter o pessoaId
      const atividade = atividades.find(a => a.id === atividadeId);
      const pessoaId = atividade?.pessoaId;
      
      // Usar função otimizada se disponível e pessoaId encontrado, senão usar a normal
      if (editarAtividadeOptimized && pessoaId) {
        await editarAtividadeOptimized(atividadeId, { data: novaData }, pessoaId);
      } else {
        await editarAtividade(atividadeId, { data: novaData });
      }
    } catch (error) {
      console.error('Erro ao mover atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = (data: string, pessoa: Pessoa) => {
    setDataSelecionada(data);
    setPessoaSelecionada(pessoa);
    setModalAdicionarAtividade(true);
  };

  const handleEditAllocation = (atividadeId: string) => {
    const atividade = atividades.find((a: AtividadeCompleta) => a.id === atividadeId);
    if (atividade) {
      setAtividadeSelecionada(atividade);
      setModalEditarAtividade(true);
    }
  };

  if (dadosLoading) {
    return (
      <main className="min-h-screen bg-bg text-text-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-light">Carregando dados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-light">
      <div className="max-w-7xl mx-auto">
        <AllocationHeader />
        
        <AllocationControls
          weekStart={start}
          weekEnd={end}
          onPreviousWeek={() => navigateWeek('prev')}
          onNextWeek={() => navigateWeek('next')}
          onAddPerson={() => setModalAdicionarPessoa(true)}
          onAddProject={() => setModalAdicionarProjeto(true)}
          onOpenFirebaseDebugger={() => setModalFirebaseDebugger(true)}
        />

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mx-4 md:mx-8 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          {(pessoas as Pessoa[]).map((pessoa: Pessoa) => (
            <PersonCard
              key={pessoa.id}
              person={pessoa}
              weekStart={start}
              atividades={atividades}
              onAddAllocation={handleAddAllocation}
              onEditAllocation={handleEditAllocation}
              onCloneAllocation={handleClonarAtividade}
              onMoveAtividade={handleMoveAtividade}
              calcularHorasDia={calcularHorasDia}
            />
          ))}
        </div>

        <AllocationLegend />

        {/* Modais */}
        <ModalAdicionarPessoa
          isOpen={modalAdicionarPessoa}
          onClose={() => setModalAdicionarPessoa(false)}
          onSubmit={handleAdicionarPessoa}
          loading={loading}
        />

        <ModalAdicionarProjeto
          isOpen={modalAdicionarProjeto}
          onClose={() => setModalAdicionarProjeto(false)}
          onSubmit={handleAdicionarProjeto}
          loading={loading}
        />

        <ModalAdicionarAtividade
          isOpen={modalAdicionarAtividade}
          onClose={() => {
            setModalAdicionarAtividade(false);
            setPessoaSelecionada(null);
          }}
          onSubmit={handleAdicionarAtividade}
          pessoas={pessoas}
          projetos={projetos}
          dataSelecionada={dataSelecionada}
          pessoaSelecionada={pessoaSelecionada}
          loading={loading}
        />

        <ModalEditarAtividade
          isOpen={modalEditarAtividade}
          onClose={() => {
            setModalEditarAtividade(false);
            setAtividadeSelecionada(null);
          }}
          onSubmit={handleEditarAtividade}
          onDelete={handleDeletarAtividade}
          atividade={atividadeSelecionada}
          pessoas={pessoas}
          projetos={projetos}
          loading={loading}
        />

        {/* Firebase Debugger para desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <FirebaseDebugger
            isOpen={modalFirebaseDebugger}
            onClose={() => setModalFirebaseDebugger(false)}
          />
        )}
      </div>
    </main>
  );
};

export default AllocationPage; 
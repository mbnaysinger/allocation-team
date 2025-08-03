"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import AllocationHeader from "@/components/features/allocation/AllocationHeader";
import AllocationControls from "@/components/features/allocation/AllocationControls";
import PersonCard from "@/components/features/allocation/PersonCard";
import AllocationLegend from "@/components/features/allocation/AllocationLegend";
import ModalAdicionarPessoa from "@/components/features/modals/ModalAdicionarPessoa";
import ModalAdicionarProjeto from "@/components/features/modals/ModalAdicionarProjeto";
import ModalAdicionarAtividade from "@/components/features/modals/ModalAdicionarAtividade";
import ModalEditarAtividade from "@/components/features/modals/ModalEditarAtividade";
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade } from "@/core/models";

interface AllocationClientViewProps {
  initialData: {
    pessoas: Pessoa[];
    projetos: Projeto[];
    atividades: AtividadeCompleta[];
  };
  week: {
    start: Date;
    end: Date;
  };
}

const AllocationClientView: React.FC<AllocationClientViewProps> = ({ initialData, week }) => {
  const router = useRouter();

  const [pessoas, setPessoas] = useState(initialData.pessoas);
  const [projetos, setProjetos] = useState(initialData.projetos);
  const [atividades, setAtividades] = useState(initialData.atividades);
  
  useEffect(() => {
    setPessoas(initialData.pessoas);
    setProjetos(initialData.projetos);
    setAtividades(initialData.atividades);
  }, [initialData]);

  const [modalAdicionarPessoa, setModalAdicionarPessoa] = useState(false);
  const [modalAdicionarProjeto, setModalAdicionarProjeto] = useState(false);
  const [modalAdicionarAtividade, setModalAdicionarAtividade] = useState(false);
  const [modalEditarAtividade, setModalEditarAtividade] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<AtividadeCompleta | null>(null);
  const [loading, setLoading] = useState(false);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStartDate = new Date(week.start);
    newStartDate.setDate(newStartDate.getDate() + (direction === 'next' ? 7 : -7));
    
    // Format YYYY-MM-DD
    const isoDate = newStartDate.toISOString().split('T')[0];
    router.push(`/allocation?data=${isoDate}`);
  };
  
  const calcularHorasDia = (pessoaId: string, data: string) => {
    return atividades
      .filter(a => a.pessoaId === pessoaId && a.data === data)
      .reduce((acc, a) => acc + a.horas, 0);
  };

  const handleAdicionarPessoa = async (dados: DadosPessoa) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/pessoas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar pessoa.');
      }
      
      setModalAdicionarPessoa(false);
      router.refresh(); 

    } catch (error) {
      console.error(error);
      // TODO: Mostrar o erro para o usuário no modal
    } finally {
      setLoading(false);
    }
  };
  const handleAdicionarProjeto = async (dados: DadosProjeto) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar projeto.');
      }
      
      setModalAdicionarProjeto(false);
      router.refresh(); 

    } catch (error) {
      console.error(error);
      // TODO: Mostrar o erro para o usuário no modal
    } finally {
      setLoading(false);
    }
  };
  const handleAdicionarAtividade = async (dados: DadosAtividade) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar atividade.');
      }
      
      setModalAdicionarAtividade(false);
      const novasAtividades = await response.json();
      setAtividades(prev => [...prev, ...novasAtividades]);

    } catch (error) {
      console.error(error);
      // TODO: Mostrar erro no modal
    } finally {
      setLoading(false);
    }
  };
  const handleEditarAtividade = async (atividadeId: string, dados: Partial<DadosAtividade>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/atividades/atualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: atividadeId, ...dados }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao editar atividade.');
      }
      
      setModalEditarAtividade(false);
      const atividadeAtualizada = await response.json();
      setAtividades(prev => 
        prev.map(atividade => 
          atividade.id === atividadeId ? atividadeAtualizada : atividade
        )
      );

    } catch (error) {
      console.error(error);
      // TODO: Mostrar erro no modal
    } finally {
      setLoading(false);
    }
  };
  const handleDeletarAtividade = async (atividadeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/atividades/${atividadeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao deletar atividade.');
      }
      
      setModalEditarAtividade(false);
      setAtividades(prev => prev.filter(atividade => atividade.id !== atividadeId));

    } catch (error) {
      console.error(error);
      // TODO: Mostrar erro no modal
    } finally {
      setLoading(false);
    }
  };
  const handleClonarAtividade = async (atividadeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/clone-atividade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: atividadeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao clonar atividade.');
      }
      
      const atividadeClonada = await response.json();
    
      setAtividades(prev => [...prev, atividadeClonada]);
    } catch (error) {
      console.error(error);
      // TODO: Mostrar erro no modal
    } finally {
      setLoading(false);
    }
  };
  const handleMoveAtividade = async (atividadeId: string, novaData: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/atividades/atualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: atividadeId, data: novaData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao mover atividade.');
      }
      //atualiza no formato otimista
      const atividadeAtualizada = await response.json();
      setAtividades(prev => 
        prev.map(atividade => 
          atividade.id === atividadeId ? atividadeAtualizada : atividade
        )
      );

    } catch (error) {
      console.error(error);
      // TODO: Mostrar erro no modal
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

  return (
    <>
      <AllocationHeader />
      
      <AllocationControls
        weekStart={week.start}
        weekEnd={week.end}
        onPreviousWeek={() => navigateWeek('prev')}
        onNextWeek={() => navigateWeek('next')}
        onAddPerson={() => setModalAdicionarPessoa(true)}
        onAddProject={() => setModalAdicionarProjeto(true)}
      />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {pessoas.map((pessoa: Pessoa) => (
          <PersonCard
            key={pessoa.id}
            person={pessoa}
            weekStart={week.start}
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
    </>
  );
};

export default AllocationClientView;

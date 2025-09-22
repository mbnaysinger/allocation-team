"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react"; // Importar signOut
import AllocationHeader from "@/components/features/allocation/AllocationHeader";
import AllocationControls from "@/components/features/allocation/AllocationControls";
import PersonCard from "@/components/features/allocation/PersonCard";
import AllocationLegend from "@/components/features/allocation/AllocationLegend";
import ModalAdicionarPessoa from "@/components/features/modals/ModalAdicionarPessoa";
import ModalAdicionarProjeto from "@/components/features/modals/ModalAdicionarProjeto";
import ModalAdicionarAtividade from "@/components/features/modals/ModalAdicionarAtividade";
import ModalEditarAtividade from "@/components/features/modals/ModalEditarAtividade";
import ModalResumoSemanal from "@/components/features/modals/ModalResumoSemanal";
import { Pessoa, Projeto, AtividadeCompleta, DadosPessoa, DadosProjeto, DadosAtividade, StatusAtividade, ResumoSemanal } from "@/core/models";

interface AllocationClientViewProps {
  initialData: {
    pessoas: Pessoa[];
    projetos: Projeto[];
    atividades: AtividadeCompleta[];
    resumosSemanais: ResumoSemanal[];
  };
  week: {
    start: Date;
    end: Date;
  };
}

const AllocationClientView: React.FC<AllocationClientViewProps> = ({ initialData, week }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [pessoas, setPessoas] = useState(initialData.pessoas);
  const [projetos, setProjetos] = useState(initialData.projetos);
  const [atividades, setAtividades] = useState(initialData.atividades);
  const [resumos, setResumos] = useState(initialData.resumosSemanais);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [projetosFiltrados, setProjetosFiltrados] = useState<Projeto[]>([]);
  const [colaboradoresOptions, setColaboradoresOptions] = useState<Pessoa[]>([]);
  
  useEffect(() => {
    setPessoas(initialData.pessoas);
    setProjetos(initialData.projetos);
    setAtividades(initialData.atividades);
    setResumos(initialData.resumosSemanais);

    // Busca a lista completa de pessoas para os modais
    const fetchPessoasParaModal = async () => {
      try {
        const response = await fetch('/api/v1/pessoas');
        if (!response.ok) throw new Error('Falha ao buscar pessoas');
        const data = await response.json();
        setColaboradoresOptions(data);
      } catch (error) {
        console.error("Erro ao carregar lista de colaboradores:", error);
        setColaboradoresOptions([]); // Garante que não quebre se a API falhar
      }
    };

    fetchPessoasParaModal();
  }, [initialData]);

  const [modalAdicionarPessoa, setModalAdicionarPessoa] = useState(false);
  const [modalAdicionarProjeto, setModalAdicionarProjeto] = useState(false);
  const [modalAdicionarAtividade, setModalAdicionarAtividade] = useState(false);
  const [modalEditarAtividade, setModalEditarAtividade] = useState(false);
  const [isResumoModalOpen, setIsResumoModalOpen] = useState(false);
  const [pessoaParaResumo, setPessoaParaResumo] = useState<Pessoa | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<AtividadeCompleta | null>(null);
  const [loading, setLoading] = useState(false);

  const pessoasExibidas = React.useMemo(() => {
    // 1. Define a lista base de pessoas (filtrada ou todas)
    let basePessoas = pessoasFiltradas.length > 0 ? pessoasFiltradas : pessoas;

    // 2. Se houver projetos filtrados, refine a lista de pessoas
    if (projetosFiltrados.length > 0) {
      const projetosFiltradosIds = new Set(projetosFiltrados.map(p => p.id));
      
      // Encontra os IDs das pessoas que têm atividades nos projetos selecionados
      const pessoasComAtividadesNosProjetos = new Set(
        atividades
          .filter(a => a.projetoId && projetosFiltradosIds.has(a.projetoId))
          .map(a => a.pessoaId)
      );

      // Filtra a lista base para incluir apenas essas pessoas
      basePessoas = basePessoas.filter(p => pessoasComAtividadesNosProjetos.has(p.id));
    }

    return basePessoas;
  }, [pessoas, pessoasFiltradas, projetosFiltrados, atividades]);


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

  const handleOpenResumoModal = (pessoa: Pessoa) => {
    setPessoaParaResumo(pessoa);
    setIsResumoModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: StatusAtividade) => {
    const originalAtividades = [...atividades];
    
    // Atualização Otimista
    const updatedActivities = atividades.map(a => 
      a.id === id ? { ...a, status: newStatus } : a
    );
    setAtividades(updatedActivities);

    try {
      const response = await fetch('/api/v1/atividades/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status no servidor.');
      }

    } catch (error) {
      console.error("Erro ao atualizar status, revertendo:", error);
      // Reverter em caso de erro
      setAtividades(originalAtividades);
      // TODO: Mostrar um toast/notificação de erro para o usuário
    }
  };

  const handleSalvarResumo = async (comentario: string) => {
    if (!pessoaParaResumo) return;
    setLoading(true);

    try {
      const response = await fetch('/api/v1/resumo-semanal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pessoaId: pessoaParaResumo.id,
          semana_inicio: week.start.toISOString().split('T')[0],
          comentario,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o resumo no servidor.');
      }
      
      const resumoSalvo = await response.json();
      
      // Atualiza o estado local com o resumo salvo
      setResumos(prev => {
        const index = prev.findIndex(r => r.id === resumoSalvo.id);
        if (index > -1) {
          const newResumos = [...prev];
          newResumos[index] = resumoSalvo;
          return newResumos;
        } else {
          return [...prev, resumoSalvo];
        }
      });
      
      setIsResumoModalOpen(false);

    } catch (error) {
      console.error("Erro ao salvar resumo:", error);
      // TODO: Mostrar um toast/notificação de erro para o usuário
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AllocationHeader />
      
      <button 
        onClick={() => signOut({ callbackUrl: '/login' })} 
        className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>

      <AllocationControls
        weekStart={week.start}
        weekEnd={week.end}
        onPreviousWeek={() => navigateWeek('prev')}
        onNextWeek={() => navigateWeek('next')}
        onAddPerson={() => setModalAdicionarPessoa(true)}
        onAddProject={() => setModalAdicionarProjeto(true)}
        onManageProjects={() => router.push('/projetos')}
        pessoas={pessoas}
        projetos={projetos}
        onFiltroPessoasChange={setPessoasFiltradas}
        onFiltroProjetosChange={setProjetosFiltrados}
        userRole={userRole}
      />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {pessoasExibidas.map((pessoa: Pessoa) => (
          <PersonCard
            key={pessoa.id}
            person={pessoa}
            weekStart={week.start}
            atividades={atividades}
            onAddAllocation={handleAddAllocation}
            onEditAllocation={handleEditAllocation}
            onCloneAllocation={handleClonarAtividade}
            onMoveAtividade={handleMoveAtividade}
            onUpdateStatus={handleUpdateStatus}
            onOpenResumoModal={handleOpenResumoModal}
            calcularHorasDia={calcularHorasDia}
            resumoDaSemana={resumos.find(r => r.pessoaId === pessoa.id)}
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
        pessoas={colaboradoresOptions}
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

      <ModalResumoSemanal
        isOpen={isResumoModalOpen}
        onClose={() => setIsResumoModalOpen(false)}
        onSubmit={handleSalvarResumo}
        pessoa={pessoaParaResumo}
        resumo={resumos.find(r => r.pessoaId === pessoaParaResumo?.id)}
        loading={loading}
      />
    </>
  );
};

export default AllocationClientView;

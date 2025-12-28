"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import AllocationHeader from "@/components/features/allocation/AllocationHeader";
import AllocationControls from "@/components/features/allocation/AllocationControls";
import PersonCard from "@/components/features/allocation/PersonCard";
import ModalAdicionarAtividade from "@/components/features/modals/ModalAdicionarAtividade";
import ModalEditarAtividade from "@/components/features/modals/ModalEditarAtividade";
import ModalResumoSemanal from "@/components/features/modals/ModalResumoSemanal";
import { AtividadeCompleta, DadosAtividade, StatusAtividade } from "@/backend/core/models/Atividade";
import { ResumoSemanal } from "@/backend/core/models/ResumoSemanal";
import { Pessoa } from "@/backend/core/models/Pessoa";
import { formatDate, getWeekString } from "@/app/utils/date";
import { Projeto } from "@/backend/core/models/projeto/Projeto";
import { addDays } from "date-fns";
import { SelectOption } from "@/components/ui/SearchableSelect";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/backend/core/models/UserRole";
import { arrayMove } from "@dnd-kit/sortable";

interface AllocationClientViewProps {
  weekStartDate: Date;
}

const AllocationClientView: React.FC<AllocationClientViewProps> = ({ weekStartDate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Data state
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [atividades, setAtividades] = useState<AtividadeCompleta[]>([]);
  const [resumos, setResumos] = useState<ResumoSemanal[]>([]);

  // Filter options state
  const [squadOptions, setSquadOptions] = useState<SelectOption[]>([]);
  const [pessoaOptions, setPessoaOptions] = useState<SelectOption[]>([]);
  const [projetoOptions, setProjetoOptions] = useState<SelectOption[]>([]);

  // Selected filters state
  const [selectedSquads, setSelectedSquads] = useState<SelectOption[]>([]);
  const [selectedPessoas, setSelectedPessoas] = useState<SelectOption[]>([]);
  const [selectedProjetos, setSelectedProjetos] = useState<SelectOption[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [showUseFiltersMessage, setShowUseFiltersMessage] = useState(false);

  // Modal state
  const [modalAdicionarAtividade, setModalAdicionarAtividade] = useState(false);
  const [modalEditarAtividade, setModalEditarAtividade] = useState(false);
  const [isResumoModalOpen, setIsResumoModalOpen] = useState(false);
  const [pessoaParaResumo, setPessoaParaResumo] = useState<Pessoa | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<AtividadeCompleta | null>(null);

  const [colaboradoresOptions, setColaboradoresOptions] = useState<Pessoa[]>([]);
  const [projetosModais, setProjetosModais] = useState<Projeto[]>([]);


  const fetchData = useCallback(async () => {
    setLoading(true);
    const week = getWeekString(weekStartDate);
    const params = new URLSearchParams();

    selectedSquads.forEach(s => params.append('squads', s.value));
    selectedPessoas.forEach(p => params.append('pessoas', p.value));
    selectedProjetos.forEach(p => params.append('projetos', p.value));

    const response = await fetch(`/api/v1/atividades/semana/${week}?${params.toString()}`);
    const data = await response.json();

    if (selectedSquads.length > 0 && selectedPessoas.length === 0 && selectedProjetos.length === 0) {
      const squadParams = new URLSearchParams();
      selectedSquads.forEach(s => squadParams.append('squads', s.value));
      const pessoasResponse = await fetch(`/api/v1/pessoas?${squadParams.toString()}`);
      const todasAsPessoasDaSquad = await pessoasResponse.json();

      const pessoasComAtividadesIds = new Set(data.pessoas.map((p: Pessoa) => p.id));
      const pessoasSemAtividades = todasAsPessoasDaSquad.filter((p: Pessoa) => !pessoasComAtividadesIds.has(p.id));

      setPessoas([...data.pessoas, ...pessoasSemAtividades]);
    } else {
      setPessoas(data.pessoas);
    }

    setAtividades(data.atividades);

    if (data.pessoas.length > 0 && userRole === UserRole.ADMIN) {
      const pessoaIds = data.pessoas.map((p: Pessoa) => p.id);
      const resumosParams = new URLSearchParams();
      pessoaIds.forEach((id: string) => resumosParams.append('pessoaIds', id));
      const resumosResponse = await fetch(`/api/v1/resumo-semanal/semana/${week}?${resumosParams.toString()}`);
      const resumosData = await resumosResponse.json();
      setResumos(resumosData || []);
    } else {
      setResumos([]);
    }

    setLoading(false);

    setShowUseFiltersMessage(data.pessoas.length === 0 && selectedSquads.length === 0 && selectedPessoas.length === 0);

  }, [weekStartDate, selectedSquads, selectedPessoas, selectedProjetos, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchSquads = async () => {
      const response = await fetch('/api/v1/pessoas/squads');
      const data = await response.json();
      setSquadOptions(data.map((s: string) => ({ value: s, label: s })));
    };
    fetchSquads();
  }, []);

  useEffect(() => {
    const fetchPessoas = async () => {
      if (selectedSquads.length > 0) {
        const params = new URLSearchParams();
        selectedSquads.forEach(s => params.append('squads', s.value));
        const response = await fetch(`/api/v1/pessoas?${params.toString()}`);
        const data = await response.json();
        setPessoaOptions(data.map((p: Pessoa) => ({ value: p.id, label: p.nome })));
      } else {
        setPessoaOptions([]);
        if (selectedPessoas.length > 0) {
          setSelectedPessoas([]);
        }
      }
    };
    fetchPessoas();
  }, [selectedSquads, selectedPessoas.length]);

  useEffect(() => {
    const fetchProjetos = async () => {
      if (selectedSquads.length > 0 || selectedPessoas.length > 0) {
        const params = new URLSearchParams();
        selectedSquads.forEach(s => params.append('squads', s.value));
        selectedPessoas.forEach(p => params.append('pessoas', p.value));
        const response = await fetch(`/api/v1/projetos?${params.toString()}`);
        const data = await response.json();
        setProjetoOptions(data.map((p: Projeto) => ({ value: p.projetoId, label: p.nome })));
      } else {
        setProjetoOptions([]);
        if (selectedProjetos.length > 0) {
          setSelectedProjetos([]);
        }
      }
    };
    fetchProjetos();
  }, [selectedSquads, selectedPessoas, selectedProjetos.length]);


  useEffect(() => {
    const fetchProjetosModais = async () => {
      try {
        const response = await fetch(`/api/v1/projetos/buscar-todos`);
        const data = await response.json();
        setProjetosModais(data);
      } catch (error) {
        console.error("Erro ao carregar projetos para os modais:", error);
      }
    };

    fetchProjetosModais();
  }, []);

  useEffect(() => {
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
  }, []);


  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentMonday = addDays(weekStartDate, 1);
    const newMonday = addDays(currentMonday, direction === 'next' ? 7 : -7);

    const params = new URLSearchParams(searchParams);
    params.set('date', formatDate(newMonday));
    router.push(`/allocation?${params.toString()}`);
  };

  const navigateToCurrentWeek = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('date');
    router.push(`/allocation?${params.toString()}`);
  };

  const calcularTempoDia = (pessoaId: string, data: string) => {
    return atividades
      .filter(a => a.pessoaId === pessoaId && a.data === data)
      .reduce((acc, a) => acc + a.tempo, 0);
  };

  const calcularTempoDiaExecutado = (pessoaId: string, data: string) => {
    return atividades
      .filter(a => a.pessoaId === pessoaId && a.data === data)
      .reduce((acc, a) => acc + (a.tmp_executado || 0), 0);
  };

  const handleAdicionarAtividade = async (dados: DadosAtividade) => {
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
    }
  };
  const handleEditarAtividade = async (atividadeId: string, dados: Partial<DadosAtividade>) => {
    try {
      const response = await fetch(`/api/v1/atividades/atualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: atividadeId, ...dados }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Ops, um ERRO aqui...",
          description: errorData.message || 'Falha ao editar atividade.',
          variant: "destructive",
        });
        return;
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
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao editar a atividade.",
        variant: "destructive",
      });
    }
  };
  const handleDeletarAtividade = async (atividadeId: string) => {
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
    }
  };
  const handleClonarAtividade = async (atividadeId: string) => {
    try {
      const response = await fetch(`/api/v1/atividades/clone`, {
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
    }
  };
  const handleMoveAtividade = async (atividadeId: string, novaData: string, novaOrderedActivityIds: string[]
  ) => {
    const originalAtividades = [...atividades];
    let dadosParaApi: { pessoaId?: string; dataOriginal?: string } = {};

    setAtividades(prevAtividades => {
      const activeAtividade = prevAtividades.find(a => a.id === atividadeId);
      if (!activeAtividade) return prevAtividades;

      const pessoaAlvoId = activeAtividade.pessoaId;
      const dataOriginal = activeAtividade.data;
      dadosParaApi = { pessoaId: pessoaAlvoId, dataOriginal };

      // Isolamento de atividades não movidas (referências originais)
      const untouchedActivities = prevAtividades.filter(
        a => a.pessoaId !== pessoaAlvoId
      );

      // Filtrar apenas atividades da pessoa-alvo (útil para visão ADM)
      const targetPersonActivities = prevAtividades.filter(
        a => a.pessoaId === pessoaAlvoId
      );

      // Atividades da pessoa-alvo que NÃO SÃO da origem NEM do destino
      const otherDaysForTarget = targetPersonActivities.filter(
        a => a.data !== dataOriginal && a.data !== novaData
      );

      // Atividades da coluna origem sem a atividade movida
      const originActivitiesForTarget = targetPersonActivities.filter(
        a => a.data === dataOriginal && a.id !== atividadeId
      );

      const movedActivity = {
        ...activeAtividade,
        data: novaData
      };

      // Atividades da coluna destino da pessoa-alvo
      const destinationActivitiesForTarget = targetPersonActivities.filter(
        a => a.data === novaData
      );

      // Combinação de atividades da pessoa-alvo
      const allDestinationActivities = [...destinationActivitiesForTarget, movedActivity];

      // Reordena as referências com base na nova ordem
      const orderedDestinationActivities: AtividadeCompleta[] = [];
      for (const id of novaOrderedActivityIds) {
        const activity = allDestinationActivities.find(a => a.id === id);
        if (activity) {
          orderedDestinationActivities.push(activity);
        }
      }

      return [
        ...untouchedActivities,
        ...otherDaysForTarget,
        ...originActivitiesForTarget,
        ...orderedDestinationActivities
      ];
    });

    try {
      const response = await fetch(`/api/v1/atividades/move-and-reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atividadeId,
          pessoaId: dadosParaApi.pessoaId,
          novaData,
          novaOrderedActivityIds
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao mover atividade.');
      }

    } catch (error) {
      console.error(error);
      setAtividades(originalAtividades); // Rollback
    }
  };

  const handleReorderActivitiesInDay = async (activeId: string, overId: string, dayData: string) => {
    let newActivitiesInDay: AtividadeCompleta[] = [];

    setAtividades((prevAtividades) => {
      const activitiesInDay = prevAtividades.filter(a => a.data === dayData);
      const otherActivities = prevAtividades.filter(a => a.data !== dayData);

      const oldIndex = activitiesInDay.findIndex(a => a.id === activeId);
      const newIndex = activitiesInDay.findIndex(a => a.id === overId);

      newActivitiesInDay = arrayMove(activitiesInDay, oldIndex, newIndex);

      return [...otherActivities, ...newActivitiesInDay];
    });

    if (newActivitiesInDay.length > 0) {
      const response = await fetch('/api/v1/atividades/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pessoaId: newActivitiesInDay[0].pessoaId, data: dayData, orderedActivityIds: newActivitiesInDay.map(a => a.id) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao reordenar atividades.');
      }
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
          semana: getWeekString(weekStartDate), // Usa a nova função
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
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="sticky top-0 z-10 bg-slate-900">
        <AllocationHeader userRole={userRole} />

        <AllocationControls
          weekStart={weekStartDate}
          onPreviousWeek={() => navigateWeek('prev')}
          onNextWeek={() => navigateWeek('next')}
          onCurrentWeek={navigateToCurrentWeek}
          squadOptions={squadOptions}
          pessoaOptions={pessoaOptions}
          projetoOptions={projetoOptions}
          selectedSquads={selectedSquads}
          selectedPessoas={selectedPessoas}
          selectedProjetos={selectedProjetos}
          onFiltroSquadChange={setSelectedSquads}
          onFiltroPessoasChange={setSelectedPessoas}
          onFiltroProjetosChange={setSelectedProjetos}
          userRole={userRole}
        />
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {loading ? (
          <div className="text-center text-white">Carregando...</div>
        ) : showUseFiltersMessage ? (
          <div className="text-center text-white">Utilize os filtros para visualizar os dados.</div>
        ) : (
          pessoas
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((pessoa: Pessoa) => (
              <PersonCard
                key={pessoa.id}
                person={pessoa}
                weekStart={weekStartDate}
                atividades={atividades}
                onAddAllocation={handleAddAllocation}
                onEditAllocation={handleEditAllocation}
                onCloneAllocation={handleClonarAtividade}
                onMoveAtividade={handleMoveAtividade}
                onUpdateStatus={handleUpdateStatus}
                onOpenResumoModal={handleOpenResumoModal}
                calcularTempoDia={calcularTempoDia}
                calcularTempoDiaExecutado={calcularTempoDiaExecutado}
                resumoDaSemana={resumos.find(r => r.pessoaId === pessoa.id)}
                userRole={userRole}
                onReorderActivitiesInDay={handleReorderActivitiesInDay}
              />
            ))
        )}
      </div>

      {/* <AllocationLegend /> */}

      <ModalAdicionarAtividade
        isOpen={modalAdicionarAtividade}
        onClose={() => {
          setModalAdicionarAtividade(false);
          setPessoaSelecionada(null);
        }}
        onSubmit={handleAdicionarAtividade}
        pessoas={colaboradoresOptions}
        projetos={projetosModais}
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
        projetos={projetosModais}
        loading={loading}
        userRole={userRole}
      />

      <ModalResumoSemanal
        isOpen={isResumoModalOpen}
        onClose={() => setIsResumoModalOpen(false)}
        onSubmit={handleSalvarResumo}
        pessoa={pessoaParaResumo}
        resumo={resumos.find(r => r.pessoaId === pessoaParaResumo?.id)}
        loading={loading}
      />
    </div>
  );
};

export default AllocationClientView;

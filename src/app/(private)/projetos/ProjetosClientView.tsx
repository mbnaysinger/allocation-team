'use client';

import { useState, useEffect, useCallback } from "react";
import { Projeto, Entidade } from "@/backend/core/models/projeto/Projeto";
import { Epico } from "@/backend/core/models/projeto/Epico";
import { Tarefa } from "@/backend/core/models/projeto/Tarefa";
import { useSession, signOut } from "next-auth/react";
import Sidebar from "@/components/ui/Sidebar";
import { LogOut } from "lucide-react";

interface ProjectWithChildren extends Projeto {
  epics: EpicWithChildren[];
}

interface EpicWithChildren extends Epico {
  tarefas: Tarefa[];
}
import { ProjectCreateModal } from "@/components/project/ProjectCreateModal";
import { ProjectEditModal } from "@/components/project/ProjectEditModal";
import { EpicCreateModal } from "@/components/project/EpicCreateModal";
import { EpicEditModal } from "@/components/project/EpicEditModal";
import { TaskCreateModal } from "@/components/project/TaskCreateModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  Target, 
  Plus,
  Edit,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { TaskEditModal } from "@/components/project/TaskEditModal";
import ProjectControls from "@/components/features/project/ProjectControls";
import { ProjectListDisplay } from "@/components/features/project/ProjectListDisplay";

interface SelectOption {
  value: string;
  label: string;
}

const ProjetosClientView = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [projects, setProjects] = useState<ProjectWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  const [selectedItem, setSelectedItem] = useState<{ type: 'project' | 'epic' | 'task'; id: string } | null>(null);
  
  // Filter states
  const [selectedSearch, setSelectedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([]);

  const statusOptions: SelectOption[] = [
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  // Modal states
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [epicModalOpen, setEpicModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<ProjectWithChildren | EpicWithChildren | Tarefa | null>(null);
  const [contextIds, setContextIds] = useState<{ projetoId?: string; epicId?: string }>({});

  const { toast } = useToast();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Buscar dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedSearch) params.append('nome', selectedSearch);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedEntity !== 'all') params.append('entidade', selectedEntity);

      const [projectsRes, epicsRes, tasksRes] = await Promise.all([
        fetch(`/api/v1/projetos?${params.toString()}`),
        fetch('/api/v1/epicos'),
        fetch('/api/v1/tarefas')
      ]);

      if (!projectsRes.ok || !epicsRes.ok || !tasksRes.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const [projectsData, epicsData, tasksData] = await Promise.all([
        projectsRes.json(),
        epicsRes.json(),
        tasksRes.json()
      ]);

      // Extract unique entities for filter options
      const uniqueEntities: Entidade[] = Array.from(new Set(projectsData.map((p: Projeto) => p.entidade).filter(Boolean)));
      setEntityOptions(uniqueEntities.map((entity: Entidade) => ({ value: entity, label: entity })));

      // Estruturar projetos com seus épicos e tarefas
      const projectsWithChildren: ProjectWithChildren[] = projectsData.map((project: Projeto) => ({
        ...project,
        epics: epicsData
          .filter((epic: Epico) => epic.projetoId === project.projetoId)
          .map((epic: Epico) => ({
            ...epic,
            tarefas: tasksData.filter((task: Tarefa) => task.epicoId === epic.epicoId)
          }))
      }));

      setProjects(projectsWithChildren);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [selectedSearch, selectedStatus, selectedEntity]);

  // Operações CRUD com atualização otimista
  const createProject = async (data: Partial<Projeto>) => {
    const response = await fetch('/api/v1/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar projeto');
    
    const newProject = await response.json();
    // Atualização otimista: adicionar projeto localmente
    setProjects(prev => [...prev, { ...newProject, epics: [] }]);
  };

  const updateProject = async (id: string, data: Partial<Projeto>) => {
    // Marcar como atualizando
    setUpdatingItems(prev => new Set(prev).add(id));
    
    // Atualização otimista: atualizar localmente primeiro
    setProjects(prev => prev.map(project => 
      project.projetoId === id 
        ? { ...project, ...data }
        : project
    ));

    try {
      const response = await fetch(`/api/v1/projetos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar projeto');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      await fetchData();
      throw error;
    } finally {
      // Remover indicador de carregamento
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteProject = async (id: string) => {
    // Atualização otimista: remover localmente primeiro
    setProjects(prev => prev.filter(project => project.projetoId !== id));

    try {
      const response = await fetch(`/api/v1/projetos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar projeto');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      await fetchData();
      throw error;
    }
  };

  const createEpic = async (projectId: string, data: Partial<Epico>) => {
    const response = await fetch('/api/v1/epicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, projetoId: projectId })
    });
    if (!response.ok) throw new Error('Erro ao criar épico');
    
    const newEpic = await response.json();
    // Atualização otimista: adicionar épico localmente
    setProjects(prev => prev.map(project => 
      project.projetoId === projectId
        ? { ...project, epics: [...(project.epics || []), { ...newEpic, tarefas: [] }] }
        : project
    ));
  };

  const updateEpic = async (id: string, data: Partial<Epico>) => {
    // Atualização otimista: atualizar localmente primeiro
    setProjects(prev => prev.map(project => ({
      ...project,
      epics: project.epics?.map(epic => 
        epic.epicoId === id 
          ? { ...epic, ...data }
          : epic
      ) || []
    })));

    try {
      const response = await fetch(`/api/v1/epicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar épico');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      await fetchData();
      throw error;
    }
  };

  const deleteEpic = async (id: string) => {
    // Atualização otimista: remover localmente primeiro
    setProjects(prev => prev.map(project => ({
      ...project,
      epics: project.epics?.filter(epic => epic.epicoId !== id) || []
    })));

    try {
      const response = await fetch(`/api/v1/epicos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar épico');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      await fetchData();
      throw error;
    }
  };

  const createTask = async (epicId: string, data: Partial<Tarefa>) => {
    const response = await fetch('/api/v1/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, epicoId: epicId })
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');
    
    const newTask = await response.json();
    // Atualização otimista: adicionar tarefa localmente
    setProjects(prev => prev.map(project => ({
      ...project,
      epics: project.epics?.map(epic => 
        epic.epicoId === epicId
          ? { ...epic, tarefas: [...(epic.tarefas || []), newTask] }
          : epic
      ) || []
    })));
  };

  const updateTask = async (id: string, data: Partial<Tarefa>) => {
    // Atualização otimista: atualizar localmente primeiro
    setProjects(prev => prev.map(project => ({
      ...project,
      epics: project.epics?.map(epic => ({
        ...epic,
        tarefas: epic.tarefas?.map(task => 
          task.tarefaId === id 
            ? { ...task, ...data }
            : task
        ) || []
      })) || []
    })));

    try {
      const response = await fetch(`/api/v1/tarefas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar tarefa');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      await fetchData();
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    // Atualização otimista: remover localmente primeiro
    setProjects(prev => prev.map(project => ({
      ...project,
      epics: project.epics?.map(epic => ({
        ...epic,
        tarefas: epic.tarefas?.filter(task => task.tarefaId !== id) || []
      })) || []
    })));

    try {
      const response = await fetch(`/api/v1/tarefas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar tarefa');
    } catch (error) {
      // Em caso de erro, recarregar dados para reverter
      throw error;
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchData();
  }, [fetchData, selectedSearch, selectedStatus, selectedEntity]);

  // Helper functions
  const findProject = (id: string) => projects.find(p => p.projetoId === id);
  const findEpic = (id: string) => {
    for (const project of projects) {
      const epic = project.epics?.find(e => e.epicoId === id);
      if (epic) return { epic, project };
    }
    return null;
  };
  // const findTask = (id: string) => {
  //   for (const project of projects) {
  //     for (const epic of project.epics || []) {
  //       const task = epic.tarefas?.find(t => t.tarefaId === id);
  //       if (task) return { task, epic, project };
  //     }
  //   }
  //   return null;
  // };

  // Event handlers
  const handleSelectItem = (type: 'project' | 'epic' | 'task', id: string) => {
    setSelectedItem({ type, id });
  };

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingItem(null);
    setProjectModalOpen(true);
  };

  const handleCreateEpic = (projetoId: string) => {
    setModalMode('create');
    setEditingItem(null);
    setContextIds({ projetoId });
    setEpicModalOpen(true);
  };

  const handleCreateTask = (epicId: string) => {
    setModalMode('create');
    setEditingItem(null);
    setContextIds({ epicId });
    setTaskModalOpen(true);
  };

  const handleEditItem = (type: 'project' | 'epic' | 'task', item: ProjectWithChildren | EpicWithChildren | Tarefa) => {
    setModalMode('edit');
    setEditingItem(item);
    
    if (type === 'project') {
      setProjectModalOpen(true);
    } else if (type === 'epic') {
      setEpicModalOpen(true);
    } else {
      setTaskModalOpen(true);
    }
  };

  const handleDeleteItem = async (type: 'project' | 'epic' | 'task', id: string) => {
    try {
      if (type === 'project') {
        await deleteProject(id);
      } else if (type === 'epic') {
        await deleteEpic(id);
      } else {
        await deleteTask(id);
      }
      
      toast({
        title: "Item excluído",
        description: `${type} foi removido com sucesso.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o item.",
        variant: "destructive",
      });
    }
  };

  // Form submission handlers
  const handleProjectSubmit = async (data: Partial<Projeto>) => {
    try {
      if (modalMode === 'create') {
        await createProject(data);
        toast({
          title: "Projeto criado",
          description: `${data.nome} foi criado com sucesso.`,
        });
      } else if (editingItem && 'projetoId' in editingItem) {
        await updateProject(editingItem.projetoId, data);
        toast({
          title: "Projeto atualizado", 
          description: `${data.nome} foi atualizado com sucesso.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleEpicSubmit = async (data: Partial<Epico>, projectId?: string) => {
    try {
      if (modalMode === 'create' && projectId) {
        await createEpic(projectId, data);
        toast({
          title: "Épico criado",
          description: `${data.nome} foi criado com sucesso.`,
        });
      } else if (editingItem && 'epicoId' in editingItem) {
        await updateEpic(editingItem.epicoId, data as Partial<Epico>);
        toast({
          title: "Épico atualizado",
          description: `${data.nome} foi atualizado com sucesso.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o épico.",
        variant: "destructive",
      });
    }
  };

  const handleTaskSubmit = async (data: Partial<Tarefa>) => {
    try {
      if (modalMode === 'create' && contextIds.epicId) {
        await createTask(contextIds.epicId, data);
        toast({
          title: "Tarefa criada",
          description: `${data.nome} foi criada com sucesso.`,
        });
      } else if (editingItem && 'tarefaId' in editingItem) {
        await updateTask(editingItem.tarefaId, data as Partial<Tarefa>);
        toast({
          title: "Tarefa atualizada",
          description: `${data.nome} foi atualizada com sucesso.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive",
      });
    }
  };

  // Render selected item content
  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Selecione um projeto para ver os detalhes</p>
          </div>
        </div>
      );
    }

    const { type, id } = selectedItem;

    if (type === 'project') {
      const project = findProject(id);
      if (!project) return null;

      const completedEpics = project.epics?.filter(e => e.status === 'concluido').length || 0;
      const totalEpics = project.epics?.length || 0;
      const progressPercentage = totalEpics > 0 ? (completedEpics / totalEpics) * 100 : 0;

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{project.nome}</h1>
              <p className="text-slate-400 mt-1">{project.descricao}</p>
            </div>
            <Button onClick={() => handleEditItem('project', project)} className="bg-slate-700 hover:bg-slate-600">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Progresso Geral</CardTitle>
                <Target className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                <Progress value={progressPercentage} className="mt-2" />
                <p className="text-xs text-slate-400 mt-2">
                  {completedEpics} de {totalEpics} épicos concluídos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Responsável</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{project.responsavelId}</div>
                <p className="text-xs text-slate-400 mt-2">
                  {project.entidade || 'Sem entidade'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">
                  {project.status === 'em_andamento' ? 'Em Andamento' :
                   project.status === 'backlog' ? 'Backlog' :
                   project.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                </Badge>
                {project.dataFimPrevisto && (
                  <p className="text-xs text-slate-400 mt-2">
                    Término: {format(project.dataFimPrevisto, "PPP", { locale: ptBR })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Épicos ({totalEpics})</CardTitle>
                <Button size="sm" onClick={() => handleCreateEpic(project.projetoId)} className="bg-slate-700 hover:bg-slate-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Épico
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {totalEpics > 0 ? (
                <div className="space-y-4">
                  {project.epics?.map((epic) => (
                    <div key={epic.epicoId} className="p-4 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                         onClick={() => handleSelectItem('epic', epic.epicoId)}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-100">{epic.nome}</h4>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {epic.status === 'planejado' ? 'Planejado' :
                           epic.status === 'em_andamento' ? 'Em Andamento' :
                           epic.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{epic.descricao}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{epic.tarefas?.length || 0} tarefas</span>
                        <span>{epic.tarefas?.filter(t => t.status === 'concluida').length || 0} concluídas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <p>Nenhum épico criado ainda.</p>
                  <Button variant="outline" size="sm" className="mt-2 border-slate-700 hover:bg-slate-700" onClick={() => handleCreateEpic(project.projetoId)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro épico
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Similar implementations for epic and task views would go here
    // For brevity, showing just the project view
    
    return <div>Content for {type} #{id}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center text-slate-400">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-400 mx-auto"></div>
          <p className="mt-4">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center text-red-400">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg">Erro ao carregar projetos</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="sticky top-0 z-10 bg-slate-900">
        {/* Sidebar com menu hambúrguer */}
        <Sidebar userRole={userRole} />

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-200 group"
          title="Sair"
        >
          <LogOut size={20} className="text-gray-300 group-hover:text-white transition-colors" />
        </button>
        
        {/* Conteúdo à esquerda */}
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white pt-4 pl-20">
            Projetos
            <span className="text-cyan-400 text-xl text-center pl-6">Soluções Corporativas e de Negócios</span>
          </h2>
        </div>

        <ProjectControls
          onSearchChange={setSelectedSearch}
          onStatusChange={setSelectedStatus}
          onEntityChange={setSelectedEntity}
          onNewProject={handleCreateProject}
          statusOptions={statusOptions}
          entityOptions={entityOptions}
          selectedSearch={selectedSearch}
          selectedStatus={selectedStatus}
          selectedEntity={selectedEntity}
        />
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 flex">
        <div className="w-1/3 pr-4">
          <ProjectListDisplay
            projects={projects}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onCreateEpic={handleCreateEpic}
            onCreateTask={handleCreateTask}
            onEditItem={handleEditItem as (type: 'project' | 'epic' | 'task', item: Projeto | Epico | Tarefa) => void}
            onDeleteItem={handleDeleteItem}
            updatingItems={updatingItems}
            onCreateProject={handleCreateProject}
          />
        </div>
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <ProjectCreateModal
        isOpen={projectModalOpen && modalMode === 'create'}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
      />

      <ProjectEditModal
        isOpen={projectModalOpen && modalMode === 'edit'}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        project={editingItem as Partial<Projeto>}
      />

      <EpicCreateModal
        isOpen={epicModalOpen && modalMode === 'create'}
        onClose={() => setEpicModalOpen(false)}
        onSubmit={(data) => handleEpicSubmit(data as Partial<Epico>, contextIds.projetoId)}
        projetoTitulo={contextIds.projetoId ? findProject(contextIds.projetoId)?.nome : undefined}
        projetoId={contextIds.projetoId || ''}
      />

      <EpicEditModal
        isOpen={epicModalOpen && modalMode === 'edit'}
        onClose={() => setEpicModalOpen(false)}
        onSubmit={(data) => handleEpicSubmit(data as Partial<Epico>, contextIds.projetoId)}
        epic={editingItem as Partial<Epico>}
        projectTitle={contextIds.projetoId ? findProject(contextIds.projetoId)?.nome : undefined}
      />

      <TaskCreateModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        epicTitle={contextIds.epicId ? findEpic(contextIds.epicId)?.epic.nome : undefined}
        epicId={contextIds.epicId || ''}
      />

      <TaskEditModal
        isOpen={taskModalOpen && modalMode === 'edit'}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingItem as Partial<Tarefa>}
        epicTitle={contextIds.epicId ? findEpic(contextIds.epicId)?.epic.nome : undefined}
      />
    </div>
  );
};

export default ProjetosClientView;
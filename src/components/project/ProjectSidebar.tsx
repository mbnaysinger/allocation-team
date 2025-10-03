import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder,
  Layers,
  CheckSquare,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Projeto } from "@/backend/core/models/projeto/Projeto";
import { Epico } from "@/backend/core/models/projeto/Epico";
import { Tarefa } from "@/backend/core/models/projeto/Tarefa";

interface ProjectWithChildren extends Projeto {
  epics: EpicWithChildren[];
}

interface EpicWithChildren extends Epico {
  tarefas: Tarefa[];
}

interface ProjectSidebarProps {
  projects: ProjectWithChildren[];
  selectedItem: { type: 'project' | 'epic' | 'task'; id: string } | null;
  onSelectItem: (type: 'project' | 'epic' | 'task', id: string) => void;
  onCreateProject: () => void;
  onCreateEpic: (projectId: string) => void;
  onCreateTask: (epicId: string) => void;
  onEditItem: (type: 'project' | 'epic' | 'task', item: Projeto | Epico | Tarefa) => void;
  onDeleteItem: (type: 'project' | 'epic' | 'task', id: string) => void;
  updatingItems?: Set<string>;
}

export function ProjectSidebar({
  projects,
  selectedItem,
  onSelectItem,
  onCreateProject,
  onCreateEpic,
  onCreateTask,
  onEditItem,
  onDeleteItem,
  updatingItems = new Set()
}: ProjectSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const getStatusColor = (type: string, status: string) => {
    const statusColors = {
      project: {
        'em_andamento': "bg-green-500",
        'backlog': "bg-yellow-500",
        'concluido': "bg-gray-500",
        'cancelado': "bg-red-500"
      },
      epic: {
        'planejado': "bg-yellow-500",
        'em_andamento': "bg-blue-500",
        'concluido': "bg-green-500",
        'cancelado': "bg-red-500"
      },
      task: {
        'nao_iniciada': "bg-gray-500",
        'em_andamento': "bg-blue-500",
        'concluida': "bg-green-500",
        'cancelada': "bg-red-500"
      }
    };
    
    return statusColors[type as keyof typeof statusColors]?.[status as keyof (typeof statusColors)[keyof typeof statusColors]] || "bg-gray-500";
  };

  const ItemActions = ({ 
    type, 
    item, 
    onAdd, 
    canAdd 
  }: { 
    type: 'project' | 'epic' | 'task'; 
    item: Projeto | Epico | Tarefa; 
    onAdd?: () => void; 
    canAdd?: boolean; 
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem onClick={() => onEditItem(type, item)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {canAdd && onAdd && (
          <DropdownMenuItem onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar {type === 'project' ? 'Épico' : 'Tarefa'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => {
            const id = 'projetoId' in item ? item.projetoId : 
                      'epicoId' in item ? item.epicoId : 
                      (item as Tarefa).tarefaId;
            onDeleteItem(type, id);
          }}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="h-full border-r bg-slate-900/80 backdrop-blur-sm text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">Projetos</h2>
          <Button size="sm" onClick={onCreateProject} variant="outline" className="border-slate-700 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="p-2 space-y-1 overflow-y-auto">
        {projects.map((project) => {
          const isProjectExpanded = expandedProjects.has(project.projetoId);
          const isProjectSelected = selectedItem?.type === 'project' && selectedItem.id === project.projetoId;
          const isProjectUpdating = updatingItems.has(project.projetoId);

          return (
            <div key={project.projetoId} className="space-y-1">
              {/* Project */}
              <div
                className={cn(
                  "group flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-800 transition-colors",
                  isProjectSelected && "bg-slate-700"
                )}
                onClick={() => {
                  onSelectItem('project', project.projetoId);
                  if (!isProjectExpanded) {
                    toggleProject(project.projetoId);
                  }
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-slate-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProject(project.projetoId);
                  }}
                >
                  {project.epics && project.epics.length > 0 && (
                    isProjectExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )
                  )}
                </Button>
                
                {isProjectExpanded ? (
                  <FolderOpen className="h-4 w-4 text-sky-400" />
                ) : (
                  <Folder className="h-4 w-4 text-sky-400" />
                )}
                
                <span className="flex-1 truncate text-sm font-medium text-slate-100">
                  {project.nome}
                </span>
                
                {isProjectUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                ) : (
                  <div className={cn("h-2 w-2 rounded-full", getStatusColor('project', project.status))} />
                )}
                
                <ItemActions 
                  type="project" 
                  item={project}
                  onAdd={() => onCreateEpic(project.projetoId)}
                  canAdd
                />
              </div>

              {/* Epics */}
              {isProjectExpanded && project.epics && project.epics.map((epic) => {
                const isEpicExpanded = expandedEpics.has(epic.epicoId);
                const isEpicSelected = selectedItem?.type === 'epic' && selectedItem.id === epic.epicoId;
                const isEpicUpdating = updatingItems.has(epic.epicoId);

                return (
                  <div key={epic.epicoId} className="ml-4 space-y-1">
                    <div
                      className={cn(
                        "group flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-800 transition-colors",
                        isEpicSelected && "bg-slate-700"
                      )}
                      onClick={() => {
                        onSelectItem('epic', epic.epicoId);
                        if (!isEpicExpanded) {
                          toggleEpic(epic.epicoId);
                        }
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEpic(epic.epicoId);
                        }}
                      >
                        {epic.tarefas && epic.tarefas.length > 0 && (
                          isEpicExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )
                        )}
                      </Button>
                      
                      <Layers className="h-4 w-4 text-teal-400" />
                      
                      <span className="flex-1 truncate text-sm text-slate-300">
                        {epic.nome}
                      </span>
                      
                      {isEpicUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                      ) : (
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor('epic', epic.status))} />
                      )}
                      
                      <ItemActions 
                        type="epic" 
                        item={epic}
                        onAdd={() => onCreateTask(epic.epicoId)}
                        canAdd
                      />
                    </div>

                    {/* Tasks */}
                    {isEpicExpanded && epic.tarefas && epic.tarefas.map((task) => {
                      const isTaskSelected = selectedItem?.type === 'task' && selectedItem.id === task.tarefaId;
                      const isTaskUpdating = updatingItems.has(task.tarefaId);

                      return (
                        <div
                          key={task.tarefaId}
                          className={cn(
                            "group ml-4 flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-800 transition-colors",
                            isTaskSelected && "bg-slate-700"
                          )}
                          onClick={() => onSelectItem('task', task.tarefaId)}
                        >
                          <div className="w-4" />
                          <CheckSquare className="h-4 w-4 text-slate-400" />
                          
                          <span className="flex-1 truncate text-sm text-slate-400">
                            {task.nome}
                          </span>
                          
                          {isTaskUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                          ) : (
                            <div className={cn("h-2 w-2 rounded-full", getStatusColor('task', task.status))} />
                          )}
                          
                          <ItemActions 
                            type="task" 
                            item={task}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhum projeto criado</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={onCreateProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro projeto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

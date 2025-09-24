import React from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import SearchableSelect, { SelectOption } from "@/components/ui/SearchableSelect";
import { Pessoa, Projeto } from "@/backend/core/models";
import { formatDateForDisplay } from "@/app/utils/date";
import { UserRole } from "@/backend/core/models/UserRole";

interface AllocationControlsProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddPerson: () => void;
  onAddProject: () => void;
  onManageProjects: () => void;
  pessoas: Pessoa[];
  projetos: Projeto[];
  onFiltroPessoasChange: (pessoas: Pessoa[]) => void;
  onFiltroProjetosChange: (projetos: Projeto[]) => void;
  onOpenLogs?: () => void;
  userRole?: UserRole;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onAddPerson,
  onAddProject,
  onManageProjects,
  pessoas,
  projetos,
  onFiltroPessoasChange,
  onFiltroProjetosChange,
  userRole,
}) => {
  const dateRange = `${formatDateForDisplay(weekStart)} - ${formatDateForDisplay(weekEnd)}`;

  const pessoaOptions: SelectOption[] = pessoas.map(p => ({ value: p.id, label: p.nome }));
  const projetoOptions: SelectOption[] = projetos.map(p => ({ value: p.id, label: p.nome }));

  const handleFiltroPessoaChange = (selectedOptions: readonly SelectOption[]) => {
    const selectedIds = selectedOptions.map(option => option.value);
    const pessoasFiltradas = pessoas.filter(p => selectedIds.includes(p.id));
    onFiltroPessoasChange(pessoasFiltradas);
  };

  const handleFiltroProjetoChange = (selectedOptions: readonly SelectOption[]) => {
    const selectedIds = selectedOptions.map(option => option.value);
    const projetosFiltrados = projetos.filter(p => selectedIds.includes(p.id));
    onFiltroProjetosChange(projetosFiltrados);
  };

  return (
    <div className="bg-bg/50 border-b border-accent/20 p-4 md:p-6">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {/* Controles de Navegação da Semana */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button onClick={onPreviousWeek} variant="outline" size="sm" className="flex items-center gap-2">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Semana Anterior</span>
            </Button>
            <span className="font-semibold text-text-black text-sm md:text-base text-center">
              {dateRange}
            </span>
            <Button onClick={onNextWeek} variant="outline" size="sm" className="flex items-center gap-2">
              <span className="hidden sm:inline">Próxima Semana</span>
              <ChevronRight size={16} />
            </Button>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="w-full lg:w-60">
              <SearchableSelect
                instanceId="filtro-pessoas-select"
                isMulti
                options={pessoaOptions}
                onChange={handleFiltroPessoaChange}
                placeholder="Filtrar por pessoa..."
              />
            </div>
            <div className="w-full lg:w-60">
              <SearchableSelect
                instanceId="filtro-projetos-select"
                isMulti
                options={projetoOptions}
                onChange={handleFiltroProjetoChange}
                placeholder="Filtrar por projeto..."
              />
            </div>
          </div>
        </div>
        
        {/* Botões de Adicionar */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={onAddPerson} variant="default" size="sm" className="flex items-center gap-2">
            <Plus size={16} />
            Adicionar Pessoa
          </Button>
          {userRole === UserRole.ADMIN && (
            <>
              <Button onClick={onAddProject} variant="outline" size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                Adicionar Projeto
              </Button>
              <Button onClick={onManageProjects} variant="outline" size="sm" className="flex items-center gap-2">
                Gerenciar Projetos
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;

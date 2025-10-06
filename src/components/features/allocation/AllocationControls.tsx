import React from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import SearchableSelect, { SelectOption } from "@/components/ui/SearchableSelect";
import { Pessoa } from "@/backend/core/models";
import { Projeto } from "@/backend/core/models/projeto/Projeto";
import { formatDateForDisplay } from "@/app/utils/date";
import { addDays } from "date-fns";
import { UserRole } from "@/backend/core/models/UserRole";

interface AllocationControlsProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  pessoas: Pessoa[];
  projetos: Projeto[];
  onFiltroPessoasChange: (pessoas: Pessoa[]) => void;
  onFiltroProjetosChange: (projetos: Projeto[]) => void;
  onOpenLogs?: () => void;
  userRole?: UserRole;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  pessoas,
  projetos,
  onFiltroPessoasChange,
  onFiltroProjetosChange,
  userRole,
}) => {
  // weekStart é domingo, então segunda-feira é +1 e sexta-feira é +5
  const mondayDate = addDays(weekStart, 1);
  const fridayDate = addDays(weekStart, 5);
  const dateRange = `${formatDateForDisplay(mondayDate)} - ${formatDateForDisplay(fridayDate)}`;

  const pessoaOptions: SelectOption[] = pessoas.map(p => ({ value: p.id, label: p.nome }));
  const projetoOptions: SelectOption[] = projetos.map(p => ({ value: p.projetoId, label: p.nome }));

  const handleFiltroPessoaChange = (selectedOptions: readonly SelectOption[]) => {
    const selectedIds = selectedOptions.map(option => option.value);
    const pessoasFiltradas = pessoas.filter(p => selectedIds.includes(p.id));
    onFiltroPessoasChange(pessoasFiltradas);
  };

  const handleFiltroProjetoChange = (selectedOptions: readonly SelectOption[]) => {
    const selectedIds = selectedOptions.map(option => option.value);
    const projetosFiltrados = projetos.filter(p => selectedIds.includes(p.projetoId));
    onFiltroProjetosChange(projetosFiltrados);
  };

  return (
    <div className="border-b border-slate-700/50 p-4 md:p-6">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {/* Controles de Navegação da Semana */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              onClick={onPreviousWeek} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            
            <Button 
              onClick={onCurrentWeek} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 bg-slate-800 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white px-3"
            >
              <Calendar size={14} />
              <span className="text-xs">Atual</span>
            </Button>
            
            <span className="font-semibold text-white text-sm sm:text-base text-center min-w-[140px]">
              {dateRange}
            </span>
            
            <Button 
              onClick={onNextWeek} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight size={16} />
            </Button>
          </div>
          {/* Filtros */}

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="w-full lg:w-60 text-white">
            {userRole === UserRole.ADMIN && (
              <>
                <SearchableSelect
                  instanceId="filtro-pessoas-select"
                  isMulti
                  options={pessoaOptions}
                  onChange={handleFiltroPessoaChange}
                  placeholder="Filtrar por pessoa..."
                />
              </>
              )}
            </div>
            <div className="w-full lg:w-60">
              <SearchableSelect
                className="text-left"
                instanceId="filtro-projetos-select"
                isMulti
                options={projetoOptions}
                onChange={handleFiltroProjetoChange}
                placeholder="Filtrar por projeto..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;

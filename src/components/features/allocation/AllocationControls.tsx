import React from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import TruncatedMultiSelect from "@/components/ui/TruncatedMultiSelect";
import { SelectOption } from "@/components/ui/SearchableSelect";
import { formatDateForDisplay } from "@/app/utils/date";
import { addDays } from "date-fns";
import { UserRole } from "@/backend/core/models/UserRole";

interface AllocationControlsProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  squadOptions: SelectOption[];
  pessoaOptions: SelectOption[];
  projetoOptions: SelectOption[];
  selectedSquads: SelectOption[];
  selectedPessoas: SelectOption[];
  selectedProjetos: SelectOption[];
  onFiltroSquadChange: (selected: SelectOption[]) => void;
  onFiltroPessoasChange: (selected: SelectOption[]) => void;
  onFiltroProjetosChange: (selected: SelectOption[]) => void;
  userRole?: UserRole;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  squadOptions,
  pessoaOptions,
  projetoOptions,
  selectedSquads,
  selectedPessoas,
  selectedProjetos,
  onFiltroSquadChange,
  onFiltroPessoasChange,
  onFiltroProjetosChange,
  userRole,
}) => {
  const mondayDate = addDays(weekStart, 1);
  const fridayDate = addDays(weekStart, 5);
  const dateRange = `${formatDateForDisplay(mondayDate)} - ${formatDateForDisplay(fridayDate)}`;

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
            {userRole === UserRole.ADMIN && (
              <div className="w-full lg:w-65 text-white">
                <TruncatedMultiSelect
                  instanceId="filtro-squads-select"
                  options={squadOptions}
                  value={selectedSquads}
                  onChange={onFiltroSquadChange}
                  placeholder="Filtrar por squad..."
                  maxDisplayItems={1}
                />
              </div>
            )}
            <div className="w-full lg:w-65 text-white">
              {userRole === UserRole.ADMIN && (
                <TruncatedMultiSelect
                  instanceId="filtro-pessoas-select"
                  options={pessoaOptions}
                  value={selectedPessoas}
                  onChange={onFiltroPessoasChange}
                  placeholder="Filtrar por pessoa..."
                  maxDisplayItems={1}
                  isDisabled={selectedSquads.length === 0}
                />
              )}
            </div>
            <div className="w-full lg:w-65">
              {userRole === UserRole.ADMIN && (
              <TruncatedMultiSelect
                instanceId="filtro-projetos-select"
                options={projetoOptions}
                value={selectedProjetos}
                onChange={onFiltroProjetosChange}
                placeholder="Filtrar por projeto..."
                maxDisplayItems={1}
                isDisabled={selectedSquads.length === 0 && selectedPessoas.length === 0}
              />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationControls;

import React from "react";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Plus, Database } from "lucide-react";

interface AllocationControlsProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddPerson: () => void;
  onAddProject: () => void;
  onOpenLogs?: () => void;
  onOpenFirebaseDebugger?: () => void;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onAddPerson,
  onAddProject,
  onOpenFirebaseDebugger,
}) => {
  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="bg-bg/50 border-b border-accent/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              onClick={onPreviousWeek}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Semana Anterior</span>
            </Button>
            
            <span className="font-semibold text-text-black text-sm md:text-base text-center">
              {formatDateRange(weekStart, weekEnd)}
            </span>
            
            <Button
              onClick={onNextWeek}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline">Próxima Semana</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={onAddPerson}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar Pessoa
          </Button>
          <Button
            onClick={onAddProject}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar Projeto
          </Button>
          {process.env.NODE_ENV === 'development' && onOpenFirebaseDebugger && (
            <Button
              onClick={onOpenFirebaseDebugger}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Database size={16} />
              Firebase
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllocationControls; 
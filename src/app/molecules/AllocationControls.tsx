import React from "react";
import Button from "../atoms/Button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface AllocationControlsProps {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddPerson: () => void;
}

const AllocationControls: React.FC<AllocationControlsProps> = ({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onAddPerson,
}) => {
  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onPreviousWeek}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Semana Anterior
          </Button>
          
          <span className="font-semibold text-slate-700">
            {formatDateRange(weekStart, weekEnd)}
          </span>
          
          <Button
            onClick={onNextWeek}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Próxima Semana
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <Button
          onClick={onAddPerson}
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar Pessoa
        </Button>
      </div>
    </div>
  );
};

export default AllocationControls; 
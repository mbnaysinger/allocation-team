import React from "react";
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
    <div className="bg-bg/50 border-b border-accent/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 md:gap-4">
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AllocationControls; 
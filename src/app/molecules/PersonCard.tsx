import React from "react";
import { Plus } from "lucide-react";

interface Allocation {
  id: string;
  hours: number;
  project: string;
  type: "normal" | "partial" | "overtime";
}

interface Person {
  id: string;
  name: string;
  role: string;
  emoji: string;
  allocations: {
    [day: string]: Allocation[];
  };
}

interface PersonCardProps {
  person: Person;
  weekStart: Date;
  onAddAllocation: (day: string) => void;
  onEditAllocation: (allocationId: string) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  weekStart,
  onAddAllocation,
  onEditAllocation,
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  const getTotalHours = () => {
    return Object.values(person.allocations).reduce((total, dayAllocations) => {
      return total + dayAllocations.reduce((dayTotal, allocation) => dayTotal + allocation.hours, 0);
    }, 0);
  };

  const getDayDate = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'normal':
        return 'bg-gradient-to-r from-accent to-accent/80 text-bg';
      case 'partial':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-bg';
      case 'overtime':
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
      default:
        return 'bg-gradient-to-r from-accent to-accent/80 text-bg';
    }
  };

  return (
    <div className="bg-bg/30 backdrop-blur-sm rounded-xl border border-accent/20 overflow-hidden shadow-glass">
      {/* Header da pessoa */}
      <div className="bg-gradient-to-r from-bg/80 to-bg/60 text-text-light p-4 md:p-6 border-b border-accent/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-1 text-text-light">
              {person.emoji} {person.name}
            </h3>
            <div className="text-accent/80 text-sm">
              {person.role}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-accent">{getTotalHours()}h</div>
            <div className="text-accent/60 text-sm">Total Semana</div>
          </div>
        </div>
      </div>

      {/* Grade de alocação */}
      <div className="p-4 md:p-6">
        {/* Cabeçalho dos dias - responsivo */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-text-light text-xs md:text-sm">{dayName}</div>
              <div className="text-xs text-accent/60">{getDayDate(index)}</div>
            </div>
          ))}
        </div>

        {/* Grade de alocações - responsivo */}
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {days.map((day, index) => (
            <div key={day} className="min-h-[100px] md:min-h-[120px] border-2 border-dashed border-accent/30 rounded-lg p-2 md:p-4 bg-bg/20">
              {person.allocations[day]?.map((allocation) => (
                <div
                  key={allocation.id}
                  className={`${getTypeClasses(allocation.type)} p-2 md:p-3 rounded-lg mb-2 cursor-pointer hover:scale-105 transition-transform text-xs md:text-sm`}
                  onClick={() => onEditAllocation(allocation.id)}
                >
                  <div className="font-bold text-sm md:text-lg">{allocation.hours}h</div>
                  <div className="text-xs md:text-sm opacity-90 truncate">{allocation.project}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonCard; 
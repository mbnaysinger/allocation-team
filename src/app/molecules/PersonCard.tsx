import React from "react";
import { Plus } from "lucide-react";
import Button from "../atoms/Button";

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
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'partial':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'overtime':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header da pessoa */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold mb-1">
              {person.emoji} {person.name}
            </h3>
            <div className="text-slate-300 text-sm">
              {person.role}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getTotalHours()}h</div>
            <div className="text-slate-300 text-sm">Total Semana</div>
          </div>
        </div>
      </div>

      {/* Grade de alocação */}
      <div className="p-6">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-slate-700">{dayName}</div>
              <div className="text-sm text-slate-500">{getDayDate(index)}</div>
            </div>
          ))}
        </div>

        {/* Grade de alocações */}
        <div className="grid grid-cols-5 gap-4">
          {days.map((day, index) => (
            <div key={day} className="min-h-[120px] border-2 border-dashed border-slate-300 rounded-lg p-4">
              {person.allocations[day]?.map((allocation) => (
                <div
                  key={allocation.id}
                  className={`${getTypeClasses(allocation.type)} text-white p-3 rounded-lg mb-2 cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => onEditAllocation(allocation.id)}
                >
                  <div className="font-bold text-lg">{allocation.hours}h</div>
                  <div className="text-sm opacity-90">{allocation.project}</div>
                </div>
              ))}
              
              <Button
                onClick={() => onAddAllocation(day)}
                variant="outline"
                size="sm"
                className="w-full mt-2 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              >
                <Plus size={16} className="mr-1" />
                Adicionar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonCard; 
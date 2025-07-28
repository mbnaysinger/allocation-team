import React, { useState, useEffect } from "react";
import { Plus, Copy } from "lucide-react";
import Button from "../atoms/Button";
import TarjaHoras from "../atoms/TarjaHoras";
import DroppableDayColumn from "../atoms/DroppableDayColumn";
import DraggableActivityCard from "../atoms/DraggableActivityCard";
import { Pessoa, AtividadeCompleta } from "../../types/allocation";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

interface PersonCardProps {
  person: Pessoa;
  weekStart: Date;
  atividades: AtividadeCompleta[];
  onAddAllocation: (day: string) => void;
  onEditAllocation: (atividadeId: string) => void;
  onCloneAllocation: (atividadeId: string) => void;
  onMoveAtividade: (atividadeId: string, novaData: string) => Promise<void>;
  calcularHorasDia: (pessoaId: string, data: string) => Promise<number>;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  weekStart,
  atividades,
  onAddAllocation,
  onEditAllocation,
  onCloneAllocation,
  onMoveAtividade,
  calcularHorasDia,
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const [horasPorDia, setHorasPorDia] = useState<Record<string, number>>({});
  const [dragOverData, setDragOverData] = useState<string | null>(null);

  // Hook para drag and drop
  const { draggedItem, isDragging, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop({
    onMoveAtividade
  });

  // Calcular horas por dia
  useEffect(() => {
    const calcularHoras = async () => {
      const horas: Record<string, number> = {};
      for (let i = 0; i < 5; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dataStr = date.toISOString().split('T')[0];
        horas[dataStr] = await calcularHorasDia(person.id, dataStr);
      }
      setHorasPorDia(horas);
    };
    calcularHoras();
  }, [person.id, weekStart, calcularHorasDia]);

  const getTotalHours = () => {
    return atividades
      .filter(atividade => atividade.pessoaId === person.id)
      .reduce((total, atividade) => total + atividade.horas, 0);
  };

  const getDayDate = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  const getAtividadesDoDia = (data: string) => {
    return atividades.filter(atividade => 
      atividade.pessoaId === person.id && atividade.data === data
    );
  };

  // Handlers para drag and drop
  const handleDragOver = (data: string) => {
    setDragOverData(data);
  };

  const handleDragLeave = () => {
    setDragOverData(null);
  };

  return (
    <div className="bg-gray-100 backdrop-blur-sm rounded-xl border border-accent/20 overflow-hidden shadow-glass">
      {/* Header da pessoa */}
      <div className="bg-gradient-to-r from-bg/80 to-bg/60 text-text-light p-4 md:p-6 border-b border-accent/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-1 text-text-light">
              👨‍💻 {person.nome}
            </h3>
            <div className="text-accent/80 text-sm">
              {person.cargo}
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
            </div>
          ))}
        </div>

        {/* Grade de alocações - responsivo */}
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {days.map((day, index) => {
            const data = getDayDate(index);
            const atividadesDoDia = getAtividadesDoDia(data);
            const totalHoras = horasPorDia[data] || 0;
            const isDragOver = dragOverData === data;
            
            return (
              <DroppableDayColumn
                key={day}
                data={data}
                atividades={atividadesDoDia}
                totalHoras={totalHoras}
                onAddAllocation={onAddAllocation}
                onEditAllocation={onEditAllocation}
                onCloneAllocation={onCloneAllocation}
                onDrop={(dropData) => {
                  handleDragEnd(dropData);
                  setDragOverData(null);
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragStart={handleDragStart}
                isDragOver={isDragOver}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonCard; 
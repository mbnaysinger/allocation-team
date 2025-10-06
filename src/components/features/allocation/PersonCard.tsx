import React, { useState, useEffect } from "react";
import DroppableDayColumn from "@/components/ui/DroppableDayColumn";
import { Pessoa, AtividadeCompleta, StatusAtividade, ResumoSemanal } from "@/backend/core/models";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { formatDate } from "@/app/utils/date";
import { addDays } from "date-fns";

interface PersonCardProps {
  person: Pessoa;
  weekStart: Date;
  atividades: AtividadeCompleta[];
  resumoDaSemana?: ResumoSemanal;
  onAddAllocation: (day: string, pessoa: Pessoa) => void;
  onEditAllocation: (atividadeId: string) => void;
  onCloneAllocation: (atividadeId: string) => void;
  onMoveAtividade: (atividadeId: string, novaData: string) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  onOpenResumoModal: (pessoa: Pessoa) => void;
  calcularHorasDia: (pessoaId: string, data: string) => number;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  weekStart,
  atividades,
  onAddAllocation,
  onEditAllocation,
  onCloneAllocation,
  onMoveAtividade,
  onUpdateStatus,
  onOpenResumoModal,
  calcularHorasDia,
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const [horasPorDia, setHorasPorDia] = useState<Record<string, number>>({});
  const [dragOverData, setDragOverData] = useState<string | null>(null);
  
  // Hook para drag and drop
  const { handleDragStart, handleDragEnd } = useDragAndDrop({
    onMoveAtividade
  });

  // Calcular horas por dia
  useEffect(() => {
    const newHoras: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      // weekStart é Domingo. O board começa na Segunda (índice 0), então somamos i + 1.
      const targetDay = addDays(weekStart, i + 1);
      const dataStr = formatDate(targetDay);
      newHoras[dataStr] = calcularHorasDia(person.id, dataStr);
    }
    setHorasPorDia(newHoras);
  }, [person.id, weekStart, atividades, calcularHorasDia]);

  const getTotalHours = () => {
    return atividades
      .filter(atividade => atividade.pessoaId === person.id)
      .reduce((total, atividade) => total + atividade.horas, 0);
  };

  const getDayDate = (dayIndex: number) => {
    // weekStart é Domingo. O board começa na Segunda (índice 0), então somamos dayIndex + 1.
    const targetDay = addDays(weekStart, dayIndex + 1);
    return formatDate(targetDay);
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
    <div className="bg-slate-800 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
      {/* Header da pessoa */}
      <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/60 text-white p-4 md:p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-1 text-white uppercase">
              {person.nome}
            </h3>
            <div className="text-cyan-400 text-sm">
              {person.cargo}
            </div>
          </div>
          <button 
              onClick={() => onOpenResumoModal(person)}
              className="px-4 py-2 text-md font-semibold rounded-full border border-cyan-500 text-cyan-400 hover:text-white hover:bg-cyan-500 transition-colors"
            >
              Revisão da Semana
            </button>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{getTotalHours()}h</div>
              <div className="text-cyan-400/60 text-sm">Total Semana</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de alocação */}
      <div className="p-4 md:p-6">
        {/* Cabeçalho dos dias - responsivo */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-white text-xs md:text-sm border border-slate-500 rounded-md p-2 mb-0">{dayName}</div>
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
                onAddAllocation={(data) => onAddAllocation(data, person)}
                onEditAllocation={onEditAllocation}
                onCloneAllocation={onCloneAllocation}
                onUpdateStatus={onUpdateStatus}
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
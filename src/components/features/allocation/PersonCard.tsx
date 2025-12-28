import React, { useState, useEffect } from "react";
import DroppableDayColumn from "@/components/ui/DroppableDayColumn";
import DraggableActivityCard from "@/components/ui/DraggableActivityCard";
import { AtividadeCompleta, StatusAtividade } from "@/backend/core/models/Atividade";
import { ResumoSemanal } from "@/backend/core/models/ResumoSemanal";
import { formatDate, getWeekString } from "@/app/utils/date";
import { secondsToHHMM } from "@/app/utils/time";
import { addDays } from "date-fns";
import { Pessoa } from "@/backend/core/models/Pessoa";
import { UserRole } from "@/backend/core/models/UserRole";
import { DragOverlay, closestCenter, pointerWithin, DroppableContainer, CollisionDetection, DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

interface PersonCardProps {
  person: Pessoa;
  weekStart: Date;
  atividades: AtividadeCompleta[];
  resumoDaSemana?: ResumoSemanal;
  onAddAllocation: (day: string, pessoa: Pessoa) => void;
  onEditAllocation: (atividadeId: string) => void;
  onCloneAllocation: (atividadeId: string) => void;
  onMoveAtividade: (atividadeId: string, novaData: string, novaOrderedActivityIds: string[]) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  onOpenResumoModal: (pessoa: Pessoa) => void;
  calcularTempoDia: (pessoaId: string, data: string) => number;
  calcularTempoDiaExecutado: (pessoaId: string, data: string) => number;
  userRole: UserRole;
  onReorderActivitiesInDay: (activeId: string, overId: string, dayData: string) => void;
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
  calcularTempoDia,
  calcularTempoDiaExecutado,
  userRole,
  onReorderActivitiesInDay,
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const [tempoPorDia, setTempoPorDia] = useState<Record<string, number>>({});
  const [tempoExecutadoPorDia, setTempoExecutadoPorDia] = useState<Record<string, number>>({});

  // Calcular tempo por dia
  useEffect(() => {
    const newTempo: Record<string, number> = {};
    const newTempoExecutado: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      // weekStart é Domingo. O board começa na Segunda (índice 0), então somamos i + 1.
      const targetDay = addDays(weekStart, i + 1);
      const dataStr = formatDate(targetDay);
      newTempo[dataStr] = calcularTempoDia(person.id, dataStr);
      newTempoExecutado[dataStr] = calcularTempoDiaExecutado(person.id, dataStr);
    }
    setTempoPorDia(newTempo);
    setTempoExecutadoPorDia(newTempoExecutado);
  }, [person.id, weekStart, atividades, calcularTempoDia, calcularTempoDiaExecutado]);

  const getTotalSegundos = () => {
    return atividades
      .filter(atividade => atividade.pessoaId === person.id)
      .reduce((total, atividade) => total + atividade.tempo, 0);
  };

  const getTotalSegundosExecutados = () => {
    return atividades
      .filter(atividade => atividade.pessoaId === person.id)
      .reduce((total, atividade) => total + (atividade.tmp_executado || 0), 0);
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Reduzindo ainda mais para melhor responsividade
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeAtividade = atividades.find(a => a.id === active.id);
    if (!activeAtividade) {
      setActiveId(null);
      return;
    }

    const overId = String(over.id);

    // Determine if the drop target is a column or an activity
    const isOverActivity = atividades.some(a => a.id === overId);
    const isOverColumn = days.some((_, index) => getDayDate(index) === overId);

    if (isOverActivity) { // Dropped on another activity
      const overAtividade = atividades.find(a => a.id === overId);
      if (overAtividade && activeAtividade.data === overAtividade.data) {
        // Reordering within the same column
        onReorderActivitiesInDay(String(active.id), overId, activeAtividade.data);
      } else if (overAtividade && activeAtividade.data !== overAtividade.data) {
        // Moving between different columns (dropped on an activity in another column)
        const novaData = overAtividade.data;

        // Get activities in the target column, excluding the one being moved
        const atividadesNoNovoDia = atividades.filter(a => a.pessoaId === person.id && a.data === novaData && a.id !== activeAtividade.id);

        let novaPosicao: number;

        // If dropped on an activity
        if (isOverActivity && overAtividade) {
          const overIndex = atividadesNoNovoDia.findIndex(a => a.id === overId);

          if (overIndex === -1) {
            // overAtividade not found in filtered list, likely target column is empty or overAtividade was activeAtividade
            novaPosicao = atividadesNoNovoDia.length; // Append to end
          } else {
            // Always insert before the overAtividade for simplicity
            novaPosicao = overIndex;
          }
        } else { // Dropped on a column (empty or not)
          novaPosicao = atividadesNoNovoDia.length; // Always append to the end
        }

        const tempOrderedActivities: AtividadeCompleta[] = [];
        tempOrderedActivities.push(...atividadesNoNovoDia.slice(0, novaPosicao));
        tempOrderedActivities.push({ ...activeAtividade, data: novaData, semana: getWeekString(new Date(novaData)), posicao: novaPosicao });
        tempOrderedActivities.push(...atividadesNoNovoDia.slice(novaPosicao));

        const novaOrderedActivityIds = tempOrderedActivities.map(a => a.id);

        await onMoveAtividade(String(active.id), novaData, novaOrderedActivityIds);
      }
    } else if (isOverColumn) { // Dropped on a column (empty or not)
      if (activeAtividade.data !== overId) {
        // Moving between different columns.
        const novaData = overId; // overId is the new date string

        // Calculate novaOrderedActivityIds for the target column
        const atividadesNoNovoDia = atividades.filter(a => a.pessoaId === person.id && a.data === novaData && a.id !== activeAtividade.id);
        const tempOrderedActivities: AtividadeCompleta[] = [];

        // If dropped on an empty column, novaPosicao will be 0. Otherwise, it goes to the end.
        const novaPosicao = atividadesNoNovoDia.length; // Always append to the end for now if dropped on column directly

        // Insert the activeAtividade at the calculated novaPosicao
        tempOrderedActivities.push(...atividadesNoNovoDia.slice(0, novaPosicao));
        tempOrderedActivities.push({ ...activeAtividade, data: novaData, semana: getWeekString(new Date(novaData)), posicao: novaPosicao });
        tempOrderedActivities.push(...atividadesNoNovoDia.slice(novaPosicao));

        const novaOrderedActivityIds = tempOrderedActivities.map(a => a.id);

        await onMoveAtividade(String(active.id), novaData, novaOrderedActivityIds);
      } else {
        // Dropped on the same column. No explicit reorder needed here.
      }
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Função de detecção de colisão customizada para melhor sensibilidade
  const customCollisionDetection = (args: Parameters<CollisionDetection>[0]) => {
    const { droppableContainers, pointerCoordinates } = args;

    if (!pointerCoordinates) {
      return closestCenter(args);
    }

    // Primeiro tenta pointerWithin para detecção mais precisa
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Se encontrou colisões com pointer, vamos refinar para detectar posição mais precisa
      const sortableCollisions = pointerCollisions.filter(collision => {
        const container = droppableContainers.find((dc: DroppableContainer) => dc.id === collision.id);
        return container?.data.current?.sortable;
      });

      if (sortableCollisions.length > 0) {
        // Para itens sortable, vamos detectar se está na metade superior ou inferior
        const collision = sortableCollisions[0];
        const container = droppableContainers.find((dc: DroppableContainer) => dc.id === collision.id);
        const rect = container?.rect.current;

        if (rect) {
          return sortableCollisions;
        }
      }

      return pointerCollisions;
    }

    // Se não encontrar com pointer, usa closestCenter como fallback
    return closestCenter(args);
  };

  return (
    <div className="bg-slate-800 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
      {/* Header da pessoa */}
      <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/60 text-white p-4 md:p-3 md:px-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-1 text-white uppercase">
              {person.nome}
            </h3>
            <div className="text-cyan-400 text-sm">
              {person.cargo}
            </div>
          </div>
          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => onOpenResumoModal(person)}
              className="px-4 py-2 text-md font-semibold rounded-full border border-cyan-500 text-cyan-400 hover:text-white hover:bg-cyan-500 transition-colors"
            >
              Revisão da Semana
            </button>
          )}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                {secondsToHHMM(getTotalSegundos())}/{secondsToHHMM(getTotalSegundosExecutados())}
              </div>
              <div className="text-cyan-400/60 text-sm text-center">Planejado/Executado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de alocação */}
      <div className="p-4 md:p-4">
        {/* Cabeçalho dos dias - responsivo */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-white text-xs md:text-sm border border-slate-500 rounded-md p-2 mb-0">{dayName}</div>
            </div>
          ))}
        </div>

        {/* Grade de alocações - responsivo */}
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className={`grid grid-cols-5 gap-2 md:gap-4 transition-all duration-300 ${activeId ? 'scale-[0.99]' : ''}`}>
            {days.map((day, index) => {
              const data = getDayDate(index);
              const atividadesDoDia = getAtividadesDoDia(data);
              const totalSegundos = tempoPorDia[data] || 0;

              return (
                <DroppableDayColumn
                  key={data}
                  data={data}
                  atividades={atividadesDoDia}
                  totalSegundos={totalSegundos}
                  executedSegundos={tempoExecutadoPorDia[data] || 0}
                  onAddAllocation={(data) => onAddAllocation(data, person)}
                  onEditAllocation={onEditAllocation}
                  onCloneAllocation={onCloneAllocation}
                  onUpdateStatus={onUpdateStatus}
                  userRole={userRole}
                  activeId={activeId}
                  overId={overId}
                />
              );
            })}
          </div>
          <DragOverlay
            adjustScale={false}
            modifiers={[snapCenterToCursor]}
            style={{
              cursor: 'grabbing',
            }}
            dropAnimation={{
              duration: 150,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeId ? (
              <div style={{
                transform: 'rotate(2deg)',
                transformOrigin: 'center',
              }}>
                <DraggableActivityCard
                  atividade={atividades.find(a => a.id === activeId) as AtividadeCompleta}
                  onEdit={onEditAllocation}
                  onClone={onCloneAllocation}
                  onUpdateStatus={onUpdateStatus}
                  userRole={userRole}
                  overlay={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default PersonCard;
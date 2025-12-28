import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import TarjaHoras from './TarjaHoras';
import DraggableActivityCard from './DraggableActivityCard';
import { AtividadeCompleta, StatusAtividade } from '@/backend/core/models/Atividade';
import { UserRole } from '@/backend/core/models/UserRole';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface DroppableDayColumnProps {
  data: string;
  atividades: AtividadeCompleta[];
  totalSegundos: number;
  executedSegundos: number;
  onAddAllocation: (data: string) => void;
  onEditAllocation: (atividadeId: string) => void;
  onCloneAllocation: (atividadeId: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  userRole: UserRole;
  activeId?: string | null;
  overId?: string | null;
}

const DroppableDayColumn: React.FC<DroppableDayColumnProps> = ({
  data,
  atividades,
  totalSegundos,
  executedSegundos,
  onAddAllocation,
  onEditAllocation,
  onCloneAllocation,
  onUpdateStatus,
  userRole,
  activeId,
  overId
}) => {
  const { setNodeRef } = useDroppable({ id: data });

  const isDragging = activeId !== null;
  const isOverThisColumn = overId === data || atividades.some(atividade => atividade.id === overId);
  const hasActivities = atividades.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px]
        md:min-h-[120px]
        border-2
        border-dashed
        rounded-lg
        p-2
        md:p-4
        bg-slate-800/30
        transition-all
        duration-300
        ease-in-out
        border-slate-500
        ${isDragging && !isOverThisColumn ? 'border-slate-500/70 bg-slate-800/15 opacity-80' : ''}
        ${isOverThisColumn && isDragging ?
          hasActivities
            ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/40 scale-[1.02] ring-2 ring-cyan-400/30'
            : 'border-cyan-500 bg-cyan-500/10 scale-105 shadow-md shadow-cyan-500/60 ring-2 ring-cyan-500/40'
          : ''
        }
        ${!isDragging ? 'hover:border-slate-400 hover:bg-slate-800/40' : ''}
      `}
    >
      {/* Tarja de horas */}
      <TarjaHoras
        totalSegundos={totalSegundos}
        data={data}
        className="mb-6"
        executedSegundos={executedSegundos}
      />

      {/* Atividades do dia */}
      <SortableContext items={atividades.map(atividade => atividade.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {atividades.map((atividade, index) => {
            const isOverThisActivity = overId === atividade.id;
            const showDropIndicatorAbove = isOverThisActivity && isDragging && activeId !== atividade.id;

            return (
              <React.Fragment key={atividade.id}>
                {showDropIndicatorAbove && (
                  <div className="h-1 bg-cyan-400 rounded-full mx-2 shadow-lg shadow-cyan-400/50 animate-pulse" />
                )}
                <div className="relative">
                  {/* Zona de drop invisível acima do cartão */}
                  {index === 0 && isDragging && isOverThisColumn && (
                    <div
                      className="absolute -top-4 left-0 right-0 h-8 z-10"
                      data-drop-zone="above"
                      data-activity-id={atividade.id}
                    />
                  )}

                  <DraggableActivityCard
                    atividade={atividade}
                    onEdit={onEditAllocation}
                    onClone={onCloneAllocation}
                    onUpdateStatus={onUpdateStatus}
                    userRole={userRole}
                  />

                  {/* Zona de drop invisível abaixo do cartão */}
                  {isDragging && isOverThisColumn && (
                    <div
                      className="absolute -bottom-4 left-0 right-0 h-8 z-10"
                      data-drop-zone="below"
                      data-activity-id={atividade.id}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Indicador para inserção no final da lista */}
        {isDragging && isOverThisColumn && overId === data && atividades.length > 0 && (
          <div className="h-1 bg-cyan-400 rounded-full mx-2 mt-2 shadow-lg shadow-cyan-400/50 animate-pulse" />
        )}
      </SortableContext>

      {userRole === UserRole.ADMIN && (
        <Button
          onClick={() => onAddAllocation(data)}
          variant="login"
          size="sm"
          className="w-full mt-4 text-xs font-medium"
        >
          <Plus size={12} className="mr-1" />
          <span className="hidden sm:inline">Adicionar</span>
        </Button>
      )}
    </div>
  );
};

export default DroppableDayColumn;
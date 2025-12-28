import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, TriangleAlert } from 'lucide-react';
import { AtividadeCompleta, StatusAtividade } from '@/backend/core/models/Atividade';
import { Tooltip } from 'react-tooltip';
import { secondsToHHMM } from '@/app/utils/time';
import { TooltipWrapper } from './TooltipWrapper';
import { UserRole } from '@/backend/core/models/UserRole';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableActivityCardProps {
  atividade: AtividadeCompleta;
  onEdit: (atividadeId: string) => void;
  onClone: (atividadeId: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  userRole: UserRole;
  overlay?: boolean;
}

const DraggableActivityCard: React.FC<DraggableActivityCardProps> = ({
  atividade,
  onEdit,
  onClone,
  onUpdateStatus,
  userRole,
  overlay = false
}) => {
  const { status = 'planejada' } = atividade;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: atividade.id, disabled: overlay });

  const style = overlay ? {
    cursor: 'grabbing' as const,
    pointerEvents: 'none' as const,
  } : {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    cursor: isDragging ? 'grabbing' as const : 'grab' as const,
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'concluida':
        return 'bg-slate-700 border-l-5 border-green-500 opacity-80 text-white';
      case 'nao_realizada':
        return 'bg-slate-800 border-l-5 border-red-500 opacity-60 text-gray-400';
      default:
        return 'bg-slate-600 border-l-5 border-cyan-500 text-white';
    }
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: StatusAtividade) => {
    e.stopPropagation();
    const finalStatus = newStatus === status ? 'planejada' : newStatus;
    onUpdateStatus(atividade.id, finalStatus);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!overlay && attributes)}
      {...(!overlay && listeners)}
      className={`
        ${overlay ? 'p-3 text-sm' : 'p-2 md:p-3 text-xs md:text-sm'}
        rounded-lg
        ${overlay ? '' : 'mb-2'}
        cursor-pointer
        ${overlay ? '' : 'hover:scale-[1.02]'}
        transition-all
        duration-200
        ease-in-out
        relative
        group
        shadow-lg
        ${overlay ? '' : 'hover:shadow-xl'}
        ${getStatusClasses()}
        ${isDragging ? 'opacity-40 scale-95 shadow-none' : ''}
        ${overlay ? 'opacity-95 shadow-2xl border-2 border-cyan-400 scale-105 min-w-[180px] max-w-[200px]' : ''}
      `}
      onClick={() => onEdit(atividade.id)}
    >
      <div className="flex items-center gap-1">
        {atividade.isDesvio && (
          <TooltipWrapper content="Desvio de planejamento" place="top">
            <TriangleAlert size={20} className="text-yellow-500" />
          </TooltipWrapper>
        )}
        <div className="font-bold text-sm md:text-base truncate">{atividade.titulo}</div>
      </div>
      <div className="text-xs opacity-90 truncate">
        {secondsToHHMM(atividade.tempo)}/{secondsToHHMM(atividade.tmp_executado || 0)}
      </div>
      <div className="font-bold text-xs opacity-90 truncate">
        {atividade.tipo}
      </div>
      {atividade.projeto && (
        <TooltipWrapper
          content={atividade.projeto.nome}
          className="text-xs opacity-90 truncate max-w-25"
          place="top"
        >
          {atividade.projeto.abreviatura}
        </TooltipWrapper>
      )}

      <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => handleStatusClick(e, 'concluida')}
          className={`p-1.5 rounded-full transition-all ${status === 'concluida' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-700/80 text-gray-300 hover:bg-green-500 hover:text-white'}`}
          data-tooltip-id="status-tooltip"
          data-tooltip-content="Concluído"
        >
          <ThumbsUp size={14} />
          <Tooltip id="status-tooltip" />
        </button>
        <button
          onClick={(e) => handleStatusClick(e, 'nao_realizada')}
          className={`p-1.5 rounded-full transition-all ${status === 'nao_realizada' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-700/80 text-gray-300 hover:bg-red-500 hover:text-white'}`}
          data-tooltip-id="status-tooltip"
          data-tooltip-content="Não Realizado"
        >
          <ThumbsDown size={14} />
          <Tooltip id="status-tooltip" />
        </button>
        {userRole === UserRole.ADMIN && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClone(atividade.id);
            }}
            className="p-1.5 bg-slate-700/80 text-gray-300 hover:bg-cyan-500 hover:text-white rounded-full shadow-sm transition-all"
            data-tooltip-id="clone-tooltip"
            data-tooltip-content="Clonar"
          >
            <Copy size={14} />
            <Tooltip id="clone-tooltip" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DraggableActivityCard;

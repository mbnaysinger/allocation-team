import React from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AtividadeCompleta, StatusAtividade } from '@/backend/core/models';
import { Tooltip } from 'react-tooltip';
import { TooltipWrapper } from './TooltipWrapper';

interface DraggableActivityCardProps {
  atividade: AtividadeCompleta;
  onEdit: (atividadeId: string) => void;
  onClone: (atividadeId: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  onDragStart?: (atividade: AtividadeCompleta) => void;
  isDragging?: boolean;
}

const DraggableActivityCard: React.FC<DraggableActivityCardProps> = ({
  atividade,
  onEdit,
  onClone,
  onUpdateStatus,
  onDragStart,
  isDragging = false
}) => {
  const { status = 'planejada' } = atividade; // Garante um status padrão

  const getStatusClasses = () => {
    switch (status) {
      case 'concluida':
        return 'bg-slate-700 border-l-4 border-green-500 opacity-90 text-white';
      case 'nao_realizada':
        return 'bg-slate-800 border-l-4 border-red-500 opacity-60 text-gray-400';
      default:
        return 'bg-slate-600 border-l-4 border-cyan-500 text-white';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', atividade.id);
    onDragStart?.(atividade);
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: StatusAtividade) => {
    e.stopPropagation();
    // Se o novo status for o mesmo que o atual, reverte para 'planejada'
    const finalStatus = newStatus === status ? 'planejada' : newStatus;
    onUpdateStatus(atividade.id, finalStatus);
  };

  return (
    <div
      draggable
      className={`
        p-2 md:p-3
        rounded-lg 
        mb-2 
        cursor-pointer 
        hover:scale-105 
        transition-all 
        text-xs md:text-sm 
        relative 
        group
        shadow-lg
        hover:shadow-xl
        ${getStatusClasses()}
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      onClick={() => onEdit(atividade.id)}
      onDragStart={handleDragStart}
    >
      <div className="font-bold text-sm md:text-base truncate">{atividade.titulo}</div>
      <div className="text-xs opacity-90 truncate">
        {atividade.horas}h
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
      </div>
    </div>
  );
};

export default DraggableActivityCard;

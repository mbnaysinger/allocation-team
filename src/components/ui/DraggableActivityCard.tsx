import React from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AtividadeCompleta, StatusAtividade } from '@/core/models';
import { Tooltip } from 'react-tooltip';

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
        return 'bg-gray-200 border-l-5 border-green-500 opacity-90';
      case 'nao_realizada':
        return 'bg-gray-200 border-l-5 border-red-500 opacity-60';
      default:
        return 'bg-gray-200 border-l-5 border-accent';
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
        bg-gradient-to-r from-bg/80 to-bg/60
        p-2 md:p-3
        rounded-lg 
        mb-2 
        cursor-pointer 
        hover:scale-105 
        transition-all 
        text-xs md:text-sm 
        relative 
        group
        shadow-glass
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
      {atividade.projeto && (
        <div className="text-xs opacity-90 truncate">
          {atividade.projeto.abreviatura}
        </div>
      )}
      <div className="font-bold text-xs opacity-90 truncate">
        {atividade.tipo}
      </div>
      
      <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => handleStatusClick(e, 'concluida')}
          className={`p-1 rounded-full ${status === 'concluida' ? 'bg-green-500/80 text-white' : 'bg-white/70 hover:bg-white'}`}
          data-tooltip-id="status-tooltip"
          data-tooltip-content="Concluído"
        >
          <ThumbsUp size={16} />
          <Tooltip id="status-tooltip" />
        </button>
        <button
          onClick={(e) => handleStatusClick(e, 'nao_realizada')}
          className={`p-1 rounded-full ${status === 'nao_realizada' ? 'bg-red-500/80 text-white' : 'bg-white/70 hover:bg-white'}`}
          data-tooltip-id="status-tooltip"
          data-tooltip-content="Não Realizado"
        >
          <ThumbsDown size={16} />
          <Tooltip id="status-tooltip" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClone(atividade.id);
          }}
          className="p-1 bg-white/70 hover:bg-white rounded-full shadow-sm"
          data-tooltip-id="clone-tooltip"
          data-tooltip-content="Clonar"
        >
          <Copy size={16} className="text-accent"/>
          <Tooltip id="clone-tooltip" />
        </button>
      </div>
    </div>
  );
};

export default DraggableActivityCard;

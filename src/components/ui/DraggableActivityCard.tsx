import React from 'react';
import { Copy } from 'lucide-react';
import { AtividadeCompleta } from '@/core/models';
import { Tooltip } from 'react-tooltip';

interface DraggableActivityCardProps {
  atividade: AtividadeCompleta;
  onEdit: (atividadeId: string) => void;
  onClone: (atividadeId: string) => void;
  onDragStart?: (atividade: AtividadeCompleta) => void;
  isDragging?: boolean;
}

const DraggableActivityCard: React.FC<DraggableActivityCardProps> = ({
  atividade,
  onEdit,
  onClone,
  onDragStart,
  isDragging = false
}) => {
  const getTypeClasses = (tipo: string) => {
    switch (tipo) {
      case 'Projeto':
        return 'bg-gray-300 from-accent to-accent/80 text-bg';
      case 'Melhoria':
        return 'bg-gray-300 from-accent to-accent/80 text-bg';
      case 'Sustentação':
        return 'bg-gray-300 from-accent to-accent/80 text-bg';
      default:
        return 'bg-gray-300 from-accent to-accent/80 text-bg';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', atividade.id);
    onDragStart?.(atividade);
  };

  return (
    <div
      draggable
      className={`
        ${getTypeClasses(atividade.tipo)} 
        p-2 md:p-3 
        rounded-lg 
        mb-2 
        cursor-pointer 
        hover:scale-105 
        transition-transform 
        text-xs md:text-sm 
        relative 
        group
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      onClick={() => onEdit(atividade.id)}
      onDragStart={handleDragStart}
    >
      <div className="font-bold text-base md:text-md truncate">{atividade.titulo}</div>
      <div className="text-xs md:text-sm opacity-90 truncate">
        {atividade.horas}h
      </div>
      {atividade.projeto && (
        <div className="text-xs opacity-90 truncate">
          {atividade.projeto.abreviatura}
        </div>
      )}
      <div className="font-bold text-xs md:text-sm opacity-90 truncate">
        {atividade.tipo}
      </div>
      
      {/* Ícone de clonar no canto inferior direito */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClone(atividade.id);
        }}
        className="absolute bottom-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm font-bold"
        data-tooltip-id="clone-tooltip"
        data-tooltip-content="Clonar"
      >
        <Copy size={12} className="text-accent" />
        <Tooltip id="clone-tooltip" />
      </button>
    </div>
  );
};

export default DraggableActivityCard; 
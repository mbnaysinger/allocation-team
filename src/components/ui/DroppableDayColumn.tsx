import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import TarjaHoras from './TarjaHoras';
import DraggableActivityCard from './DraggableActivityCard';
import { AtividadeCompleta, StatusAtividade } from '@/core/models';

interface DroppableDayColumnProps {
  data: string;
  atividades: AtividadeCompleta[];
  totalHoras: number;
  onAddAllocation: (data: string) => void;
  onEditAllocation: (atividadeId: string) => void;
  onCloneAllocation: (atividadeId: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusAtividade) => void;
  onDrop: (data: string) => void;
  onDragOver?: (data: string) => void;
  onDragLeave?: () => void;
  onDragStart?: (atividade: AtividadeCompleta) => void;
  isDragOver?: boolean;
}

const DroppableDayColumn: React.FC<DroppableDayColumnProps> = ({
  data,
  atividades,
  totalHoras,
  onAddAllocation,
  onEditAllocation,
  onCloneAllocation,
  onUpdateStatus,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  isDragOver = false
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver?.(data);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave?.();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(data);
  };

  return (
    <div
      className={`
        min-h-[100px] 
        md:min-h-[120px] 
        border-2 
        border-dashed 
        rounded-lg 
        p-2 
        md:p-4 
        bg-bg/20
        transition-all
        duration-200
        ${isDragOver 
          ? 'border-accent bg-accent/10 scale-105' 
          : 'border-accent/30'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Tarja de horas */}
      <TarjaHoras 
        totalHoras={totalHoras} 
        data={data} 
        className="mb-6"
      />
      
      {/* Atividades do dia */}
      {atividades.map((atividade) => (
        <DraggableActivityCard
          key={atividade.id}
          atividade={atividade}
          onEdit={onEditAllocation}
          onClone={onCloneAllocation}
          onUpdateStatus={onUpdateStatus}
          onDragStart={onDragStart}
        />
      ))}
      
      <Button
        onClick={() => onAddAllocation(data)}
        variant="outline"
        size="sm"
        className="w-full mt-4 text-accent border-accent/50 hover:bg-accent hover:text-bg text-xs"
      >
        <Plus size={12} className="mr-" />
        <span className="hidden sm:inline">Adicionar</span>
      </Button>
    </div>
  );
};

export default DroppableDayColumn;

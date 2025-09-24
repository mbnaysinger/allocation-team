import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import TarjaHoras from './TarjaHoras';
import DraggableActivityCard from './DraggableActivityCard';
import { AtividadeCompleta, StatusAtividade } from '@/backend/core/models';

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
        bg-slate-800/30
        transition-all
        duration-200
        ${isDragOver 
          ? 'border-cyan-500 bg-cyan-500/10 scale-105 shadow-md shadow-cyan-500/60' 
          : 'border-slate-500 hover:border-slate-500'
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
        variant="login"
        size="sm"
        className="w-full mt-4 text-xs font-medium"
      >
        <Plus size={12} className="mr-1" />
        <span className="hidden sm:inline">Adicionar</span>
      </Button>
    </div>
  );
};

export default DroppableDayColumn;

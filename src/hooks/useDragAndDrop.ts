import { useState, useCallback } from 'react';
import { AtividadeCompleta } from '../types/allocation';

interface UseDragAndDropProps {
  onMoveAtividade: (atividadeId: string, novaData: string) => Promise<void>;
}

export const useDragAndDrop = ({ onMoveAtividade }: UseDragAndDropProps) => {
  const [draggedItem, setDraggedItem] = useState<AtividadeCompleta | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((atividade: AtividadeCompleta) => {
    setDraggedItem(atividade);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(async (novaData: string) => {
    if (draggedItem && draggedItem.data !== novaData) {
      try {
        await onMoveAtividade(draggedItem.id, novaData);
      } catch (error) {
        console.error('Erro ao mover atividade:', error);
      }
    }
    
    setDraggedItem(null);
    setIsDragging(false);
  }, [draggedItem, onMoveAtividade]);

  const handleDragCancel = useCallback(() => {
    setDraggedItem(null);
    setIsDragging(false);
  }, []);

  return {
    draggedItem,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel
  };
}; 
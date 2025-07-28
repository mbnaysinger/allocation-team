import { useRef, useCallback } from 'react';

export const useScrollPreservation = () => {
  const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);

  const saveScrollPosition = useCallback(() => {
    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY
    };
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollPositionRef.current) {
      window.scrollTo({
        left: scrollPositionRef.current.x,
        top: scrollPositionRef.current.y,
        behavior: 'instant' // Usar 'instant' para evitar animação
      });
      scrollPositionRef.current = null;
    }
  }, []);

  const executeWithScrollPreservation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    saveScrollPosition();
    try {
      const result = await operation();
      // Usar setTimeout para garantir que o DOM foi atualizado
      setTimeout(restoreScrollPosition, 0);
      return result;
    } catch (error) {
      // Restaurar scroll mesmo em caso de erro
      setTimeout(restoreScrollPosition, 0);
      throw error;
    }
  }, [saveScrollPosition, restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    executeWithScrollPreservation
  };
}; 
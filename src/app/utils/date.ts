// src/app/utils/date.ts

/**
 * Retorna o primeiro (segunda-feira) e o último (sexta-feira) dia da semana para uma data.
 */
export const getWeekDates = (date: Date) => {
  const start = new Date(date);
  // Ajusta para o início da semana (considerando Domingo = 0)
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // se for Domingo, vai para a segunda anterior
  start.setDate(diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Sexta-feira
  
  return { start, end };
};

/**
 * Formata um objeto Date para o formato YYYY-MM-DD.
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

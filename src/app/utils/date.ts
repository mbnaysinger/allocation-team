// src/app/utils/date.ts

/**
 * Retorna o primeiro (segunda-feira) e o último (sexta-feira) dia da semana para uma data.
 */
export const getWeekNumber = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${weekNo}${year}`;
};

export const getWeekString = (date: Date) => {
  // Usa sempre a data local do cliente
  const d = new Date(date);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${weekNo}${d.getFullYear()}`;
};

export const getWeekDates = (date: Date) => {
  // Cria uma cópia da data para evitar mutação
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

/**
 * Formata um objeto Date para o formato DD/MM/YYYY para exibição, usando UTC.
 */
export const formatDateForDisplay = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

export const getCurrentDateFromWeekNumber = (weekNumber: string) => {
  const [week, year] = weekNumber.split('-').map(Number);
  return new Date(year, 0, 1 + (week - 1) * 7);
};

// src/app/utils/date.ts
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { getWeek } from 'date-fns';

/**
 * A fonte da verdade para o fuso horário da aplicação.
 */
const TIMEZONE = 'America/Sao_Paulo';

// --- Funções de Fuso Horário e Data Atual ---

export const getNowInSampa = (): Date => {
  return toZonedTime(new Date(), TIMEZONE);
};

export const toSampaTime = (date: Date): Date => {
  return toZonedTime(date, TIMEZONE);
};

// --- Novas Funções de Semana (Domingo a Sábado) ---

/**
 * Retorna o início (Domingo) da semana para uma data específica.
 */
export const getSundayWeekStart = (date: Date): Date => {
  console.log('getSundayWeekStart input:', date);
  console.log('getSundayWeekStart input day:', date.getDay());
  
  // Abordagem mais simples: usa a data como string e reconstrói
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  console.log(`Date components: year=${year}, month=${month}, day=${day}`);
  
  // Cria uma nova data com os mesmos componentes
  const sunday = new Date(year, month, day);
  const dayOfWeek = sunday.getDay();
  
  console.log('Day of week to process:', dayOfWeek);
  
  // Calcula o domingo da semana
  if (dayOfWeek !== 0) {
    const daysToSubtract = dayOfWeek;
    sunday.setDate(sunday.getDate() - daysToSubtract);
    console.log(`Subtracted ${daysToSubtract} days`);
  }
  
  // Zera as horas
  sunday.setHours(0, 0, 0, 0);
  
  console.log('getSundayWeekStart output:', sunday);
  console.log('getSundayWeekStart day of week:', sunday.getDay());
  
  return sunday;
};

/**
 * Para uma data, retorna o identificador numérico da semana no formato WWYYYY para o backend.
 * A semana é calculada com base na definição de Domingo a Sábado.
 */
export const getWeekString = (date: Date): string => {
  const zonedDate = toSampaTime(date);
  // getWeek com weekStartsOn: 0 (Domingo)
  const week = getWeek(zonedDate, { weekStartsOn: 0 });
  const year = zonedDate.getFullYear();
  return `${String(week).padStart(2, '0')}${year}`;
};

// --- Funções de Formatação ---

/**
 * Formata um objeto Date para o formato YYYY-MM-DD.
 */
export const formatDate = (date: Date): string => {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Formata um objeto Date para o formato DD/MM para exibição nos cards.
 */
export const formatDateForDisplay = (date: Date): string => {
  return formatInTimeZone(date, TIMEZONE, 'dd/MM');
};

/**
 * Converte uma string YYYY-MM-DD de volta para um objeto Date, no fuso horário correto.
 */
export const parseDateString = (dateString: string): Date => {
  // Parse manual para evitar problemas de fuso horário
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month é 0-indexed
  console.log('parseDateString input:', dateString);
  console.log('parseDateString output:', date);
  console.log('parseDateString day of week:', date.getDay());
  return date;
};

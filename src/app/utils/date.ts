// src/app/utils/date.ts
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { getWeek, parseISO } from 'date-fns';

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
  
  // Calcula manualmente o domingo da semana sem conversão de fuso
  const dayOfWeek = date.getDay(); // 0 = domingo, 1 = segunda, etc.
  const daysToSubtract = dayOfWeek; // Se for domingo (0), subtrai 0. Se for segunda (1), subtrai 1, etc.
  
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() - daysToSubtract);
  sunday.setHours(0, 0, 0, 0); // Zera as horas para garantir que seja o início do dia
  
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
  // parseISO cria a data no fuso local, sem conversão adicional
  const date = parseISO(dateString);
  console.log('parseDateString input:', dateString);
  console.log('parseDateString output:', date);
  return date;
};

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
  
  // Cria uma nova data para não modificar a original
  const sunday = new Date(date);
  
  // Calcula quantos dias subtrair para chegar ao domingo da semana atual
  const dayOfWeek = sunday.getDay(); // 0 = domingo, 1 = segunda, etc.
  console.log('Day of week to process:', dayOfWeek);
  
  // Se for domingo (0), não subtrai nada. Se for segunda (1), subtrai 1, etc.
  // Para sábado (6), subtrai 6 para chegar ao domingo da mesma semana
  if (dayOfWeek !== 0) {
    const originalDate = sunday.getDate();
    sunday.setDate(sunday.getDate() - dayOfWeek);
    console.log(`Subtracted ${dayOfWeek} days from ${originalDate} to get ${sunday.getDate()}`);
  }
  
  // Zera as horas para garantir que seja o início do dia
  sunday.setHours(0, 0, 0, 0);
  
  console.log('getSundayWeekStart output:', sunday);
  console.log('getSundayWeekStart day of week:', sunday.getDay());
  
  // Verificação final - se ainda não for domingo, força
  if (sunday.getDay() !== 0) {
    console.log('ERROR: Still not Sunday! Forcing correction...');
    const correction = sunday.getDay();
    sunday.setDate(sunday.getDate() - correction);
    console.log('After correction:', sunday.getDay());
  }
  
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

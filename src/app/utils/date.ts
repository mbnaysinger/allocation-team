// src/app/utils/date.ts
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getISOWeek, startOfISOWeek, addDays, parse, getYear } from 'date-fns';

/**
 * A fonte da verdade para o fuso horário da aplicação.
 * Usar 'America/Sao_Paulo' garante consistência com o horário de Brasília.
 */
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna a data e hora ATUAIS, já ajustadas para o fuso horário de São Paulo.
 * Use esta função sempre que precisar de "agora".
 */
export const getNowInSampa = (): Date => {
  return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Converte uma data (que pode estar em UTC do servidor) para o fuso horário de São Paulo.
 * Útil para garantir que datas vindas do banco de dados sejam tratadas corretamente.
 */
export const toSampaTime = (date: Date): Date => {
  return toZonedTime(date, TIMEZONE);
};

/**
 * Retorna a string da semana no formato padrão ISO 8601 (YYYY-WW) para uma data.
 * Ex: '2025-41'
 */
export const getWeekString = (date: Date): string => {
  // Assegura que a data esteja no fuso correto antes de calcular
  const zonedDate = toSampaTime(date);
  const week = getISOWeek(zonedDate);
  // getYear é mais seguro que getFullYear para anos no limite da semana ISO
  const year = getYear(zonedDate);
  return `${String(week).padStart(2, '0')}${year}`;
};

/**
 * Converte uma string de semana (YYYY-WW) de volta para um objeto Date.
 * Retorna a segunda-feira da semana especificada, no fuso horário de São Paulo.
 */
export const getDateFromWeekString = (weekString: string): Date => {
  const [year, week] = weekString.split('-').map(Number);
  // A função parse do date-fns cria a data corretamente a partir da semana ISO
  const date = parse(`${week}`, 'w', new Date(`${year}-01-01`));
  return startOfISOWeek(date);
};

/**
 * Retorna o primeiro dia (segunda-feira) e o último (sexta-feira) da semana de trabalho.
 * Todos os cálculos são feitos de forma segura no fuso horário de São Paulo.
 */
export const getWeekDates = (date: Date) => {
  const zonedDate = toSampaTime(date);
  const start = startOfISOWeek(zonedDate);
  const end = addDays(start, 4); // Sexta-feira
  return { start, end };
};

/**
 * Formata um objeto Date para o formato YYYY-MM-DD.
 * Opcional: pode-se garantir que a formatação use o fuso de SP.
 */
export const formatDate = (date: Date): string => {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Formata um objeto Date para o formato DD/MM/YYYY para exibição.
 */
export const formatDateForDisplay = (date: Date): string => {
  return formatInTimeZone(date, TIMEZONE, 'dd/MM/yyyy');
};

/**
 * Retorna um número que representa a semana e o ano no formato WWYYYY (ex: 412025).
 * A semana é calculada usando o padrão ISO 8601 e o fuso horário de São Paulo.
 */
export const getWeekNumber = (date: Date): number => {
  const zonedDate = toSampaTime(date);
  const week = getISOWeek(zonedDate);
  const year = getYear(zonedDate);
  
  // Formata como "WWYYYY" e converte para número
  const weekAndYearString = `${String(week).padStart(2, '0')}${year}`;
  
  return parseInt(weekAndYearString, 10);
};
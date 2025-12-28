
/**
 * Converte um número total de segundos para uma string no formato hh:mm.
 * @param totalSeconds O número total de segundos.
 * @returns A string formatada como hh:mm.
 */
export const secondsToHHMM = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}`;
};

/**
 * Converte uma string de tempo no formato hh:mm para o número total de segundos.
 * @param time A string de tempo no formato hh:mm.
 * @returns O número total de segundos.
 */
export const hhmmToSeconds = (time: string): number => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return 0;
  }

  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return 0;
  }

  return (hours * 3600) + (minutes * 60);
};

/**
 * Ajusta um tempo no formato hh:mm, adicionando ou subtraindo uma quantidade de minutos.
 * @param time A string de tempo inicial no formato hh:mm.
 * @param minutesToAdd A quantidade de minutos a adicionar (pode ser negativa para subtrair).
 * @returns A nova string de tempo no formato hh:mm.
 */
export const adjustHHMM = (time: string, minutesToAdd: number): string => {
  const totalSeconds = hhmmToSeconds(time);
  const newTotalSeconds = Math.max(0, totalSeconds + minutesToAdd * 60);
  return secondsToHHMM(newTotalSeconds);
};

/**
 * Formata um valor de string para o formato hh:mm enquanto o usuário digita.
 * @param value A string de entrada.
 * @returns A string formatada.
 */
export const formatHHMM = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const digits = value.replace(/\D/g, '');

  // Limita a 4 dígitos (hhmm)
  const truncatedDigits = digits.slice(0, 4);

  if (truncatedDigits.length > 2) {
    // Insere os dois pontos após os dois primeiros dígitos
    return `${truncatedDigits.slice(0, 2)}:${truncatedDigits.slice(2)}`;
  }

  return truncatedDigits;
};

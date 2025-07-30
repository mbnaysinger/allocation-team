// src/app/utils/colors.ts
export const getCoresHoras = (totalHoras: number) => {
  if (totalHoras === 0) return { cor: '#f3f4f6', texto: '#000000' }; // Cinza claro
  if (totalHoras <= 4) return { cor: '#f7fc6d', texto: '#000000' };   // Amarelo claro
  if (totalHoras <= 8) return { cor: '#6af27a', texto: '#000000' };   // Verde claro
  if (totalHoras > 8) return { cor: '#f53b3b', texto: '#FFFFFF' };    // Vermelho claro
  return { cor: '#f3f4f6', texto: '#000000' };
};

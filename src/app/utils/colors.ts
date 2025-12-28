// src/app/utils/colors.ts
export const getCoresTempo = (totalSegundos: number) => {
  if (totalSegundos === 0) return { 
    cor: '#374151', // Slate-700 para tema dark
    texto: '#FFFFFF',
    borda: '#6B7280' // Slate-500 para borda sutil
  };
  if (totalSegundos <= 14400) return { 
    cor: '#FCD34D', // Amarelo mais vibrante
    texto: '#1F2937', // Cinza escuro para contraste
    borda: '#F59E0B' // Amarelo mais escuro para borda
  };
  if (totalSegundos <= 28800) return { 
    cor: '#10B981', // Verde mais vibrante
    texto: '#FFFFFF',
    borda: '#059669' // Verde mais escuro para borda
  };
  if (totalSegundos > 28800) return { 
    cor: '#EF4444', // Vermelho mais vibrante
    texto: '#FFFFFF',
    borda: '#DC2626' // Vermelho mais escuro para borda
  };
  return { 
    cor: '#374151', 
    texto: '#FFFFFF',
    borda: '#6B7280'
  };
};

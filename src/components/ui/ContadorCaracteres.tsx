import React from 'react';

interface ContadorCaracteresProps {
  texto: string;
  limite: number;
  className?: string;
}

const ContadorCaracteres: React.FC<ContadorCaracteresProps> = ({ texto, limite, className = '' }) => {
  const contagem = texto.length;
  const estaNoLimite = contagem >= limite;
  const estaAcimaDoLimite = contagem > limite;
  
  const getCorTexto = () => {
    if (estaAcimaDoLimite) return 'text-red-500';
    if (estaNoLimite) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div className={`text-xs ${getCorTexto()} ${className}`}>
      {contagem}/{limite} caracteres
    </div>
  );
};

export default ContadorCaracteres; 
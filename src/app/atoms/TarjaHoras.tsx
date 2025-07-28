import React from 'react';
import { getCoresHoras } from '../../types/allocation';

interface TarjaHorasProps {
  totalHoras: number;
  data: string;
  className?: string;
}

const TarjaHoras: React.FC<TarjaHorasProps> = ({ totalHoras, data, className = '' }) => {
  const cores = getCoresHoras(totalHoras);
  
  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${className}`}
      style={{ 
        backgroundColor: cores.cor,
        color: cores.texto
      }}
    >
      <span className="font-semibold">
        {formatarData(data)}
      </span>
      <span className="font-bold text-lg">
        {totalHoras}h
      </span>
    </div>
  );
};

export default TarjaHoras; 
import React from 'react';
import { getCoresHoras } from '@/app/utils/colors';
import { ClockAlert } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface TarjaHorasProps {
  totalHoras: number;
  data: string;
  className?: string;
}

const TarjaHoras: React.FC<TarjaHorasProps> = ({ totalHoras, data, className = '' }) => {
  const cores = getCoresHoras(totalHoras);
  
  const formatarData = (data: string) => {
    const [,mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  };

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${className}`}
      style={{ 
        backgroundColor: cores.cor,
        color: cores.texto
      }}
    >
      <span className="font-semibold text-white">
        {formatarData(data)}
      </span>
      {totalHoras > 8 && (
        <span className="font-bold text-lg text-red-400" data-tooltip-id="clock" data-tooltip-content="Muitas horas alocadas neste dia">
          <ClockAlert />
          <Tooltip id="clock" />
        </span>
      )}
      <span className="font-bold text-lg text-white">
        {totalHoras}h
      </span>
    </div>
  );
};

export default TarjaHoras; 
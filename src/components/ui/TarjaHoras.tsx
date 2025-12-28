import React from 'react';
import { getCoresTempo } from '@/app/utils/colors';
import { secondsToHHMM } from '@/app/utils/time';
import { ClockAlert } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface TarjaHorasProps {
  totalSegundos: number;
  executedSegundos: number;
  data: string;
  className?: string;
}

const TarjaHoras: React.FC<TarjaHorasProps> = ({ totalSegundos, executedSegundos, data, className = '' }) => {
  const cores = getCoresTempo(totalSegundos);
  
  const formatarData = (data: string) => {
    const [,mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  };

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 ${className}`}
      style={{ 
        backgroundColor: cores.cor,
        color: cores.texto,
        borderColor: cores.borda
      }}
    >
      <span className="font-semibold" style={{ color: cores.texto }}>
        {formatarData(data)}
      </span>
      {totalSegundos > 28800 && (
        <span 
          className="font-bold text-lg" 
          style={{ color: cores.texto }}
          data-tooltip-id="clock" 
          data-tooltip-content="Muitas horas alocadas neste dia"
        >
          <ClockAlert />
          <Tooltip id="clock" />
        </span>
      )}
      <div className="relative flex flex-col items-center justify-center w-28 h-9">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between">
          <div className="flex justify-end text-xs" style={{ color: cores.texto }}>
            <span className="mr-1 text-sm">plan</span>
            <span className="font-bold text-sm">{secondsToHHMM(totalSegundos)}</span>
          </div>
          <div className="flex justify-end text-xs" style={{ color: cores.texto }}>
            <span className="mr-1 text-sm">exec</span>
            <span className="font-bold text-sm">{secondsToHHMM(executedSegundos)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjaHoras;
import React from "react";

const AllocationLegend = () => {
  return (
    <div className="bg-slate-800/50 border-t border-slate-700/50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
            <span className="text-sm text-white">Alocação Normal (Entre 6 e 8h)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
            <span className="text-sm text-white">Alocação Parcial (Até 4h)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-400 to-red-500"></div>
            <span className="text-sm text-white">Alocação Excedente (acima de 8h)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationLegend; 
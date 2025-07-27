import React from "react";

const AllocationLegend = () => {
  return (
    <div className="bg-slate-50 border-t border-slate-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <span className="text-sm text-slate-700">Alocação Normal (até 8h)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
            <span className="text-sm text-slate-700">Alocação Parcial (menos de 8h)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gradient-to-r from-red-500 to-red-600"></div>
            <span className="text-sm text-slate-700">Hora Extra (acima de 8h)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationLegend; 
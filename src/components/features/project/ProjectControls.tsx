import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Plus } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface ProjectControlsProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onEntityChange: (entity: string) => void;
  onNewProject: () => void;
  statusOptions: SelectOption[];
  entityOptions: SelectOption[];
  selectedSearch: string;
  selectedStatus: string;
  selectedEntity: string;
}

const ProjectControls: React.FC<ProjectControlsProps> = ({
  onSearchChange,
  onStatusChange,
  onEntityChange,
  onNewProject,
  statusOptions,
  entityOptions,
  selectedSearch,
  selectedStatus,
  selectedEntity,
}) => {
  return (
    <div className="border-b border-slate-700/50 p-4 md:p-6">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Buscar por nome do projeto..."
            value={selectedSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full lg:w-64 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full lg:w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todos os Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entity Filter */}
          <Select value={selectedEntity} onValueChange={onEntityChange}>
            <SelectTrigger className="w-full lg:w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filtrar por entidade" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todas as Entidades</SelectItem>
              {entityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* New Project Button */}
        <Button onClick={onNewProject} className="bg-cyan-600 hover:bg-cyan-700 text-white w-full lg:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>
    </div>
  );
};

export default ProjectControls;
